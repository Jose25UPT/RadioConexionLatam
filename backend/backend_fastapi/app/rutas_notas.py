from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.base_datos import SessionLocal
from app import modelos, esquemas
from app.rutas_auth import require_role, get_current_user

router = APIRouter(
    prefix="/api/notas",
    tags=["Notas"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _serializar(nota: modelos.Nota) -> dict:
    autor = nota.autor
    return {
        "id": nota.id,
        "contenido": nota.contenido,
        "activa": nota.activa,
        "autor_id": nota.autor_id,
        "autor_nombre": autor.nombre_usuario if autor else None,
        "autor_avatar": autor.avatar if autor else None,
        "created_at": nota.created_at,
    }


# ── Público ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[esquemas.NotaRespuesta])
def listar_notas(limite: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    notas = (
        db.query(modelos.Nota)
        .filter(modelos.Nota.activa == True)
        .order_by(modelos.Nota.created_at.desc())
        .offset(offset)
        .limit(min(limite, 50))
        .all()
    )
    return [_serializar(n) for n in notas]


@router.get("/total", response_model=dict)
def total_notas(db: Session = Depends(get_db)):
    count = db.query(modelos.Nota).filter(modelos.Nota.activa == True).count()
    return {"total": count}


# ── Editor / Admin ────────────────────────────────────────────────────────────

@router.get("/mis-notas", response_model=list[esquemas.NotaRespuesta])
def mis_notas(
    db: Session = Depends(get_db),
    user: modelos.Usuario = Depends(get_current_user),
):
    rol = db.query(modelos.Rol).filter(modelos.Rol.id == user.rol_id).first()
    es_admin = rol and rol.nombre == "admin"
    query = db.query(modelos.Nota)
    if not es_admin:
        query = query.filter(modelos.Nota.autor_id == user.id)
    notas = query.order_by(modelos.Nota.created_at.desc()).all()
    return [_serializar(n) for n in notas]


@router.post("/", response_model=esquemas.NotaRespuesta, status_code=status.HTTP_201_CREATED)
def crear_nota(
    payload: esquemas.NotaCrear,
    db: Session = Depends(get_db),
    user: modelos.Usuario = Depends(require_role(["editor", "admin"])),
):
    nota = modelos.Nota(
        contenido=payload.contenido,
        autor_id=user.id,
    )
    db.add(nota)
    db.commit()
    db.refresh(nota)
    return _serializar(nota)


@router.put("/{nota_id}", response_model=esquemas.NotaRespuesta)
def actualizar_nota(
    nota_id: int,
    payload: esquemas.NotaActualizar,
    db: Session = Depends(get_db),
    user: modelos.Usuario = Depends(require_role(["editor", "admin"])),
):
    nota = db.query(modelos.Nota).filter(modelos.Nota.id == nota_id).first()
    if not nota:
        raise HTTPException(404, detail="Nota no encontrada")
    rol = db.query(modelos.Rol).filter(modelos.Rol.id == user.rol_id).first()
    es_admin = rol and rol.nombre == "admin"
    if not es_admin and nota.autor_id != user.id:
        raise HTTPException(403, detail="No puedes editar notas de otros editores")
    if payload.contenido is not None:
        nota.contenido = payload.contenido
    db.commit()
    db.refresh(nota)
    return _serializar(nota)


@router.delete("/{nota_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_nota(
    nota_id: int,
    db: Session = Depends(get_db),
    user: modelos.Usuario = Depends(require_role(["editor", "admin"])),
):
    nota = db.query(modelos.Nota).filter(modelos.Nota.id == nota_id).first()
    if not nota:
        raise HTTPException(404, detail="Nota no encontrada")
    rol = db.query(modelos.Rol).filter(modelos.Rol.id == user.rol_id).first()
    es_admin = rol and rol.nombre == "admin"
    if not es_admin and nota.autor_id != user.id:
        raise HTTPException(403, detail="No puedes eliminar notas de otros editores")
    db.delete(nota)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
