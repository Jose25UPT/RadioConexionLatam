from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.base_datos import SessionLocal
from app import modelos, esquemas
from app.rutas_auth import require_role
from app.auth import hash_password

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================
# Roles
# ==========================

@router.get("/roles", response_model=list[dict])
def listar_roles(db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    roles = db.query(modelos.Rol).all()
    return [
        {
            "id": r.id,
            "nombre": r.nombre,
            "descripcion": r.descripcion,
            "activo": r.activo,
            "permisos": r.permisos or {},
        } for r in roles
    ]

@router.post("/roles", response_model=dict, status_code=status.HTTP_201_CREATED)
def crear_rol(payload: dict, db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    nombre = (payload.get("nombre") or "").strip().lower()
    if not nombre:
        raise HTTPException(400, detail="Nombre de rol requerido")
    existente = db.query(modelos.Rol).filter(modelos.Rol.nombre == nombre).first()
    if existente:
        raise HTTPException(400, detail="El rol ya existe")
    rol = modelos.Rol(
        nombre=nombre,
        descripcion=payload.get("descripcion"),
        permisos=payload.get("permisos") or {},
        activo=True,
    )
    db.add(rol)
    db.commit()
    db.refresh(rol)
    return {"id": rol.id, "nombre": rol.nombre}

@router.put("/roles/{rol_id}", response_model=dict)
def actualizar_rol(rol_id: int, payload: dict, db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    rol = db.query(modelos.Rol).filter(modelos.Rol.id == rol_id).first()
    if not rol:
        raise HTTPException(404, detail="Rol no encontrado")
    if "nombre" in payload and payload["nombre"]:
        rol.nombre = str(payload["nombre"]).strip().lower()
    if "descripcion" in payload:
        rol.descripcion = payload["descripcion"]
    if "permisos" in payload and isinstance(payload["permisos"], dict):
        rol.permisos = payload["permisos"]
    if "activo" in payload:
        rol.activo = bool(payload["activo"])
    db.commit()
    return {"ok": True}

@router.delete("/roles/{rol_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_rol(rol_id: int, db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    rol = db.query(modelos.Rol).filter(modelos.Rol.id == rol_id).first()
    if not rol:
        raise HTTPException(404, detail="Rol no encontrado")
    # Opcional: validar que no existan usuarios con ese rol
    usuarios_con_rol = db.query(modelos.Usuario).filter(modelos.Usuario.rol_id == rol.id).count()
    if usuarios_con_rol > 0:
        raise HTTPException(400, detail="No se puede eliminar un rol en uso")
    db.delete(rol)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# ==========================
# Usuarios
# ==========================

@router.get("/users", response_model=list[dict])
def listar_usuarios(db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    usuarios = db.query(modelos.Usuario).all()
    # Enriquecer con nombre del rol
    roles_map = {r.id: r.nombre for r in db.query(modelos.Rol).all()}
    return [
        {
            "id": u.id,
            "nombre_usuario": u.nombre_usuario,
            "email": u.email,
            "rol": roles_map.get(u.rol_id, None),
            "rol_id": u.rol_id,
            "activo": u.activo,
            "avatar": u.avatar or None,
            "titulo": u.titulo or None,
            "biografia": u.biografia or None,
            "frase_personal": u.frase_personal or None,
            "redes_sociales": u.redes_sociales or {},
        }
        for u in usuarios
    ]

@router.post("/users", response_model=dict, status_code=status.HTTP_201_CREATED)
def crear_usuario(payload: dict, db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    # Aceptar campos flexibles desde el frontend
    nombre_usuario = (payload.get("nombre_usuario") or payload.get("username") or payload.get("nombre") or "").strip()
    email = (payload.get("email") or "").strip()
    password = payload.get("password")
    rol_nombre = (payload.get("rol") or payload.get("role") or "").strip().lower()

    if not nombre_usuario or not email or not password or not rol_nombre:
        raise HTTPException(400, detail="nombre_usuario/nombre, email, password y rol/role son requeridos")

    # Validar duplicados
    existente = db.query(modelos.Usuario).filter(
        (modelos.Usuario.email == email) | (modelos.Usuario.nombre_usuario == nombre_usuario)
    ).first()
    if existente:
        raise HTTPException(400, detail="Email o nombre de usuario ya existe")

    rol = db.query(modelos.Rol).filter(modelos.Rol.nombre == rol_nombre).first()
    if not rol:
        raise HTTPException(400, detail=f"Rol '{rol_nombre}' no existe")

    usuario = modelos.Usuario(
        nombre_usuario=nombre_usuario,
        email=email,
        password_hash=hash_password(password),
        rol_id=rol.id,
        nombre_completo=payload.get("nombre_completo"),
        avatar=payload.get("avatar"),
        titulo=payload.get("titulo"),
        biografia=payload.get("bio"),
        frase_personal=payload.get("frase"),
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return {
        "id": usuario.id,
        "nombre_usuario": usuario.nombre_usuario,
        "email": usuario.email,
        "rol": rol.nombre,
        "activo": usuario.activo,
    }

@router.put("/users/{user_id}/role", response_model=dict)
def cambiar_rol_usuario(user_id: int, payload: dict, db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    usuario = db.query(modelos.Usuario).filter(modelos.Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(404, detail="Usuario no encontrado")
    nuevo_rol_nombre = (payload.get("rol") or "").lower().strip()
    if not nuevo_rol_nombre:
        raise HTTPException(400, detail="Rol requerido")
    rol = db.query(modelos.Rol).filter(modelos.Rol.nombre == nuevo_rol_nombre).first()
    if not rol:
        raise HTTPException(400, detail=f"Rol '{nuevo_rol_nombre}' no existe")
    usuario.rol_id = rol.id
    db.commit()
    return {"ok": True}

@router.patch("/users/{user_id}/nombre", response_model=dict)
def actualizar_nombre_usuario(user_id: int, payload: dict, db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    usuario = db.query(modelos.Usuario).filter(modelos.Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(404, detail="Usuario no encontrado")
    nuevo = (payload.get("nombre_usuario") or "").strip()
    if not nuevo:
        raise HTTPException(400, detail="Nombre requerido")
    duplicado = db.query(modelos.Usuario).filter(
        modelos.Usuario.nombre_usuario == nuevo,
        modelos.Usuario.id != user_id
    ).first()
    if duplicado:
        raise HTTPException(400, detail="Nombre de usuario ya existe")
    usuario.nombre_usuario = nuevo
    db.commit()
    return {"ok": True, "nombre_usuario": nuevo}

@router.patch("/users/{user_id}/activo", response_model=dict)
def set_activo_usuario(user_id: int, payload: dict, db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    usuario = db.query(modelos.Usuario).filter(modelos.Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(404, detail="Usuario no encontrado")
    usuario.activo = bool(payload.get("activo", True))
    db.commit()
    return {"activo": usuario.activo}

@router.patch("/users/{user_id}/toggle", response_model=dict)
def activar_desactivar_usuario(user_id: int, db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    usuario = db.query(modelos.Usuario).filter(modelos.Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(404, detail="Usuario no encontrado")
    usuario.activo = not bool(usuario.activo)
    db.commit()
    return {"activo": usuario.activo}

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(user_id: int, db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    usuario = db.query(modelos.Usuario).filter(modelos.Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.patch("/users/{user_id}/reset_password", response_model=dict)
def resetear_password_usuario(user_id: int, payload: Optional[dict] = None, db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    """Resetea la contraseña del usuario. Si no se envía 'password', se genera una temporal simple.
    Request body opcional: { "password": "nuevaPass" }
    Response: { ok: true, temp_password?: string }
    """
    usuario = db.query(modelos.Usuario).filter(modelos.Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(404, detail="Usuario no encontrado")
    nueva = (payload or {}).get("password") if isinstance(payload, dict) else None
    if not nueva:
        # Generar temporal sencilla; en producción usar generador robusto
        import secrets, string
        alfabeto = string.ascii_letters + string.digits
        nueva = ''.join(secrets.choice(alfabeto) for _ in range(10))
        temp = True
    else:
        temp = False
    usuario.password_hash = hash_password(nueva)
    db.commit()
    resp = {"ok": True}
    if temp:
        resp["temp_password"] = nueva
    return resp

# ==========================
# Perfil de usuario (admin)
# ==========================

@router.patch("/users/{user_id}/profile", response_model=dict)
def actualizar_perfil_usuario(user_id: int, payload: esquemas.UserProfileUpdate, db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    usuario = db.query(modelos.Usuario).filter(modelos.Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(404, detail="Usuario no encontrado")
    data = payload.model_dump(exclude_unset=True)
    # Campos directos
    if 'nombre_completo' in data:
        usuario.nombre_completo = data['nombre_completo']
    if 'avatar' in data:
        usuario.avatar = data['avatar']
    if 'titulo' in data:
        usuario.titulo = data['titulo']
    if 'bio' in data:
        usuario.biografia = data['bio']
    if 'frase' in data:
        usuario.frase_personal = data['frase']
    if 'redes_sociales' in data and isinstance(data['redes_sociales'], dict):
        usuario.redes_sociales = data['redes_sociales']
    if 'especialidades' in data:
        usuario.especialidades = data['especialidades']
    if 'logros' in data:
        usuario.logros = data['logros']
    if 'anime_favoritos' in data:
        usuario.anime_favoritos = data['anime_favoritos']
    db.commit()
    return {"ok": True}


# ==========================
# Métricas
# ==========================

@router.get("/metricas", response_model=dict)
def obtener_metricas(db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
    total_noticias = db.query(func.count(modelos.Noticia.id)).scalar() or 0
    total_vistas = db.query(func.sum(modelos.Noticia.visitas)).scalar() or 0

    cats = db.query(
        modelos.Categoria.nombre,
        func.count(modelos.Noticia.id).label("articulos"),
        func.coalesce(func.sum(modelos.Noticia.visitas), 0).label("vistas"),
    ).outerjoin(modelos.Noticia, modelos.Noticia.categoria_id == modelos.Categoria.id) \
     .group_by(modelos.Categoria.nombre) \
     .order_by(func.sum(modelos.Noticia.visitas).desc().nullslast()) \
     .all()

    categorias = [
        {"categoria": c.nombre, "articulos": c.articulos, "vistas": int(c.vistas)}
        for c in cats
    ]

    top_noticias = db.query(
        modelos.Noticia.id,
        modelos.Noticia.titulo,
        modelos.Noticia.slug,
        modelos.Noticia.visitas,
        modelos.Categoria.nombre.label("categoria"),
    ).outerjoin(modelos.Categoria, modelos.Categoria.id == modelos.Noticia.categoria_id) \
     .order_by(modelos.Noticia.visitas.desc()) \
     .limit(10).all()

    top = [
        {"id": n.id, "titulo": n.titulo, "slug": n.slug, "vistas": n.visitas or 0, "categoria": n.categoria}
        for n in top_noticias
    ]

    editores = db.query(
        modelos.Usuario.nombre_usuario,
        func.count(modelos.Noticia.id).label("articulos"),
        func.coalesce(func.sum(modelos.Noticia.visitas), 0).label("vistas"),
    ).outerjoin(modelos.Noticia, modelos.Noticia.autor_id == modelos.Usuario.id) \
     .group_by(modelos.Usuario.nombre_usuario) \
     .order_by(func.count(modelos.Noticia.id).desc()) \
     .limit(10).all()

    top_editores = [
        {"editor": e.nombre_usuario, "articulos": e.articulos, "vistas": int(e.vistas)}
        for e in editores
    ]

    return {
        "total_noticias": total_noticias,
        "total_vistas": int(total_vistas),
        "por_categoria": categorias,
        "top_noticias": top,
        "top_editores": top_editores,
    }
