from sqlalchemy import Column, Integer, String, Text, Date, Boolean
from app.base_datos import Base

class Noticia(Base):
    __tablename__ = "noticias"

    id = Column(Integer, primary_key=True, index=True)
    titulo    = Column(String(255), nullable=False)
    resumen   = Column(Text, nullable=True)
    contenido = Column(Text, nullable=False)
    autor     = Column(String(100), nullable=True)
    fecha     = Column(Date, nullable=False)
    imagen    = Column(Text, nullable=True)
    categoria = Column(String(100), nullable=True)
    vistas    = Column(Integer, default=0, nullable=False)
    destacada = Column(Boolean, default=False, nullable=False)
