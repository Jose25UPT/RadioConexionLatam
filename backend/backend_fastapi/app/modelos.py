from sqlalchemy import Column, Integer, String, Text, Date, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY, INET
from app.base_datos import Base

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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relación con usuarios
    autor_usuario = relationship("Usuario", back_populates="noticias")

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
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    moderado_por = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    fecha_moderacion = Column(DateTime(timezone=True), nullable=True)
    usuario_tipo = Column(String(50), nullable=True)  # ej: "Compositor", "Miembro desde 2010"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    moderado_por = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    fecha_moderacion = Column(DateTime(timezone=True), nullable=True)
    usuario_tipo = Column(String(50), nullable=True)  # ej: "Compositor", "Miembro desde 2010"


class NoticiaHistorial(Base):
    __tablename__ = "noticia_historial"

    id = Column(Integer, primary_key=True, index=True)
    noticia_id = Column(Integer, ForeignKey("noticias.id", ondelete="CASCADE"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    accion = Column(String(50), nullable=False)  # create, update, delete
    cambios = Column(JSONB, default={})
    comentario = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
