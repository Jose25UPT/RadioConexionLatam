from pydantic import BaseModel
from datetime import date
from typing import Optional

class NoticiaBase(BaseModel):
    id: int
    titulo: str
    resumen: Optional[str] = None
    contenido: str
    autor: Optional[str] = None
    fecha: date
    imagen: Optional[str] = None
    categoria: Optional[str] = None
    vistas: Optional[int] = 0
    destacada: Optional[bool] = False

class NoticiaCrear(NoticiaBase):
    pass

class NoticiaActualizar(NoticiaBase):
    pass

class NoticiaRespuesta(NoticiaBase):
    id: int

    class Config:
        # para serializar objetos ORM
        from_attributes = True
