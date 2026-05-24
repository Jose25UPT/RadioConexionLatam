from fastapi import APIRouter
from datetime import datetime
import os

try:
    import mysql.connector
    _mysql_available = True
except ImportError:
    _mysql_available = False

DB_HOST     = os.getenv("FC_DB_HOST", "161.132.47.193")
DB_PORT     = int(os.getenv("FC_DB_PORT", "3306"))
DB_NAME     = os.getenv("FC_DB_NAME", "fanschoice")
DB_USER     = os.getenv("FC_DB_USER", "radiolatam")
DB_PASSWORD = os.getenv("FC_DB_PASSWORD", "")
FECHA_CORTE = "2026-04-30 23:59:59"

CATEGORIAS: dict[int, tuple[str, list[str]]] = {
    1:  ("Cosplayer",               ["Milcarastacna", "Arthur", "BrutuS", "Tora 7"]),
    2:  ("Evento viral",            ["Coches locos", "Día del rock tacneño 2025", "FestiGAL otaku", "Juegos del calamar", "Natsukoi III"]),
    3:  ("Tienda favorita",         ["Asia novedades Tacna", "Meraki", "TACNA_CELL", "Yume Sekai", "mijo_store"]),
    4:  ("Creador de contenido",    ["CONEXIÓN TACNA", "DESCONECTADOS", "El Tío Moneda", "IritaGamer", "Somos Tacna"]),
    5:  ("Animador de eventos geek",["Aceitunita", "Kirara Neko Chan", "Lumaru chan", "Pollosor"]),
    6:  ("Banda musical",           ["Bleseé", "Fuego artificial", "Gato traumado", "Isla nagori"]),
    7:  ("Streamer",                ['DHAYANA PALMEIRA "La loba"', "Retr'OS - Tacna", "leaosggg", "yapecausita"]),
    8:  ("Influencer",              ["Elmero_Loco", "La Nona", "Polett", "Tocache - Colors", "olitacna"]),
    9:  ("Medio informativo geek",  ["Estudio Geek", "LUAN TV", "La Hora Friki Oficial", "Shinsekai Tacna"]),
    10: ("Reportero geek",          ["Alnold Smith Tongo", "Bruno Ghersi", "Jordan Flores", "Luizito Garcia Flores"]),
}

router = APIRouter(prefix="/api/fanschoice", tags=["Fans Choice"])


def _fetch_and_build() -> dict:
    if not _mysql_available:
        raise RuntimeError("mysql-connector-python no instalado en el servidor")

    conn = mysql.connector.connect(
        host=DB_HOST, port=DB_PORT,
        database=DB_NAME, user=DB_USER, password=DB_PASSWORD,
        charset="utf8mb4", connection_timeout=10,
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT v.votante_id, v.categoria, v.opcion
        FROM votos v
        JOIN votantes vt ON v.votante_id = vt.id
        JOIN logs l ON l.votante_id = v.votante_id
                   AND l.categoria  = v.categoria
                   AND l.opcion     = v.opcion
                   AND l.accion     = 'voto_realizado'
        WHERE l.fecha <= %s
        ORDER BY v.votante_id, v.categoria
    """, (FECHA_CORTE,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    counts: dict[int, dict[str, int]] = {
        cat_id: {c: 0 for c in candidates}
        for cat_id, (_, candidates) in CATEGORIAS.items()
    }
    for row in rows:
        cat = row["categoria"]
        opt = row["opcion"] - 1
        if cat in CATEGORIAS and 0 <= opt < len(CATEGORIAS[cat][1]):
            counts[cat][CATEGORIAS[cat][1][opt]] += 1

    categories = []
    for cat_id, (cat_name, _) in CATEGORIAS.items():
        cat_counts = counts[cat_id]
        sorted_cands = sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)
        total = sum(cat_counts.values())
        categories.append({
            "id": cat_id,
            "name": cat_name,
            "total_votes": total,
            "candidates": [
                {
                    "position": pos,
                    "name": name,
                    "votes": votes,
                    "percentage": round(votes / total * 100, 1) if total else 0,
                    "is_winner": pos == 1,
                }
                for pos, (name, votes) in enumerate(sorted_cands, 1)
            ],
        })

    return {
        "categories": categories,
        "cutoff_date": FECHA_CORTE,
        "total_records": len(rows),
        "generated_at": datetime.now().isoformat(),
    }


@router.get("/resultados")
def obtener_resultados():
    try:
        return _fetch_and_build()
    except Exception as e:
        return {
            "error": str(e),
            "categories": [],
            "cutoff_date": FECHA_CORTE,
            "total_records": 0,
            "generated_at": datetime.now().isoformat(),
        }
