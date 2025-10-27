from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.sql import func
from datetime import timedelta
from app.base_datos import SessionLocal
from app import modelos, esquemas
from app.auth import hash_password, verify_password, crear_access_token, decodificar_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(
	prefix="/api/auth",
	tags=["Auth"],
)

def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()

def get_user_by_username_or_email(db: Session, username_or_email: str):
	"""Busca por nombre de usuario o email, ignorando mayúsculas/minúsculas y espacios laterales."""
	value = (username_or_email or "").strip()
	if not value:
		return None
	value_lower = value.lower()
	return db.query(modelos.Usuario).filter(
		or_(func.lower(modelos.Usuario.nombre_usuario) == value_lower,
			func.lower(modelos.Usuario.email) == value_lower)
	).first()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
	payload = decodificar_token(token)
	if not payload:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")
	username: str = payload.get("sub")
	if username is None:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
	user = get_user_by_username_or_email(db, username)
	if not user or not user.activo:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inactivo o no encontrado")
	return user

def require_role(roles: list[str]):
	def wrapper(user: modelos.Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
		if not user.rol_id:
			raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario sin rol asignado")
		user_rol = db.query(modelos.Rol).filter(modelos.Rol.id == user.rol_id).first()
		if not user_rol or user_rol.nombre not in roles:
			raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permisos insuficientes")
		return user
	return wrapper

@router.post("/register", response_model=esquemas.UserPublic, status_code=status.HTTP_201_CREATED)
def registrar_usuario(datos: esquemas.UserCreate, db: Session = Depends(get_db), user_admin: modelos.Usuario = Depends(require_role(["admin"]))):
	# Solo un admin puede crear usuarios
	existente = db.query(modelos.Usuario).filter(
		or_(modelos.Usuario.email == datos.email, modelos.Usuario.nombre_usuario == datos.nombre_usuario)
	).first()
	if existente:
		raise HTTPException(status_code=400, detail="Email o nombre de usuario ya existe")

	# Buscar el rol por nombre
	rol = db.query(modelos.Rol).filter(modelos.Rol.nombre == datos.rol).first()
	if not rol:
		raise HTTPException(status_code=400, detail=f"Rol '{datos.rol}' no existe")

	usuario = modelos.Usuario(
		nombre_usuario=datos.nombre_usuario,
		email=datos.email,
		password_hash=hash_password(datos.password),  # Actualizado
		rol_id=rol.id,  # Usar rol_id en lugar de rol
		nombre_completo=datos.nombre_completo if hasattr(datos, 'nombre_completo') else None,
		avatar=datos.avatar if hasattr(datos, 'avatar') else None,
		titulo=datos.titulo if hasattr(datos, 'titulo') else None,
		biografia=datos.bio if hasattr(datos, 'bio') else None,
		frase_personal=datos.frase if hasattr(datos, 'frase') else None,
	)
	db.add(usuario)
	db.commit()
	db.refresh(usuario)
	return usuario

@router.post("/login", response_model=esquemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
	user = get_user_by_username_or_email(db, form_data.username)
	if not user or not verify_password(form_data.password, user.password_hash):  # Actualizado
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
	
	# Obtener el nombre del rol del usuario
	user_rol_name = "usuario"  # default
	if user.rol_id:
		user_rol = db.query(modelos.Rol).filter(modelos.Rol.id == user.rol_id).first()
		if user_rol:
			user_rol_name = user_rol.nombre
	
	token = crear_access_token({"sub": user.nombre_usuario, "rol": user_rol_name}, expires_delta=timedelta(minutes=60))
	return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=esquemas.UserPublic)
def perfil_actual(user: modelos.Usuario = Depends(get_current_user)):
	return user

@router.get("/usuarios", response_model=list[esquemas.UserPublic])
def listar_usuarios(db: Session = Depends(get_db), admin: modelos.Usuario = Depends(require_role(["admin"]))):
	return db.query(modelos.Usuario).all()

# ==========================
# Perfil propio (self-service)
# ==========================

@router.patch("/me/profile", response_model=dict)
def actualizar_mi_perfil(
	payload: esquemas.UserProfileUpdate,
	user: modelos.Usuario = Depends(get_current_user),
	db: Session = Depends(get_db),
):
	datos = payload.model_dump(exclude_unset=True)
	if 'nombre_completo' in datos:
		user.nombre_completo = datos['nombre_completo']
	if 'avatar' in datos:
		user.avatar = datos['avatar']
	if 'titulo' in datos:
		user.titulo = datos['titulo']
	if 'bio' in datos:
		user.biografia = datos['bio']
	if 'frase' in datos:
		user.frase_personal = datos['frase']
	if 'redes_sociales' in datos and isinstance(datos['redes_sociales'], dict):
		# Aceptamos un objeto libre de plataforma->url
		user.redes_sociales = datos['redes_sociales']
	if 'especialidades' in datos:
		user.especialidades = datos['especialidades']
	if 'logros' in datos:
		user.logros = datos['logros']
	if 'anime_favoritos' in datos:
		user.anime_favoritos = datos['anime_favoritos']

	db.commit()
	return {"ok": True}
