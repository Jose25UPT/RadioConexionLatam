from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from datetime import date
from app.base_datos import SessionLocal, engine, Base
from app import modelos, esquemas
from app.utils import generar_slug, tags_a_json, json_a_tags
from app.auth import decodificar_token
import math
from app.rutas_auth import get_current_user
import json
from app.rutas_auth import require_role
from app import modelos as modelos_module

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# Crear las tablas en la base de datos (si aún no existen)
Base.metadata.create_all(bind=engine)

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
    limite: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Devuelve todas las noticias con filtros opcionales.
    """
    query = db.query(modelos.Noticia)
    
    # Filtrar por categoría
    if categoria and categoria.lower() != "todas":
        # Filtrar por nombre de categoría (case-insensitive)
        cat_nombre = categoria.strip().lower()
        query = query.join(modelos.Categoria, modelos.Categoria.id == modelos.Noticia.categoria_id, isouter=True)
        query = query.filter(func.lower(modelos.Categoria.nombre) == cat_nombre)
    
    # Filtrar por destacada
    if destacada is not None:
        query = query.filter(modelos.Noticia.destacada == destacada)
    
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
    
    # Convertir meta_keywords a tags de lista y reconstruir autor_info desde usuario
    for noticia in noticias:
        noticia.tags = [t.strip() for t in (noticia.meta_keywords or '').split(',') if t.strip()]
        # Mapeo de campos hacia el esquema esperado por el frontend
        noticia.imagen = noticia.imagen_principal
        noticia.fecha = noticia.fecha_publicacion
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

@router.get("/tags/", response_model=list[str])
def listar_tags(db: Session = Depends(get_db)):
    """
    Devuelve la lista de tags únicos (derivados de meta_keywords).
    """
    filas = (
        db.query(modelos.Noticia.meta_keywords)
        .filter(modelos.Noticia.meta_keywords != None)
        .all()
    )
    tags_set = set()
    for (mk,) in filas:
        if not mk:
            continue
        for t in mk.split(','):
            tt = t.strip()
            if tt:
                tags_set.add(tt)
    # Ordenar alfabéticamente ignorando mayúsculas/minúsculas
    return sorted(tags_set, key=lambda s: s.lower())

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
    
    # Incrementar vistas
    noticia.visitas = (noticia.visitas or 0) + 1
    db.commit()
    
    # Mapear respuesta
    noticia.tags = [t.strip() for t in (noticia.meta_keywords or '').split(',') if t.strip()]
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
    
    # Mapear respuesta
    noticia.tags = [t.strip() for t in (noticia.meta_keywords or '').split(',') if t.strip()]
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
    token: str | None = Depends(oauth2_scheme_optional)
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
    
    # Resolver usuario desde token
    user = None
    if token:
        try:
            payload = decodificar_token(token)
            if payload and payload.get("sub"):
                from app.rutas_auth import get_user_by_username_or_email
                user = get_user_by_username_or_email(db, payload["sub"])  # nombre o email
        except Exception:
            user = None

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

    # Preparar datos alineados al modelo
    datos_noticia = {
        'titulo': noticia.titulo,
        'slug': slug,
    # Limitar resumen a 50 caracteres (letras) para evitar overlays en frontend
    'resumen': _limitar_caracteres(noticia.resumen, 50),
        'contenido': noticia.contenido,
        'imagen_principal': noticia.imagen,
        'audio_url': noticia.audio_url,
        'categoria_id': categoria_id,
        'estado_id': estado_id,
        'destacada': bool(noticia.destacada),
        'permite_comentarios': bool(noticia.permitir_comentarios),
        'fecha_publicacion': noticia.fecha or date.today(),
        'meta_keywords': ','.join(noticia.tags or []) if noticia.tags else None,
    }
    if user:
        datos_noticia['autor_id'] = user.id

    # Calcular tiempo estimado de lectura (palabras/200 redondeado)
    palabras = len((noticia.contenido or '').split())
    datos_noticia['tiempo_lectura'] = max(1, math.ceil(palabras / 200)) if palabras else 0
    
    nueva = modelos.Noticia(**datos_noticia)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    
    # Mapear respuesta esperada por frontend
    nueva.tags = [t.strip() for t in (nueva.meta_keywords or '').split(',') if t.strip()]
    nueva.imagen = nueva.imagen_principal
    nueva.fecha = nueva.fecha_publicacion
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
    if datos.tags is not None:
        datos_actualizacion['meta_keywords'] = ','.join(datos.tags or [])

    # Se ignora autor_info en actualización (se deriva del autor_id)

    # Recalcular tiempo_lectura si cambia el contenido
    if 'contenido' in datos_actualizacion:
        palabras = len((datos_actualizacion['contenido'] or '').split())
        datos_actualizacion['tiempo_lectura'] = max(1, math.ceil(palabras / 200)) if palabras else 0
    
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
    obj.tags = [t.strip() for t in (obj.meta_keywords or '').split(',') if t.strip()]
    obj.imagen = obj.imagen_principal
    obj.fecha = obj.fecha_publicacion
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
        noticia.tags = [t.strip() for t in (noticia.meta_keywords or '').split(',') if t.strip()]
        noticia.imagen = noticia.imagen_principal
        noticia.fecha = noticia.fecha_publicacion
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
    return noticias


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
