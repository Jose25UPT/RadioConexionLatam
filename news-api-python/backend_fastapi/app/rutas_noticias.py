from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.base_datos import SessionLocal, engine, Base
from app import modelos, esquemas

# Crear las tablas en la base de datos (si aún no existen)
Base.metadata.create_all(bind=engine)

router = APIRouter(
    prefix="/api/noticias",
    tags=["Noticias"],
    responses={404: {"description": "No encontrado"}}
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[esquemas.NoticiaRespuesta])
def listar_noticias(db: Session = Depends(get_db)):
    """
    Devuelve todas las noticias ordenadas por fecha descendente.
    """
    return (
        db.query(modelos.Noticia)
          .order_by(modelos.Noticia.fecha.desc())
          .all()
    )

@router.get("/categorias/", response_model=list[str])
def listar_categorias(db: Session = Depends(get_db)):
    """
    Devuelve la lista de categorías únicas.
    """
    filas = (
        db.query(modelos.Noticia.categoria)
          .distinct()
          .order_by(modelos.Noticia.categoria)
          .all()
    )
    return [fila[0] for fila in filas if fila[0] is not None]

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
    return noticia

@router.post("/", response_model=esquemas.NoticiaRespuesta, status_code=status.HTTP_201_CREATED)
def crear_noticia(noticia: esquemas.NoticiaCrear, db: Session = Depends(get_db)):
    """
    Crea una nueva noticia.
    """
    nueva = modelos.Noticia(**noticia.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@router.put("/{noticia_id}", response_model=esquemas.NoticiaRespuesta)
def actualizar_noticia(noticia_id: int, datos: esquemas.NoticiaActualizar, db: Session = Depends(get_db)):
    """
    Actualiza una noticia existente.
    """
    obj = db.get(modelos.Noticia, noticia_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Noticia no encontrada"
        )
    for campo, valor in datos.dict().items():
        setattr(obj, campo, valor)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{noticia_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_noticia(noticia_id: int, db: Session = Depends(get_db)):
    """
    Elimina una noticia por su ID.
    """
    obj = db.get(modelos.Noticia, noticia_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Noticia no encontrada"
        )
    db.delete(obj)
    db.commit()
    return
