import re
import unicodedata
from typing import List
import json

def generar_slug(titulo: str) -> str:
    """
    Genera un slug SEO-friendly desde un título.
    """
    # Convertir a minúsculas
    slug = titulo.lower()
    
    # Normalizar caracteres unicode
    slug = unicodedata.normalize('NFKD', slug)
    
    # Reemplazar caracteres especiales comunes del español
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u',
        'ñ': 'n', 'ç': 'c'
    }
    
    for char, replacement in replacements.items():
        slug = slug.replace(char, replacement)
    
    # Remover caracteres que no sean letras, números o espacios
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    
    # Reemplazar espacios y múltiples guiones con un solo guión
    slug = re.sub(r'[\s-]+', '-', slug)
    
    # Remover guiones al inicio y final
    slug = slug.strip('-')
    
    return slug
