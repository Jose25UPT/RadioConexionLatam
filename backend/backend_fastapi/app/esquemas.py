from pydantic import BaseModel, Field, EmailStr
from datetime import date, datetime
from typing import Optional, List, Dict, Any

class AutorInfo(BaseModel):
    nombre: Optional[str] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    avatar: Optional[str] = None
    nivel: Optional[int] = 1
    experiencia_años: Optional[int] = 0
    articulos_total: Optional[int] = 0
    seguidores: Optional[int] = 0
    precision: Optional[int] = 85
    especialidades: Optional[List[str]] = []
    logros: Optional[List[str]] = []
    top_anime: Optional[List[str]] = []
    redes_sociales: Optional[Dict[str, str]] = {}
    frase: Optional[str] = None

class NoticiaBase(BaseModel):
    titulo: str
    resumen: Optional[str] = None
    contenido: str
    fecha: date
    imagen: Optional[str] = None
    categoria: Optional[str] = None
    programa: Optional[str] = None
    tags: Optional[List[str]] = []
    vistas: Optional[int] = 0
    likes: Optional[int] = 0
    comentarios: Optional[int] = 0
    compartidos: Optional[int] = 0
    destacada: Optional[bool] = False
    
    # Datos del autor
    autor_info: Optional[AutorInfo] = None
    
    # Audio relacionado
    audio_url: Optional[str] = None
    audio_titulo: Optional[str] = None
    
    # Configuración de comentarios
    permitir_comentarios: Optional[bool] = True
    permitir_anonimos: Optional[bool] = True
    
    # Artículos relacionados
    articulos_relacionados: Optional[List[int]] = []

class NoticiaCrear(BaseModel):
    titulo: str
    resumen: Optional[str] = None
    contenido: str
    fecha: Optional[date] = None
    imagen: Optional[str] = None
    categoria: Optional[str] = None
    programa: Optional[str] = None
    tags: Optional[List[str]] = []
    destacada: Optional[bool] = False
    autor_info: Optional[AutorInfo] = None
    audio_url: Optional[str] = None
    audio_titulo: Optional[str] = None
    permitir_comentarios: Optional[bool] = True
    permitir_anonimos: Optional[bool] = True
    articulos_relacionados: Optional[List[int]] = []

class NoticiaActualizar(BaseModel):
    titulo: Optional[str] = None
    resumen: Optional[str] = None
    contenido: Optional[str] = None
    fecha: Optional[date] = None
    imagen: Optional[str] = None
    categoria: Optional[str] = None
    programa: Optional[str] = None
    tags: Optional[List[str]] = None
    destacada: Optional[bool] = None
    autor_id: Optional[int] = None
    autor_info: Optional[AutorInfo] = None
    audio_url: Optional[str] = None
    audio_titulo: Optional[str] = None
    permitir_comentarios: Optional[bool] = None
    permitir_anonimos: Optional[bool] = None
    articulos_relacionados: Optional[List[int]] = None

class NoticiaRespuesta(NoticiaBase):
    id: int
    slug: str
    autor_id: Optional[int] = None
    fecha_creacion: Optional[datetime] = None
    fecha_actualizacion: Optional[datetime] = None
    last_edited_by: Optional[str] = None
    last_edited_at: Optional[datetime] = None
    tiempo_lectura: Optional[int] = 0

    class Config:
        # para serializar objetos ORM
        from_attributes = True


class NoticiaHistorialItem(BaseModel):
    id: int
    noticia_id: int
    usuario_id: Optional[int] = None
    usuario_nombre: Optional[str] = None
    accion: str
    cambios: Optional[Dict[str, Any]] = None
    comentario: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ComentarioBase(BaseModel):
    noticia_id: int
    contenido: str
    autor_nombre: Optional[str] = None
    autor_avatar: Optional[str] = None
    es_anonimo: Optional[bool] = False
    tiene_spoilers: Optional[bool] = False
    comentario_padre_id: Optional[int] = None
    usuario_tipo: Optional[str] = None

class ComentarioCrear(ComentarioBase):
    pass

class ComentarioRespuesta(ComentarioBase):
    id: int
    fecha_creacion: datetime
    likes: int
    respuestas: int

    class Config:
        from_attributes = True

# ==========================
# Esquemas de Usuario / Auth
# ==========================

class UserBase(BaseModel):
    nombre_usuario: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    rol: str = "autor"  # Este sigue siendo string porque lo enviamos como nombre del rol
    nombre_completo: str | None = None
    avatar: str | None = None
    titulo: str | None = None
    bio: str | None = None
    frase: str | None = None

class UserLogin(BaseModel):
    username: str  # puede ser nombre_usuario o email
    password: str

class UserPublic(UserBase):
    id: int
    rol_id: int | None = None
    nombre_completo: str | None = None
    avatar: str | None = None
    titulo: str | None = None
    biografia: str | None = None
    frase_personal: str | None = None
    redes_sociales: dict[str, str] | None = None
    nivel: int | None = None
    experiencia_años: int | None = None
    articulos_publicados: int | None = None
    seguidores: int | None = None
    precision_rating: int | None = None
    activo: bool | None = None
    verificado: bool | None = None
    fecha_registro: datetime | None = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    sub: str | None = None  # username
    rol: str | None = None

# ==========================
# Perfil de Usuario - Update
# ==========================

class UserProfileUpdate(BaseModel):
    nombre_completo: str | None = None
    avatar: str | None = None
    titulo: str | None = None
    bio: str | None = None
    frase: str | None = None
    redes_sociales: Dict[str, str] | None = None
    especialidades: List[str] | None = None
    logros: List[str] | None = None
    anime_favoritos: List[str] | None = None
