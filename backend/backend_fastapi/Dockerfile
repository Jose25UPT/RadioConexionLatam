# Imagen base ligera con Python
FROM python:3.12-slim

# Evitar bytecode y buffering
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema necesarias para Pillow (JPEG/zlib)
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libjpeg-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero para aprovechar capa de cache
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código
COPY app ./app

# Crear directorio de uploads (montable como volumen)
RUN mkdir -p /app/uploads/images

EXPOSE 8000

# Comando de arranque
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
