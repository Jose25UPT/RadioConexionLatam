from fastapi import FastAPI
from app.rutas_noticias import router as noticias_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Habilitar CORS para permitir conexiones desde el frontend (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # o ["*"] para permitir todos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir todas las rutas definidas en rutas_noticias
app.include_router(noticias_router)

@app.get("/")
def raiz():
    return {"mensaje": "Bienvenido a la API de Radio Conexión Latam"}
