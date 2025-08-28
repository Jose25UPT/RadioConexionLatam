from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Leer la URL desde una variable de entorno (opcional)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:25091997@161.132.54.67:3306/radio"
)

# Crear el engine y la sesión
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para los modelos
Base = declarative_base()
