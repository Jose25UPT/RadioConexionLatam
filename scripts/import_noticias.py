#!/usr/bin/env python3
import os
import json
from datetime import datetime

# This script imports noticias.json into the PostgreSQL 'noticias' table.
# It uses psycopg (psycopg[binary]). Install with: pip install psycopg[binary]

# Load DB config from project .env (if present) or environment variables
ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(ENV_PATH):
    with open(ENV_PATH, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                k, v = line.split('=', 1)
                k = k.strip()
                v = v.strip().strip('"\'')
                os.environ.setdefault(k, v)

DB_USER = os.getenv('DB_USER', 'radio_user')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'radio_pass')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'radio')

DB_URL = os.getenv('DATABASE_URL')
if not DB_URL:
    DB_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

NOTICIAS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'noticias.json')

print('DB URL:', DB_URL)
print('Loading', NOTICIAS_PATH)

with open(NOTICIAS_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

print('Loaded', len(data), 'items')

try:
    import psycopg
except Exception as e:
    print('psycopg not installed. Install with: pip install psycopg[binary]')
    raise

conn = psycopg.connect(DB_URL)
conn.autocommit = False
cur = conn.cursor()

insert_sql = """
INSERT INTO noticias (
  titulo, slug, resumen, contenido, imagen_principal, galeria_imagenes, audio_url, video_url,
  categoria_id, autor_id, estado_id, fecha_publicacion, visitas, likes, shares, tiempo_lectura,
  destacada, permite_comentarios, comentarios_moderados, meta_title, meta_description, meta_keywords,
  datos_estructurados, created_at, updated_at
) VALUES (
  %(titulo)s, %(slug)s, %(resumen)s, %(contenido)s, %(imagen_principal)s, %(galeria_imagenes)s, %(audio_url)s, %(video_url)s,
  %(categoria_id)s, %(autor_id)s, %(estado_id)s, %(fecha_publicacion)s, %(visitas)s, %(likes)s, %(shares)s, %(tiempo_lectura)s,
  %(destacada)s, %(permite_comentarios)s, %(comentarios_moderados)s, %(meta_title)s, %(meta_description)s, %(meta_keywords)s,
  %(datos_estructurados)s, %(created_at)s, %(updated_at)s
) ON CONFLICT (slug) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  resumen = EXCLUDED.resumen,
  contenido = EXCLUDED.contenido,
  imagen_principal = EXCLUDED.imagen_principal,
  galeria_imagenes = EXCLUDED.galeria_imagenes,
  audio_url = EXCLUDED.audio_url,
  video_url = EXCLUDED.video_url,
  visitas = EXCLUDED.visitas,
  likes = EXCLUDED.likes,
  shares = EXCLUDED.shares,
  tiempo_lectura = EXCLUDED.tiempo_lectura,
  destacada = EXCLUDED.destacada,
  permite_comentarios = EXCLUDED.permite_comentarios,
  comentarios_moderados = EXCLUDED.comentarios_moderados,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  meta_keywords = EXCLUDED.meta_keywords,
  datos_estructurados = EXCLUDED.datos_estructurados,
  updated_at = EXCLUDED.updated_at
RETURNING id;
"""

count = 0
for item in data:
    try:
        titulo = item.get('titulo')
        slug = item.get('slug') or (titulo or '')[:200]
        resumen = item.get('resumen')
        contenido = item.get('contenido') or ''
        imagen_principal = item.get('imagen') or item.get('imagen_principal')
        galeria = item.get('galeria_imagenes') or []
        audio_url = item.get('audio_url') or ''
        video_url = item.get('video_url') or ''
        fecha_creacion = item.get('fecha_creacion')
        fecha_publicacion = None
        # Preferir fecha_creacion ISO si existe
        if fecha_creacion:
            try:
                fecha_dt = datetime.fromisoformat(fecha_creacion)
                fecha_publicacion = fecha_dt.date()
            except Exception:
                fecha_publicacion = None
        # fallback: parse 'fecha' field like '04 Apr 2025 | Anime'
        if not fecha_publicacion and item.get('fecha'):
            try:
                # take first part before '|'
                dpart = item.get('fecha').split('|')[0].strip()
                fecha_publicacion = datetime.strptime(dpart, '%d %b %Y').date()
            except Exception:
                try:
                    fecha_publicacion = datetime.now().date()
                except Exception:
                    fecha_publicacion = None

        visitas = int(item.get('vistas') or 0)
        likes = int(item.get('likes') or 0)
        shares = int(item.get('compartidos') or item.get('shares') or 0)
        tiempo_lectura = int(item.get('tiempo_lectura') or 0)
        destacada = bool(item.get('destacada'))
        permite_comentarios = bool(item.get('permitir_comentarios', True))
        comentarios_moderados = True
        meta_title = None
        meta_description = None
        tags = item.get('tags') or []
        meta_keywords = ','.join(tags)
        datos_estructurados = json.dumps({
            'programa': item.get('programa'),
            'categoria_original': item.get('categoria'),
            'raw_fecha': item.get('fecha')
        })
        created_at = None
        updated_at = None
        if fecha_creacion:
            try:
                created_at = datetime.fromisoformat(fecha_creacion)
                updated_at = created_at
            except Exception:
                created_at = None
                updated_at = None

        params = {
            'titulo': titulo,
            'slug': slug,
            'resumen': resumen,
            'contenido': contenido,
            'imagen_principal': imagen_principal,
            'galeria_imagenes': json.dumps(galeria),
            'audio_url': audio_url,
            'video_url': video_url,
            'categoria_id': None,
            'autor_id': None,
            'estado_id': 1,
            'fecha_publicacion': fecha_publicacion,
            'visitas': visitas,
            'likes': likes,
            'shares': shares,
            'tiempo_lectura': tiempo_lectura,
            'destacada': destacada,
            'permite_comentarios': permite_comentarios,
            'comentarios_moderados': comentarios_moderados,
            'meta_title': meta_title,
            'meta_description': meta_description,
            'meta_keywords': meta_keywords,
            'datos_estructurados': datos_estructurados,
            'created_at': created_at,
            'updated_at': updated_at,
        }

        cur.execute(insert_sql, params)
        res = cur.fetchone()
        if res:
            count += 1
    except Exception as e:
        print('Error inserting item:', e)
        conn.rollback()

conn.commit()
print('Inserted/Updated:', count)
cur.close()
conn.close()
print('Done')
