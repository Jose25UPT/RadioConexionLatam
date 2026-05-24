from sqlalchemy import Column, Integer, String, Text, Date, Boolean, DateTime, Float, ForeignKey, event, LargeBinary
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY, INET
from app.base_datos import Base, SessionLocal

class Rol(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    permisos = Column(JSONB, default={})
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    slug = Column(String(120), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    color_hex = Column(String(7), default='#007bff')
    icono = Column(String(50), nullable=True)
    orden_display = Column(Integer, default=0)
    activa = Column(Boolean, default=True)
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

class EstadoNoticia(Base):
    __tablename__ = "estados_noticia"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    color_hex = Column(String(7), default='#28a745')
    activo = Column(Boolean, default=True)

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(UUID(as_uuid=True), unique=True, server_default=func.uuid_generate_v4())
    nombre_usuario = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    
    # Información del perfil
    nombre_completo = Column(String(200), nullable=True)
    avatar = Column(Text, nullable=True)
    avatar_blob = Column(LargeBinary, nullable=True)
    titulo = Column(String(150), nullable=True)
    biografia = Column(Text, nullable=True)
    frase_personal = Column(Text, nullable=True)
    
    # Redes sociales y especialidades
    redes_sociales = Column(JSONB, default={})
    especialidades = Column(ARRAY(Text), nullable=True)
    logros = Column(ARRAY(Text), nullable=True)
    anime_favoritos = Column(ARRAY(Text), nullable=True)
    
    # Métricas del usuario
    nivel = Column(Integer, default=1)
    experiencia_años = Column(Integer, default=0)
    articulos_publicados = Column(Integer, default=0)
    seguidores = Column(Integer, default=0)
    precision_rating = Column(Integer, default=85)
    
    # Estados y control
    activo = Column(Boolean, default=True)
    verificado = Column(Boolean, default=False)
    ultima_conexion = Column(DateTime(timezone=True), nullable=True)
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relación con noticias
    noticias = relationship("Noticia", back_populates="autor_usuario")

class Noticia(Base):
    __tablename__ = "noticias"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(UUID(as_uuid=True), unique=True, server_default=func.uuid_generate_v4())
    titulo = Column(String(300), nullable=False)
    slug = Column(String(350), unique=True, index=True, nullable=False)
    resumen = Column(Text, nullable=True)
    contenido = Column(Text, nullable=False)
    imagen_principal = Column(Text, nullable=True)
    imagen_blob = Column(LargeBinary, nullable=True)
    galeria_imagenes = Column(JSONB, default=[])
    audio_url = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=True)
    autor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    estado_id = Column(Integer, ForeignKey("estados_noticia.id"), default=1)
    fecha_publicacion = Column(Date, nullable=False, server_default=func.current_date())
    fecha_programada = Column(DateTime(timezone=True), nullable=True)
    visitas = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    tiempo_lectura = Column(Integer, default=0)
    destacada = Column(Boolean, default=False)
    permite_comentarios = Column(Boolean, default=True)
    comentarios_moderados = Column(Boolean, default=True)
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(500), nullable=True)
    meta_keywords = Column(Text, nullable=True)
    datos_estructurados = Column(JSONB, default={})
    destacado = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relación con usuarios
    autor_usuario = relationship("Usuario", back_populates="noticias")

    def __init__(self, **kwargs):
        # Permitir recibir la clave 'autor' desde scripts antiguos (p.ej. poblar_db.py)
        autor_val = kwargs.pop('autor', None)
        fecha_val = kwargs.pop('fecha', None)
        imagen_val = kwargs.pop('imagen', None)
        categoria_val = kwargs.pop('categoria', None)
        programa_val = kwargs.pop('programa', None)
        vistas_val = kwargs.pop('vistas', None)
        comentarios_val = kwargs.pop('comentarios', None)

        super().__init__(**kwargs)

        if autor_val:
            # Guardar temporalmente el nombre del autor; un listener antes de insertar
            # resolverá/creará el usuario y asignará `autor_id`.
            setattr(self, '_autor_nombre_tmp', autor_val)
        if fecha_val:
            setattr(self, '_fecha_tmp', fecha_val)
        if imagen_val:
            setattr(self, '_imagen_tmp', imagen_val)
        if categoria_val:
            setattr(self, '_categoria_tmp', categoria_val)
        if programa_val:
            setattr(self, '_programa_tmp', programa_val)
        if vistas_val is not None:
            setattr(self, '_vistas_tmp', vistas_val)
        if comentarios_val is not None:
            setattr(self, '_comentarios_tmp', comentarios_val)

