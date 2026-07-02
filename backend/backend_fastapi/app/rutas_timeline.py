from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session, joinedload
from app.base_datos import SessionLocal
from app import modelos
from app.rutas_auth import require_role

router = APIRouter(tags=["Timeline"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── Endpoints públicos ───────────────────────────────────────────────────────

@router.get("/categorias", response_model=list[dict])
def listar_categorias(db: Session = Depends(get_db)):
    cats = db.query(modelos.TimelineCategoria).order_by(modelos.TimelineCategoria.nombre).all()
    return [{"id": c.id, "nombre": c.nombre} for c in cats]


@router.get("/eventos", response_model=list[dict])
def listar_eventos(db: Session = Depends(get_db)):
    eventos = (
        db.query(modelos.TimelineEvento)
        .options(
            joinedload(modelos.TimelineEvento.participantes).joinedload(
                modelos.TimelineParticipante.categoria
            )
        )
        .order_by(modelos.TimelineEvento.anio.desc())
        .all()
    )
    return [
        {
            "id": e.id,
            "anio": e.anio,
            "titulo_evento": e.titulo_evento,
            "participantes": [
                {
                    "id": p.id,
                    "nombre": p.nombre,
                    "periodo_tiempo": p.periodo_tiempo,
                    "es_ganador": p.es_ganador,
                    "imagen_url": p.imagen_url,
                    "categoria_id": p.categoria_id,
                    "categoria_nombre": p.categoria.nombre if p.categoria else None,
                }
                for p in e.participantes
            ],
        }
        for e in eventos
    ]


# ─── Eventos (editor / admin) ─────────────────────────────────────────────────

@router.post("/eventos", response_model=dict, status_code=status.HTTP_201_CREATED)
def crear_evento(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    _u: modelos.Usuario = Depends(require_role(["admin", "editor"])),
):
    anio = payload.get("anio")
    titulo = (payload.get("titulo_evento") or "").strip()
    if not anio or not titulo:
        raise HTTPException(400, detail="anio y titulo_evento son requeridos")
    existente = db.query(modelos.TimelineEvento).filter(modelos.TimelineEvento.anio == anio).first()
    if existente:
        raise HTTPException(400, detail=f"Ya existe un evento para el año {anio}")
    evento = modelos.TimelineEvento(anio=int(anio), titulo_evento=titulo)
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return {"id": evento.id, "anio": evento.anio, "titulo_evento": evento.titulo_evento}


@router.put("/eventos/{evento_id}", response_model=dict)
def actualizar_evento(
    evento_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    _u: modelos.Usuario = Depends(require_role(["admin", "editor"])),
):
    evento = db.query(modelos.TimelineEvento).filter(modelos.TimelineEvento.id == evento_id).first()
    if not evento:
        raise HTTPException(404, detail="Evento no encontrado")
    if "anio" in payload:
        evento.anio = int(payload["anio"])
    if "titulo_evento" in payload:
        evento.titulo_evento = payload["titulo_evento"].strip()
    db.commit()
    db.refresh(evento)
    return {"id": evento.id, "anio": evento.anio, "titulo_evento": evento.titulo_evento}


@router.delete("/eventos/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    _u: modelos.Usuario = Depends(require_role(["admin"])),
):
    evento = db.query(modelos.TimelineEvento).filter(modelos.TimelineEvento.id == evento_id).first()
    if not evento:
        raise HTTPException(404, detail="Evento no encontrado")
    db.delete(evento)
    db.commit()


# ─── Participantes (editor / admin) ──────────────────────────────────────────

@router.post("/participantes", response_model=dict, status_code=status.HTTP_201_CREATED)
def crear_participante(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    _u: modelos.Usuario = Depends(require_role(["admin", "editor"])),
):
    evento_id = payload.get("evento_id")
    categoria_id = payload.get("categoria_id")
    nombre = (payload.get("nombre") or "").strip()
    if not evento_id or not categoria_id or not nombre:
        raise HTTPException(400, detail="evento_id, categoria_id y nombre son requeridos")
    if not db.query(modelos.TimelineEvento).filter(modelos.TimelineEvento.id == evento_id).first():
        raise HTTPException(404, detail="Evento no encontrado")
    if not db.query(modelos.TimelineCategoria).filter(modelos.TimelineCategoria.id == categoria_id).first():
        raise HTTPException(404, detail="Categoría no encontrada")
    p = modelos.TimelineParticipante(
        evento_id=int(evento_id),
        categoria_id=int(categoria_id),
        nombre=nombre,
        periodo_tiempo=payload.get("periodo_tiempo"),
        es_ganador=bool(payload.get("es_ganador", False)),
        imagen_url=payload.get("imagen_url"),
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": p.id, "nombre": p.nombre, "evento_id": p.evento_id, "categoria_id": p.categoria_id}


@router.put("/participantes/{participante_id}", response_model=dict)
def actualizar_participante(
    participante_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    _u: modelos.Usuario = Depends(require_role(["admin", "editor"])),
):
    p = db.query(modelos.TimelineParticipante).filter(modelos.TimelineParticipante.id == participante_id).first()
    if not p:
        raise HTTPException(404, detail="Participante no encontrado")
    for campo in ("nombre", "periodo_tiempo", "imagen_url"):
        if campo in payload:
            setattr(p, campo, payload[campo])
    if "es_ganador" in payload:
        p.es_ganador = bool(payload["es_ganador"])
    if "categoria_id" in payload:
        p.categoria_id = int(payload["categoria_id"])
    if "evento_id" in payload:
        p.evento_id = int(payload["evento_id"])
    db.commit()
    db.refresh(p)
    return {"id": p.id, "nombre": p.nombre, "es_ganador": p.es_ganador}


@router.delete("/participantes/{participante_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_participante(
    participante_id: int,
    db: Session = Depends(get_db),
    _u: modelos.Usuario = Depends(require_role(["admin", "editor"])),
):
    p = db.query(modelos.TimelineParticipante).filter(modelos.TimelineParticipante.id == participante_id).first()
    if not p:
        raise HTTPException(404, detail="Participante no encontrado")
    db.delete(p)
    db.commit()


# ─── Categorías (editor / admin) ──────────────────────────────────────────────

@router.post("/categorias", response_model=dict, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    _u: modelos.Usuario = Depends(require_role(["admin", "editor"])),
):
    nombre = (payload.get("nombre") or "").strip()
    if not nombre:
        raise HTTPException(400, detail="nombre es requerido")
    cat = modelos.TimelineCategoria(nombre=nombre)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return {"id": cat.id, "nombre": cat.nombre}


@router.put("/categorias/{cat_id}", response_model=dict)
def actualizar_categoria(
    cat_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    _u: modelos.Usuario = Depends(require_role(["admin", "editor"])),
):
    cat = db.query(modelos.TimelineCategoria).filter(modelos.TimelineCategoria.id == cat_id).first()
    if not cat:
        raise HTTPException(404, detail="Categoría no encontrada")
    cat.nombre = (payload.get("nombre") or cat.nombre).strip()
    db.commit()
    db.refresh(cat)
    return {"id": cat.id, "nombre": cat.nombre}


@router.delete("/categorias/{cat_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    cat_id: int,
    db: Session = Depends(get_db),
    _u: modelos.Usuario = Depends(require_role(["admin"])),
):
    cat = db.query(modelos.TimelineCategoria).filter(modelos.TimelineCategoria.id == cat_id).first()
    if not cat:
        raise HTTPException(404, detail="Categoría no encontrada")
    db.delete(cat)
    db.commit()
