from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.rutas_noticias import router as noticias_router
from app.rutas_uploads import router as uploads_router
from app.rutas_auth import router as auth_router
from app.rutas_admin import router as admin_router
from fastapi.middleware.cors import CORSMiddleware
import os
from sqlalchemy.orm import Session
from app.base_datos import SessionLocal
from app import modelos
from app.auth import hash_password

app = FastAPI(title="Radio Valle API", description="API para Radio Valle - Noticias Otaku")

# Crear directorio de uploads si no existe
os.makedirs("uploads/images", exist_ok=True)

# Habilitar CORS para permitir conexiones desde el frontend
# Configuración de CORS: leer orígenes permitidos desde variable de entorno
# Usa una lista separada por comas en CORS_ALLOW_ORIGINS, por ejemplo:
# CORS_ALLOW_ORIGINS="https://tu-app.vercel.app,https://otro-dominio.com"
cors_env = os.getenv("CORS_ALLOW_ORIGINS")
if cors_env:
    allow_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
else:
    # Valores por defecto para desarrollo local
    allow_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir todas las rutas
app.include_router(noticias_router)
app.include_router(uploads_router)
app.include_router(auth_router)
app.include_router(admin_router)

# Servir archivos estáticos (imágenes subidas)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def raiz():
    return {"mensaje": "Bienvenido a la API de Radio Conexión Latam"}


@app.on_event("startup")
def crear_admin_y_editor_por_defecto():
    """Crea roles base (admin, editor, autor) y usuarios por defecto (admin/admin y editor/editor123)
    si no existen y la variable AUTO_CREATE_DEFAULT_ADMIN está habilitada.
    NOTA: Cambia las contraseñas luego. Desactiva este comportamiento en producción con AUTO_CREATE_DEFAULT_ADMIN=0.
    """
    if os.getenv("AUTO_CREATE_DEFAULT_ADMIN", "1") != "1":
        return
    
    print("Iniciando creación de datos por defecto...")
    db: Session = SessionLocal()
    try:
        # Primero crear roles si no existen
        print("Verificando roles...")
        rol_admin = db.query(modelos.Rol).filter_by(nombre="admin").first()
        if not rol_admin:
            print("Creando rol admin...")
            rol_admin = modelos.Rol(
                nombre="admin",
                descripcion="Administrador del sistema",
                permisos={"all": True}
            )
            db.add(rol_admin)
            db.commit()
            db.refresh(rol_admin)
            print(f"Rol admin creado con ID: {rol_admin.id}")

        # Crear rol editor si no existe
        rol_editor = db.query(modelos.Rol).filter_by(nombre="editor").first()
        if not rol_editor:
            print("Creando rol editor...")
            rol_editor = modelos.Rol(
                nombre="editor",
                descripcion="Editor de contenido (puede crear/editar/publicar)",
                permisos={
                    "create_articles": True,
                    "edit_articles": True,
                    "publish_articles": True,
                    "delete_articles": False
                }
            )
            db.add(rol_editor)
            db.commit()
            db.refresh(rol_editor)
            print(f"Rol editor creado con ID: {rol_editor.id}")

        # Migrar usuarios con roles distintos a admin/editor hacia editor, y eliminar roles extra
        print("Normalizando roles a solo 'admin' y 'editor'...")
        roles_permitidos = {"admin": rol_admin.id, "editor": rol_editor.id}
        # Asignar 'editor' a cualquier usuario con rol no permitido
        usuarios_no_permitidos = (
            db.query(modelos.Usuario)
            .join(modelos.Rol, modelos.Rol.id == modelos.Usuario.rol_id, isouter=True)
            .filter(~modelos.Rol.nombre.in_(list(roles_permitidos.keys())))
            .all()
        )
        for u in usuarios_no_permitidos:
            u.rol_id = rol_editor.id
        if usuarios_no_permitidos:
            db.commit()
            print(f"Usuarios normalizados: {len(usuarios_no_permitidos)}")

        # Eliminar roles que no sean admin/editor
        roles_extra = db.query(modelos.Rol).filter(~modelos.Rol.nombre.in_(list(roles_permitidos.keys()))).all()
        for r in roles_extra:
            db.delete(r)
        if roles_extra:
            db.commit()
            print(f"Roles eliminados: {[r.nombre for r in roles_extra]}")

        # Asegurar estado por defecto 'publicado' para noticias
        print("Verificando estado por defecto 'publicado'...")
        estado_publicado = db.query(modelos.EstadoNoticia).filter(modelos.EstadoNoticia.nombre == 'publicado').first()
        if not estado_publicado:
            estado_publicado = modelos.EstadoNoticia(nombre='publicado', descripcion='Publicado', color_hex='#28a745', activo=True)
            db.add(estado_publicado)
            db.commit()
            db.refresh(estado_publicado)
            print(f"Estado 'publicado' creado con ID: {estado_publicado.id}")
        
        # Luego crear usuario admin si no existe
        print("Verificando usuario admin...")
        existe = db.query(modelos.Usuario).filter_by(nombre_usuario="admin").first()
        if not existe:
            print("Creando usuario admin...")
            # Usar una contraseña simple para evitar problemas de longitud
            password_hash = hash_password("admin")
            print(f"Hash de contraseña creado, longitud: {len(password_hash)}")
            
            usuario = modelos.Usuario(
                nombre_usuario="admin",
                email="admin@local",
                password_hash=password_hash,
                rol_id=rol_admin.id,
                nombre_completo="Administrador del Sistema",
                titulo="Administrador Principal"
            )
            db.add(usuario)
            db.commit()
            print("Usuario admin creado exitosamente!")
        else:
            print("Usuario admin ya existe.")

        # Crear usuario editor por defecto si no existe
        print("Verificando usuario editor...")
        existe_editor = db.query(modelos.Usuario).filter_by(nombre_usuario="editor").first()
        if not existe_editor:
            print("Creando usuario editor...")
            password_hash_editor = hash_password("editor123")
            print(f"Hash de contraseña (editor) creado, longitud: {len(password_hash_editor)}")

            # Asegurar que tenemos el rol_editor (releer si no existe por alguna razón)
            rol_editor = db.query(modelos.Rol).filter_by(nombre="editor").first()
            if not rol_editor:
                # fallback para evitar fallos si la transacción anterior no persistió
                rol_editor = modelos.Rol(
                    nombre="editor",
                    descripcion="Editor de contenido",
                    permisos={
                        "create_articles": True,
                        "edit_articles": True,
                        "publish_articles": True,
                        "delete_articles": False
                    }
                )
                db.add(rol_editor)
                db.commit()
                db.refresh(rol_editor)

            usuario_editor = modelos.Usuario(
                nombre_usuario="editor",
                email="editor@local",
                password_hash=password_hash_editor,
                rol_id=rol_editor.id,
                nombre_completo="Editor de Contenido",
                titulo="Editor"
            )
            db.add(usuario_editor)
            db.commit()
            print("Usuario editor creado exitosamente!")
        else:
            print("Usuario editor ya existe.")
            
    except Exception as e:
        print(f"Error durante la inicialización: {e}")
        db.rollback()
        raise
    finally:
        db.close()
