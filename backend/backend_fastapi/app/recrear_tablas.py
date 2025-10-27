#!/usr/bin/env python3
"""
Script para recrear las tablas de SQLAlchemy desde cero.
Esto forzará que SQLAlchemy use los modelos actualizados.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Agregar el directorio app al path
sys.path.append('/app')

from app.base_datos import DATABASE_URL, Base
from app import modelos

def recrear_tablas():
    """Recrear todas las tablas desde los modelos SQLAlchemy"""
    print("Conectando a la base de datos...")
    engine = create_engine(DATABASE_URL)
    
    print("Eliminando todas las tablas existentes...")
    Base.metadata.drop_all(bind=engine)
    
    print("Creando extensión UUID...")
    with engine.connect() as conn:
        conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
        conn.commit()
    
    print("Creando tablas desde los modelos SQLAlchemy...")
    Base.metadata.create_all(bind=engine)
    
    print("¡Tablas recreadas exitosamente!")
    
    # Verificar que las tablas se crearon correctamente
    print("\nTablas creadas:")
    for table_name in Base.metadata.tables.keys():
        print(f"  - {table_name}")

if __name__ == "__main__":
    recrear_tablas()