from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
import shutil
import os
from pathlib import Path
import uuid
from PIL import Image

router = APIRouter(
    prefix="/api/uploads",
    tags=["Archivos"],
    responses={404: {"description": "No encontrado"}}
)

# Crear directorio de uploads si no existe
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Directorio específico para imágenes
IMAGES_DIR = UPLOAD_DIR / "images"
IMAGES_DIR.mkdir(exist_ok=True)

# Tipos de archivo permitidos
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validar_imagen(file: UploadFile) -> bool:
    """Valida que el archivo sea una imagen válida"""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        return False
    return True

def redimensionar_imagen(input_path: Path, output_path: Path, max_width: int = 1200, quality: int = 85):
    """Redimensiona y optimiza la imagen"""
    try:
        with Image.open(input_path) as img:
            # Convertir a RGB si es necesario
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # Redimensionar si es necesario
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Guardar con optimización
            img.save(output_path, "JPEG", quality=quality, optimize=True)
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error procesando imagen: {str(e)}"
        )

@router.post("/imagen", response_model=dict)
async def subir_imagen(file: UploadFile = File(...)):
    """
    Sube una imagen para usar en noticias o perfiles.
    """
    # Validar tipo de archivo
    if not validar_imagen(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de archivo no permitido. Use JPEG, PNG, WebP o GIF."
        )
    
    # Validar tamaño del archivo
    file.file.seek(0, 2)  # Ir al final del archivo
    file_size = file.file.tell()
    file.file.seek(0)  # Volver al inicio
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo es demasiado grande. Máximo 5MB."
        )
    
    # Generar nombre único
    file_extension = Path(file.filename).suffix.lower()
    if not file_extension:
        file_extension = ".jpg"
    
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    temp_file_path = IMAGES_DIR / f"temp_{unique_filename}"
    final_file_path = IMAGES_DIR / unique_filename
    
    try:
        # Guardar archivo temporal
        with temp_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Procesar y optimizar imagen
        redimensionar_imagen(temp_file_path, final_file_path)
        
        # Eliminar archivo temporal
        temp_file_path.unlink()
        
        # Generar URL de acceso
        image_url = f"/api/uploads/images/{unique_filename}"
        
        return {
            "success": True,
            "url": image_url,
            "filename": unique_filename,
            "original_name": file.filename,
            "size": final_file_path.stat().st_size
        }
        
    except Exception as e:
        # Limpiar archivos temporales en caso de error
        if temp_file_path.exists():
            temp_file_path.unlink()
        if final_file_path.exists():
            final_file_path.unlink()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error subiendo archivo: {str(e)}"
        )

@router.get("/images/{filename}")
async def obtener_imagen(filename: str):
    """
    Sirve una imagen subida.
    """
    file_path = IMAGES_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagen no encontrada"
        )
    
    return FileResponse(file_path)

@router.delete("/images/{filename}")
async def eliminar_imagen(filename: str):
    """
    Elimina una imagen subida.
    """
    file_path = IMAGES_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagen no encontrada"
        )
    
    try:
        file_path.unlink()
        return {"success": True, "message": "Imagen eliminada correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error eliminando imagen: {str(e)}"
        )