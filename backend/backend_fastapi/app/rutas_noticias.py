from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from datetime import date
from app.base_datos import SessionLocal, engine, Base
from app import modelos, esquemas
from app.utils import generar_slug
from app.auth import decodificar_token
import math
from app.rutas_auth import get_current_user
import json
from app.rutas_auth import require_role
from app import modelos as modelos_module
import nh3

# Tags y atributos que CKEditor genera legítimamente
_HTML_TAGS = {
    'p', 'br', 'hr', 'strong', 'em', 'u', 's', 'b', 'i', 'mark',
    'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    'figure', 'figcaption', 'oembed',
    'span', 'div',
}
_HTML_ATTRS: dict[str, set[str]] = {
    'a':        {'href', 'title', 'target'},
    'img':      {'src', 'alt', 'width', 'height', 'class'},
    'figure':   {'class'},
    'figcaption': {'class'},
    'div':      {'class'},
    'span':     {'class'},
    'p':        {'class'},
    'h2':       {'class'}, 'h3': {'class'}, 'h4': {'class'},
    'ul':       {'class'}, 'ol': {'class'}, 'li': {'class'},
    'blockquote': {'class'},
    'pre':      {'class'}, 'code': {'class'},
    'table':    {'class'},
    'td':       {'colspan', 'rowspan', 'class'},
    'th':       {'colspan', 'rowspan', 'class'},
    'oembed':   {'url'},
}

def sanitizar_html(html: str | None) -> str | None:
    if not html:
        return html
    return nh3.clean(
        html,
        tags=_HTML_TAGS,
        attributes=_HTML_ATTRS,
        url_schemes={'https', 'http'},
        strip_comments=True,
        link_rel='noopener noreferrer',
    )

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# Asegurar que todas las tablas existen (incluye Nota y demás modelos nuevos)
try:
    Base.metadata.create_all(bind=engine)
except Exception as _e:
    print(f"[WARNING] create_all: {_e}")

router = APIRouter(
    prefix="/api/noticias",
    tags=["Noticias"],
    responses={404: {"description": "No encontrado"}}
)

# Utilidad: limitar a N caracteres (letras) de forma segura
def _limitar_caracteres(texto: str | None, max_len: int = 50) -> str | None:
    if texto is None:
        return None
    s = str(texto)
    if len(s) <= max_len:
        return s
    return s[:max_len]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[esquemas.NoticiaRespuesta])