class Comentario(Base):
    __tablename__ = "comentarios"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(UUID(as_uuid=True), unique=True, server_default=func.uuid_generate_v4())
    noticia_id = Column(Integer, ForeignKey("noticias.id"), nullable=True)
    padre_id = Column(Integer, ForeignKey("comentarios.id"), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    autor_nombre = Column(String(100), nullable=True)
    autor_email = Column(String(255), nullable=True)
    autor_avatar = Column(Text, nullable=True)
    contenido = Column(Text, nullable=False)
    tiene_spoilers = Column(Boolean, default=False)
    aprobado = Column(Boolean, default=False)
    spam = Column(Boolean, default=False)
    reportado = Column(Boolean, default=False)
    likes = Column(Integer, default=0)
    respuestas_count = Column(Integer, default=0)
    ip_address = Column(INET, nullable=True)  # para IPv4 e IPv6
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# Listener: antes de insertar una Noticia, si se proporcionó un nombre en
# la clave 'autor' (almacenado en `_autor_nombre_tmp`), buscamos o creamos
# el usuario y asignamos `autor_id` para mantener compatibilidad con
# `poblar_db.py` sin modificarlo.
@event.listens_for(Noticia, 'before_insert')
def _noticia_before_insert(mapper, connection, target):
    autor_nombre = getattr(target, '_autor_nombre_tmp', None)
    fecha_tmp = getattr(target, '_fecha_tmp', None)
    imagen_tmp = getattr(target, '_imagen_tmp', None)
    categoria_tmp = getattr(target, '_categoria_tmp', None)
    if not autor_nombre:
        # si no hay autor, aún podemos procesar otras temporales
        pass

    db = SessionLocal()
    try:
        if autor_nombre:
            # Buscar por nombre completo o nombre de usuario
            usuario = db.query(Usuario).filter(
                (Usuario.nombre_completo == autor_nombre) | (Usuario.nombre_usuario == autor_nombre)
            ).first()
            if not usuario:
                nombre_usuario = autor_nombre.replace(' ', '').lower()[:100]
                email = f"{nombre_usuario}@example.local"
                usuario = Usuario(
                    nombre_usuario=nombre_usuario,
                    email=email,
                    password_hash='devpassword',
                    nombre_completo=autor_nombre,
                )
                db.add(usuario)
                db.commit()
                db.refresh(usuario)

            target.autor_id = usuario.id

        if fecha_tmp:
            try:
                # esperar objeto tipo date en el script; asignar a fecha_publicacion
                target.fecha_publicacion = fecha_tmp
            except Exception:
                pass

        if imagen_tmp:
            target.imagen_principal = imagen_tmp

        if categoria_tmp:
            # Resolver o crear categoría
            from app.utils import generar_slug
            cat = db.query(Categoria).filter(Categoria.nombre == categoria_tmp).first()
            if not cat:
                cat = Categoria(nombre=categoria_tmp, slug=generar_slug(categoria_tmp))
                db.add(cat)
                db.commit()
                db.refresh(cat)
            target.categoria_id = cat.id

        # votos/estadísticas simples
        vistas_tmp = getattr(target, '_vistas_tmp', None)
        if vistas_tmp is not None:
            try:
                target.visitas = int(vistas_tmp)
            except Exception:
                pass

    finally:
        db.close()

class Nota(Base):
    __tablename__ = "notas"

    id = Column(Integer, primary_key=True, index=True)
    contenido = Column(String(2000), nullable=False)
    autor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    activa = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    autor = relationship("Usuario", foreign_keys=[autor_id])


class NoticiaHistorial(Base):
    __tablename__ = "noticia_historial"

    id = Column(Integer, primary_key=True, index=True)
    noticia_id = Column(Integer, ForeignKey("noticias.id", ondelete="CASCADE"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    accion = Column(String(50), nullable=False)  # create, update, delete
    cambios = Column(JSONB, default={})
    comentario = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
