import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
json_path = ROOT / 'noticias.json'
out_path = ROOT / 'bd' / 'init' / '03-import-noticias.sql'

def esc(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def parse_fecha(fecha_raw):
    if not fecha_raw:
        return None
    # Try to extract date before '|' if present
    part = fecha_raw.split('|')[0].strip()
    # Expected format like '04 Apr 2025' or '4 Apr 2025'
    for fmt in ('%d %b %Y', '%d %B %Y', '%Y-%m-%d'):
        try:
            dt = datetime.strptime(part, fmt)
            return dt.strftime('%Y-%m-%d')
        except Exception:
            continue
    # If failed, return None
    return None

def main():
    data = json.loads(json_path.read_text(encoding='utf-8'))
    lines = []
    lines.append('-- Auto-generated SQL inserts from noticias.json')
    lines.append('BEGIN;')
    for item in data:
        # Map JSON fields to the current DB schema columns
        autor_id = 'NULL'  # leave autor_id NULL unless you want to create/map users first
        titulo = esc(item.get('titulo'))
        slug = esc(item.get('slug'))
        resumen = esc(item.get('resumen'))
        contenido = esc(item.get('contenido'))
        fecha_val = parse_fecha(item.get('fecha'))
        fecha_publicacion = esc(fecha_val) if fecha_val else 'CURRENT_DATE'
        imagen_principal = esc(item.get('imagen'))
        visitas = int(item.get('vistas') or 0)
        destacada = 'true' if item.get('destacada') else 'false'
        likes = int(item.get('likes') or 0)
        created_at = esc(item.get('fecha_creacion') or '')
        updated_at = esc(item.get('fecha_actualizacion') or '')

        # Simple INSERT matching the repository's `noticias` table schema
        sql = (
            "INSERT INTO noticias (autor_id, titulo, slug, resumen, contenido, fecha_publicacion, imagen_principal, visitas, destacada, likes, created_at, updated_at) VALUES ("
            f"{autor_id}, {titulo}, {slug}, {resumen}, {contenido}, {fecha_publicacion}, {imagen_principal}, {visitas}, {destacada}, {likes}, "
            f"{created_at if created_at != 'NULL' else 'CURRENT_TIMESTAMP'}, {updated_at if updated_at != 'NULL' else 'CURRENT_TIMESTAMP'});")
        lines.append(sql)

    lines.append('COMMIT;')
    out_path.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Wrote {out_path}')

if __name__ == '__main__':
    main()