def listar_noticias(
    categoria: str = None,
    destacada: bool = None,
    buscar: str = None,
    autor_id: int = None,
    limite: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Devuelve todas las noticias con filtros opcionales.
    """
    query = db.query(modelos.Noticia)
    # Mostrar solo noticias con estado 'publicado' en el endpoint público.
    # Interpretación: si la noticia no tiene estado (estado_id is NULL) la tratamos como publicada
    try:
        query = query.join(modelos.EstadoNoticia, modelos.EstadoNoticia.id == modelos.Noticia.estado_id, isouter=True)
        query = query.filter(
            or_(
                func.lower(modelos.EstadoNoticia.nombre) == 'publicado',
                modelos.Noticia.estado_id == None
            )
        )
    except Exception:
        # Si hay algún problema con la tabla de estados, no cortar la lista (compatibilidad)
        pass
    
    # Filtrar por categoría
    if categoria and categoria.lower() != "todas":
        # Filtrar por nombre de categoría (case-insensitive)
        cat_nombre = categoria.strip().lower()
        query = query.join(modelos.Categoria, modelos.Categoria.id == modelos.Noticia.categoria_id, isouter=True)
        query = query.filter(func.lower(modelos.Categoria.nombre) == cat_nombre)
    
    # Filtrar por destacada
    if destacada is not None:
        query = query.filter(modelos.Noticia.destacada == destacada)

    # Filtrar por autor
    if autor_id is not None:
        query = query.filter(modelos.Noticia.autor_id == autor_id)
    
    # Búsqueda en título y contenido
    if buscar:
        query = query.filter(
            or_(
                modelos.Noticia.titulo.contains(buscar),
                modelos.Noticia.contenido.contains(buscar),
                modelos.Noticia.resumen.contains(buscar)
            )
        )
    
    # Aplicar paginación y ordenamiento
    noticias = (
        query.order_by(modelos.Noticia.fecha_publicacion.desc())
        .offset(offset)
        .limit(limite)
        .all()
    )
    
    for noticia in noticias:
        noticia.imagen = noticia.imagen_principal
        noticia.fecha = noticia.fecha_publicacion
        noticia.vistas = noticia.visitas or 0
        noticia.compartidos = noticia.shares or 0
        # Categoría por nombre
        if noticia.categoria_id:
            cat = db.query(modelos.Categoria).get(noticia.categoria_id)
            noticia.categoria = cat.nombre if cat else None
        # Autor info desde relación usuario
        if noticia.autor_id:
            u = db.query(modelos.Usuario).get(noticia.autor_id)
            if u:
                noticia.autor_info = esquemas.AutorInfo(
                    nombre=u.nombre_usuario,
                    titulo=u.titulo,
                    descripcion=u.biografia,
                    avatar=u.avatar,
                    nivel=u.nivel,
                    experiencia_años=u.experiencia_años,
                    articulos_total=u.articulos_publicados,
                    seguidores=u.seguidores,
                    precision=u.precision_rating,
                    especialidades=u.especialidades or [],
                    logros=u.logros or [],
                    top_anime=u.anime_favoritos or [],
                    redes_sociales=u.redes_sociales or {},
                    frase=u.frase_personal,
                )
        # Normalizar estado textual: si no hay estado explícito, considerarlo 'publicado' para el endpoint público
        if noticia.estado_id:
            est = db.get(modelos.EstadoNoticia, noticia.estado_id)
            noticia.estado = est.nombre if est else None
        else:
            noticia.estado = 'publicado'
    
    return noticias

@router.get("/categorias/", response_model=list[str])
def listar_categorias(db: Session = Depends(get_db)):
    """
    Devuelve la lista de categorías únicas.
    """
    filas = (
        db.query(modelos.Categoria.nombre)
        .filter(modelos.Categoria.activa == True)
        .order_by(modelos.Categoria.orden_display, modelos.Categoria.nombre)
        .all()
    )
    return [fila[0] for fila in filas if fila and fila[0]]

@router.post("/categorias/", status_code=201)
def crear_categoria(nombre: str, db: Session = Depends(get_db), _u: modelos.Usuario = Depends(require_role(["admin", "editor"]))):
    nombre = nombre.strip()
    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")
    cat_slug = generar_slug(nombre)
    existente = db.query(modelos.Categoria).filter(modelos.Categoria.slug == cat_slug).first()
    if existente:
        if not existente.activa:
            existente.activa = True
            db.commit()
            return {"nombre": existente.nombre}
        raise HTTPException(status_code=409, detail="La categoría ya existe")
    nueva = modelos.Categoria(nombre=nombre, slug=cat_slug, activa=True)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return {"nombre": nueva.nombre}

@router.delete("/categorias/", status_code=204)
def eliminar_categoria(nombre: str, db: Session = Depends(get_db), _u: modelos.Usuario = Depends(require_role(["admin", "editor"]))):
    nombre_lower = nombre.strip().lower()
    cat = db.query(modelos.Categoria).filter(
        func.lower(modelos.Categoria.nombre) == nombre_lower
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    en_uso = db.query(modelos.Noticia).filter(modelos.Noticia.categoria_id == cat.id).first()
    if en_uso:
        raise HTTPException(status_code=409, detail="No se puede eliminar: hay noticias usando esta categoría")
    db.delete(cat)
    db.commit()

@router.get("/tags/", response_model=list[str])
def listar_tags(db: Session = Depends(get_db)):
    """
    Tags fueron removidos del modelo; retornar lista vacía para compatibilidad.
    """
    return []

@router.post("/{noticia_id}/vista", status_code=200)
def registrar_vista(noticia_id: int, db: Session = Depends(get_db)):
    noticia = db.query(modelos.Noticia).filter(modelos.Noticia.id == noticia_id).first()
    if noticia:
        noticia.visitas = (noticia.visitas or 0) + 1
        db.commit()
    return {"ok": True}

@router.get("/slug/{slug}", response_model=esquemas.NoticiaRespuesta)
def obtener_noticia_por_slug(slug: str, db: Session = Depends(get_db)):
    """
    Devuelve una noticia por su slug.
    """
    noticia = db.query(modelos.Noticia).filter(modelos.Noticia.slug == slug).first()
    if not noticia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Noticia no encontrada"
        )
    # Solo permitir ver noticias publicadas en este endpoint público
    try:
        if noticia.estado_id:
            est = db.get(modelos.EstadoNoticia, noticia.estado_id)
            if est and str(est.nombre).strip().lower() != 'publicado':
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Noticia no encontrada")
    except HTTPException:
        raise
    except Exception:
        # Si hay error comprobando estado, continuar (compatibilidad)
        pass
    
    # Las vistas se registran desde el frontend tras 40 segundos de lectura real
    
    # Mapear respuesta (tags removed)
    noticia.imagen = noticia.imagen_principal
    noticia.fecha = noticia.fecha_publicacion
    noticia.vistas = noticia.visitas or 0
    noticia.compartidos = noticia.shares or 0
    if noticia.categoria_id:
        cat = db.get(modelos.Categoria, noticia.categoria_id)
        noticia.categoria = cat.nombre if cat else None
    if noticia.autor_id:
        u = db.get(modelos.Usuario, noticia.autor_id)
        if u:
            noticia.autor_info = esquemas.AutorInfo(
                nombre=u.nombre_usuario,
                titulo=u.titulo,
                descripcion=u.biografia,
                avatar=u.avatar,
                nivel=u.nivel,
                experiencia_años=u.experiencia_años,
                articulos_total=u.articulos_publicados,
                seguidores=u.seguidores,
                precision=u.precision_rating,
                especialidades=u.especialidades or [],
                logros=u.logros or [],
                top_anime=u.anime_favoritos or [],
                redes_sociales=u.redes_sociales or {},
                frase=u.frase_personal,
            )
    # Añadir info de última edición desde el historial
    last = db.query(modelos.NoticiaHistorial).filter(modelos.NoticiaHistorial.noticia_id == noticia.id).order_by(modelos.NoticiaHistorial.created_at.desc()).first()
    if last:
        if last.usuario_id:
            u = db.get(modelos.Usuario, last.usuario_id)
            noticia.last_edited_by = u.nombre_usuario if u else None
        noticia.last_edited_at = last.created_at
    
    return noticia

@router.get("/{noticia_id}", response_model=esquemas.NoticiaRespuesta)
def obtener_noticia(noticia_id: int, db: Session = Depends(get_db)):
    """
    Devuelve una noticia por su ID.
    """
    noticia = db.get(modelos.Noticia, noticia_id)
    if not noticia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Noticia no encontrada"
        )
    # Endpoint público por ID: sólo publicar si estado == 'publicado'
    try:
        if noticia.estado_id:
            est = db.get(modelos.EstadoNoticia, noticia.estado_id)
            if est and str(est.nombre).strip().lower() != 'publicado':
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Noticia no encontrada")
    except HTTPException:
        raise
    except Exception:
        pass
    
    # Mapear respuesta (tags removed)
    noticia.imagen = noticia.imagen_principal
    noticia.fecha = noticia.fecha_publicacion
    noticia.vistas = noticia.visitas or 0
    noticia.compartidos = noticia.shares or 0
    if noticia.categoria_id:
        cat = db.get(modelos.Categoria, noticia.categoria_id)
        noticia.categoria = cat.nombre if cat else None
    if noticia.autor_id:
        u = db.get(modelos.Usuario, noticia.autor_id)
        if u:
            noticia.autor_info = esquemas.AutorInfo(
                nombre=u.nombre_usuario,
                titulo=u.titulo,
                descripcion=u.biografia,
                avatar=u.avatar,
                nivel=u.nivel,
                experiencia_años=u.experiencia_años,
                articulos_total=u.articulos_publicados,
                seguidores=u.seguidores,
                precision=u.precision_rating,
                especialidades=u.especialidades or [],
                logros=u.logros or [],
                top_anime=u.anime_favoritos or [],
                redes_sociales=u.redes_sociales or {},
                frase=u.frase_personal,
            )
    # Añadir info de última edición desde el historial
    last = db.query(modelos.NoticiaHistorial).filter(modelos.NoticiaHistorial.noticia_id == noticia.id).order_by(modelos.NoticiaHistorial.created_at.desc()).first()
    if last:
        if last.usuario_id:
            u = db.get(modelos.Usuario, last.usuario_id)
            noticia.last_edited_by = u.nombre_usuario if u else None
        noticia.last_edited_at = last.created_at

    return noticia

@router.post("/", response_model=esquemas.NoticiaRespuesta, status_code=status.HTTP_201_CREATED)
def crear_noticia(
    noticia: esquemas.NoticiaCrear,
    db: Session = Depends(get_db),
    user: modelos.Usuario = Depends(get_current_user)
):
    """
    Crea una nueva noticia.
    """
    # Generar slug único
    slug_base = generar_slug(noticia.titulo)
    slug = slug_base
    contador = 1

    # Verificar que el slug sea único
    while db.query(modelos.Noticia).filter(modelos.Noticia.slug == slug).first():
        slug = f"{slug_base}-{contador}"
        contador += 1

    # Resolver categoría
    categoria_id = None
    if noticia.categoria:
        cat_nombre = noticia.categoria.strip()
        if cat_nombre:
            from app.modelos import Categoria
            cat_slug = generar_slug(cat_nombre)
            categoria = db.query(modelos.Categoria).filter(modelos.Categoria.slug == cat_slug).first()
            if not categoria:
                categoria = modelos.Categoria(nombre=cat_nombre, slug=cat_slug)
                db.add(categoria)
                db.commit()
                db.refresh(categoria)
            categoria_id = categoria.id

    # Resolver estado por defecto ('publicado') para evitar FK inválido
    estado_id = None
    try:
        estado = db.query(modelos.EstadoNoticia).filter(func.lower(modelos.EstadoNoticia.nombre) == 'publicado').first()
        if not estado:
            estado = modelos.EstadoNoticia(nombre='publicado', descripcion='Publicado', color_hex='#28a745', activo=True)
            db.add(estado)
            db.commit()
            db.refresh(estado)
        estado_id = estado.id
    except Exception:
        estado_id = None

    datos_noticia = {
        'titulo': noticia.titulo,
        'slug': slug,
        # Limitar resumen a 50 caracteres (letras) para evitar overlays en frontend
        'resumen': _limitar_caracteres(noticia.resumen, 50),
        'contenido': sanitizar_html(noticia.contenido),
        'imagen_principal': noticia.imagen,
        'audio_url': noticia.audio_url,
        'categoria_id': categoria_id,
        'estado_id': estado_id,
        'destacada': bool(noticia.destacada),
        'permite_comentarios': bool(noticia.permitir_comentarios),
        'fecha_publicacion': noticia.fecha or date.today(),
        'destacado': getattr(noticia, 'destacado', None),
    }
    # If the client provided an 'estado' string, attempt to resolve it to estado_id
    if getattr(noticia, 'estado', None):
        try:
            est_name = str(noticia.estado).strip().lower()
            est = db.query(modelos.EstadoNoticia).filter(func.lower(modelos.EstadoNoticia.nombre) == est_name).first()
            if not est:
                est = modelos.EstadoNoticia(nombre=noticia.estado, descripcion=noticia.estado, activo=True)
                db.add(est)
                db.commit()
                db.refresh(est)
            datos_noticia['estado_id'] = est.id
        except Exception:
            pass
    # Validar que la imagen no sea una URL externa (solo rutas relativas internas o blob)
    img_val = datos_noticia.get('imagen_principal')
    if img_val:
        if isinstance(img_val, str) and img_val.strip().startswith('http'):
            # Rechazar URLs absolutas para forzar uso de subida de archivos
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Solo se aceptan imágenes subidas; por favor use el botón de subir imagen.")
    datos_noticia['autor_id'] = user.id

    # Calcular tiempo estimado de lectura (palabras/200 redondeado)
    palabras = len((noticia.contenido or '').split())
    datos_noticia['tiempo_lectura'] = max(1, math.ceil(palabras / 200)) if palabras else 0
    
    nueva = modelos.Noticia(**datos_noticia)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    
    # Mapear respuesta esperada por frontend
    nueva.imagen = nueva.imagen_principal
    nueva.fecha = nueva.fecha_publicacion
    nueva.destacado = nueva.destacado
    # map estado name
    if nueva.estado_id:
        est = db.get(modelos.EstadoNoticia, nueva.estado_id)
        nueva.estado = est.nombre if est else None
    if nueva.categoria_id:
        cat = db.get(modelos.Categoria, nueva.categoria_id)
        nueva.categoria = cat.nombre if cat else None
    if nueva.autor_id:
        u = db.get(modelos.Usuario, nueva.autor_id)
        if u:
            nueva.autor_info = esquemas.AutorInfo(
                nombre=u.nombre_usuario,
                titulo=u.titulo,
                descripcion=u.biografia,
                avatar=u.avatar,
                nivel=u.nivel,
                experiencia_años=u.experiencia_años,
                articulos_total=u.articulos_publicados,
                seguidores=u.seguidores,
                precision=u.precision_rating,
                especialidades=u.especialidades or [],
                logros=u.logros or [],
                top_anime=u.anime_favoritos or [],
                redes_sociales=u.redes_sociales or {},
                frase=u.frase_personal,
            )
    
    # Registrar historial de creación
    try:
        hist = modelos.NoticiaHistorial(
            noticia_id=nueva.id,
            usuario_id=nueva.autor_id,
            accion='create',
            cambios={'after': {
                'titulo': nueva.titulo,
                'slug': nueva.slug,
                'resumen': nueva.resumen
            }}
        )
        db.add(hist)
        db.commit()
    except Exception:
        db.rollback()

    return nueva

@router.put("/{noticia_id}", response_model=esquemas.NoticiaRespuesta)
def actualizar_noticia(noticia_id: int, datos: esquemas.NoticiaActualizar, db: Session = Depends(get_db), user: modelos.Usuario = Depends(get_current_user)):
    """
    Actualiza una noticia existente.
    """
    obj = db.get(modelos.Noticia, noticia_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Noticia no encontrada"
        )
    # Authorization: only admin/editor or the original author can update
    user_role_name = None
    if user and user.rol_id:
        rol = db.query(modelos.Rol).get(user.rol_id)
        user_role_name = rol.nombre if rol else None

    if user_role_name not in ("admin", "editor") and obj.autor_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permisos insuficientes para editar esta noticia")
    
    datos_actualizacion = datos.model_dump(exclude_unset=True, exclude={'tags', 'autor_info', 'articulos_relacionados'})
    # Limitar resumen por caracteres si viene en actualización
    if 'resumen' in datos_actualizacion and datos_actualizacion['resumen'] is not None:
        datos_actualizacion['resumen'] = _limitar_caracteres(datos_actualizacion['resumen'], 50)
    # Mapear campos del esquema hacia el modelo real
    if 'imagen' in datos_actualizacion:
        datos_actualizacion['imagen_principal'] = datos_actualizacion.pop('imagen')
    if 'fecha' in datos_actualizacion:
        datos_actualizacion['fecha_publicacion'] = datos_actualizacion.pop('fecha')
    if 'permitir_comentarios' in datos_actualizacion:
        datos_actualizacion['permite_comentarios'] = bool(datos_actualizacion.pop('permitir_comentarios'))
    if 'destacado' in datos_actualizacion:
        # textual destacado
        datos_actualizacion['destacado'] = datos_actualizacion.get('destacado')
    if 'categoria' in datos_actualizacion and datos_actualizacion['categoria']:
        cat_nombre = str(datos_actualizacion.pop('categoria')).strip()
        cat_slug = generar_slug(cat_nombre)
        categoria = db.query(modelos.Categoria).filter(modelos.Categoria.slug == cat_slug).first()
        if not categoria:
            categoria = modelos.Categoria(nombre=cat_nombre, slug=cat_slug)
            db.add(categoria)
            db.commit()
            db.refresh(categoria)
        datos_actualizacion['categoria_id'] = categoria.id

    # Permitir que ADMIN cambie el autor de la noticia
    if getattr(datos, 'autor_id', None) is not None and user_role_name == 'admin':
        nuevo_autor_id = datos.autor_id
        if nuevo_autor_id:
            # Validar que el usuario exista y esté activo
            u = db.get(modelos.Usuario, nuevo_autor_id)
            if not u or not u.activo:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="autor_id inválido")
            datos_actualizacion['autor_id'] = nuevo_autor_id
        else:
            # Permitir dejar autor en null si se envía 0 o None
            datos_actualizacion['autor_id'] = None
    
    # Actualizar slug si se cambió el título
    if 'titulo' in datos_actualizacion:
        nuevo_slug = generar_slug(datos_actualizacion['titulo'])
        # Verificar unicidad del slug
        slug_existente = db.query(modelos.Noticia).filter(
            modelos.Noticia.slug == nuevo_slug,
            modelos.Noticia.id != noticia_id
        ).first()
        
        if not slug_existente:
            datos_actualizacion['slug'] = nuevo_slug
    
    # Actualizar tags si se proporcionan
    # Tags removed: no longer accepted

    # Mapear estado si se proporciona como string
    if 'estado' in datos_actualizacion and datos_actualizacion.get('estado') is not None:
        try:
            est_name = str(datos_actualizacion.pop('estado')).strip().lower()
            est = db.query(modelos.EstadoNoticia).filter(func.lower(modelos.EstadoNoticia.nombre) == est_name).first()
            if not est:
                est = modelos.EstadoNoticia(nombre=est_name, descripcion=est_name, activo=True)
                db.add(est)
                db.commit()
                db.refresh(est)
            datos_actualizacion['estado_id'] = est.id
        except Exception:
            pass

    # Se ignora autor_info en actualización (se deriva del autor_id)

    # Sanitizar y recalcular tiempo_lectura si cambia el contenido
    if 'contenido' in datos_actualizacion:
        datos_actualizacion['contenido'] = sanitizar_html(datos_actualizacion['contenido'])
        palabras = len((datos_actualizacion['contenido'] or '').split())
        datos_actualizacion['tiempo_lectura'] = max(1, math.ceil(palabras / 200)) if palabras else 0

    # Validar que la imagen no sea una URL externa (solo rutas relativas internas o blob)
    if 'imagen_principal' in datos_actualizacion:
        img_val = datos_actualizacion.get('imagen_principal')
        if img_val and isinstance(img_val, str) and img_val.strip().startswith('http'):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Solo se aceptan imágenes subidas; por favor use el botón de subir imagen.")
    
    for campo, valor in datos_actualizacion.items():
        setattr(obj, campo, valor)
    # Capturar antes y después para el historial
    before = {
        'titulo': obj.titulo,
        'slug': obj.slug,
        'resumen': obj.resumen,
        'contenido': obj.contenido,
        'imagen_principal': obj.imagen_principal,
        'categoria_id': obj.categoria_id,
        'destacada': obj.destacada,
    }

    for campo, valor in datos_actualizacion.items():
        setattr(obj, campo, valor)

    db.commit()
    db.refresh(obj)

    after = {
        'titulo': obj.titulo,
        'slug': obj.slug,
        'resumen': obj.resumen,
        'contenido': obj.contenido,
        'imagen_principal': obj.imagen_principal,
        'categoria_id': obj.categoria_id,
        'destacada': obj.destacada,
        'destacado': obj.destacado,
    }

    try:
        hist = modelos.NoticiaHistorial(
            noticia_id=obj.id,
            usuario_id=user.id if user else None,
            accion='update',
            cambios={'before': before, 'after': after}
        )
        db.add(hist)
        db.commit()
    except Exception:
        db.rollback()
    
    # Mapear respuesta
    obj.imagen = obj.imagen_principal
    obj.fecha = obj.fecha_publicacion
    obj.destacado = obj.destacado
    if obj.estado_id:
        est = db.get(modelos.EstadoNoticia, obj.estado_id)
        obj.estado = est.nombre if est else None
    if obj.categoria_id:
        cat = db.get(modelos.Categoria, obj.categoria_id)
        obj.categoria = cat.nombre if cat else None
    if obj.autor_id:
        u = db.get(modelos.Usuario, obj.autor_id)
        if u:
            obj.autor_info = esquemas.AutorInfo(
                nombre=u.nombre_usuario,
                titulo=u.titulo,
                descripcion=u.biografia,
                avatar=u.avatar,
                nivel=u.nivel,
                experiencia_años=u.experiencia_años,
                articulos_total=u.articulos_publicados,
                seguidores=u.seguidores,
                precision=u.precision_rating,
                especialidades=u.especialidades or [],
                logros=u.logros or [],
                top_anime=u.anime_favoritos or [],
                redes_sociales=u.redes_sociales or {},
                frase=u.frase_personal,
            )
    
    return obj

@router.delete("/{noticia_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_noticia(noticia_id: int, db: Session = Depends(get_db), user: modelos.Usuario = Depends(get_current_user)):
    """
    Elimina una noticia por su ID.
    """
    obj = db.get(modelos.Noticia, noticia_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Noticia no encontrada"
        )
    # Authorization: only admin/editor or the original author can delete
    user_role_name = None
    if user and user.rol_id:
        rol = db.query(modelos.Rol).get(user.rol_id)
        user_role_name = rol.nombre if rol else None

    if user_role_name not in ("admin", "editor") and obj.autor_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permisos insuficientes para eliminar esta noticia")

    # Guardar estado previo en historial
    try:
        before = {
            'titulo': obj.titulo,
            'slug': obj.slug,
            'resumen': obj.resumen,
            'contenido': obj.contenido,
        }
        hist = modelos.NoticiaHistorial(
            noticia_id=obj.id,
            usuario_id=user.id if user else None,
            accion='delete',
            cambios={'before': before}
        )
        db.add(hist)
        db.commit()
    except Exception:
        db.rollback()

    db.delete(obj)
    db.commit()

@router.get("/estadisticas/resumen")
def obtener_estadisticas(db: Session = Depends(get_db)):
    """
    Devuelve estadísticas básicas de las noticias.
    """
    total_noticias = db.query(modelos.Noticia).count()
    noticias_destacadas = db.query(modelos.Noticia).filter(modelos.Noticia.destacada == True).count()
    total_vistas = db.query(func.sum(modelos.Noticia.visitas)).scalar() or 0
    total_likes = db.query(func.sum(modelos.Noticia.likes)).scalar() or 0
    
    return {
        "total_noticias": total_noticias,
        "noticias_destacadas": noticias_destacadas,
        "total_vistas": total_vistas,
        "total_likes": total_likes,
        "promedio_vistas": round(total_vistas / total_noticias, 2) if total_noticias > 0 else 0
    }


@router.get("/admin/all", response_model=list[esquemas.NoticiaRespuesta])
def listar_noticias_admin(db: Session = Depends(get_db), _u: modelos.Usuario = Depends(require_role(["admin", "editor"]))):
    """
    Devuelve todas las noticias (uso interno admin/editor).
    """
    noticias = db.query(modelos.Noticia).order_by(modelos.Noticia.fecha_publicacion.desc()).all()
    for noticia in noticias:
        noticia.imagen = noticia.imagen_principal
        noticia.fecha = noticia.fecha_publicacion
        noticia.vistas = noticia.visitas or 0
        noticia.compartidos = noticia.shares or 0
        if noticia.categoria_id:
            cat = db.get(modelos.Categoria, noticia.categoria_id)
            noticia.categoria = cat.nombre if cat else None
        if noticia.autor_id:
            u = db.get(modelos.Usuario, noticia.autor_id)
            if u:
                noticia.autor_info = esquemas.AutorInfo(
                    nombre=u.nombre_usuario,
                    titulo=u.titulo,
                    descripcion=u.biografia,
                    avatar=u.avatar,
                    nivel=u.nivel,
                    experiencia_años=u.experiencia_años,
                    articulos_total=u.articulos_publicados,
                    seguidores=u.seguidores,
                    precision=u.precision_rating,
                    especialidades=u.especialidades or [],
                    logros=u.logros or [],
                    top_anime=u.anime_favoritos or [],
                    redes_sociales=u.redes_sociales or {},
                    frase=u.frase_personal,
                )
        # Attach last edit info
        last = db.query(modelos.NoticiaHistorial).filter(modelos.NoticiaHistorial.noticia_id == noticia.id).order_by(modelos.NoticiaHistorial.created_at.desc()).first()
        if last:
            if last.usuario_id:
                uu = db.get(modelos.Usuario, last.usuario_id)
                noticia.last_edited_by = uu.nombre_usuario if uu else None
            noticia.last_edited_at = last.created_at
        # Añadir estado textual para admin (si existe) o marcar como 'publicado' por defecto
        if noticia.estado_id:
            est = db.get(modelos.EstadoNoticia, noticia.estado_id)
            noticia.estado = est.nombre if est else 'publicado'
        else:
            noticia.estado = 'publicado'
    return noticias


@router.get("/admin/{noticia_id}", response_model=esquemas.NoticiaRespuesta)
def obtener_noticia_admin(noticia_id: int, db: Session = Depends(get_db), _u: modelos.Usuario = Depends(require_role(["admin", "editor"]))):
    """
    Devuelve una noticia sin aplicar el filtro público (solo para admin/editor).
    """
    noticia = db.get(modelos.Noticia, noticia_id)
    if not noticia:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Noticia no encontrada")

    # Mapear respuesta sin filtrar por estado
    noticia.imagen = noticia.imagen_principal
    noticia.fecha = noticia.fecha_publicacion
    noticia.vistas = noticia.visitas or 0
    noticia.compartidos = noticia.shares or 0
    if noticia.categoria_id:
        cat = db.get(modelos.Categoria, noticia.categoria_id)
        noticia.categoria = cat.nombre if cat else None
    if noticia.autor_id:
        u = db.get(modelos.Usuario, noticia.autor_id)
        if u:
            noticia.autor_info = esquemas.AutorInfo(
                nombre=u.nombre_usuario,
                titulo=u.titulo,
                descripcion=u.biografia,
                avatar=u.avatar,
                nivel=u.nivel,
                experiencia_años=u.experiencia_años,
                articulos_total=u.articulos_publicados,
                seguidores=u.seguidores,
                precision=u.precision_rating,
                especialidades=u.especialidades or [],
                logros=u.logros or [],
                top_anime=u.anime_favoritos or [],
                redes_sociales=u.redes_sociales or {},
                frase=u.frase_personal,
            )
    # Añadir info de última edición desde el historial
    last = db.query(modelos.NoticiaHistorial).filter(modelos.NoticiaHistorial.noticia_id == noticia.id).order_by(modelos.NoticiaHistorial.created_at.desc()).first()
    if last:
        if last.usuario_id:
            u = db.get(modelos.Usuario, last.usuario_id)
            noticia.last_edited_by = u.nombre_usuario if u else None
        noticia.last_edited_at = last.created_at

    # Añadir estado textual
    if noticia.estado_id:
        est = db.get(modelos.EstadoNoticia, noticia.estado_id)
        noticia.estado = est.nombre if est else 'publicado'
    else:
        noticia.estado = 'publicado'

    return noticia


@router.get("/{noticia_id}/historial", response_model=list[esquemas.NoticiaHistorialItem])
def obtener_historial_noticia(noticia_id: int, limite: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    """
    Devuelve el historial de cambios para una noticia (más reciente primero).
    """
    filas = (
        db.query(modelos.NoticiaHistorial)
        .filter(modelos.NoticiaHistorial.noticia_id == noticia_id)
        .order_by(modelos.NoticiaHistorial.created_at.desc())
        .offset(offset)
        .limit(limite)
        .all()
    )
    resultados = []
    for f in filas:
        usuario_nombre = None
        if f.usuario_id:
            u = db.get(modelos.Usuario, f.usuario_id)
            usuario_nombre = u.nombre_usuario if u else None
        resultados.append({
            'id': f.id,
            'noticia_id': f.noticia_id,
            'usuario_id': f.usuario_id,
            'usuario_nombre': usuario_nombre,
            'accion': f.accion,
            'cambios': f.cambios,
            'comentario': f.comentario,
            'created_at': f.created_at,
        })
    return resultados

@router.post("/{noticia_id}/like")
def dar_like_noticia(noticia_id: int, db: Session = Depends(get_db)):
    """
    Incrementa el contador de likes de una noticia.
    """
    noticia = db.get(modelos.Noticia, noticia_id)
    if not noticia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Noticia no encontrada"
        )
    
    noticia.likes += 1
    db.commit()
    
    return {"likes": noticia.likes, "mensaje": "Like agregado correctamente"}
