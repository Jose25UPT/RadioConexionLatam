"""
Script para poblar la base de datos con noticias de ejemplo.
Ejecutar una sola vez para inicializar los datos.
"""

from sqlalchemy.orm import Session
from datetime import date
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.base_datos import SessionLocal
from app.modelos import Noticia
from app.utils import generar_slug, tags_a_json

def poblar_noticias():
    db = SessionLocal()
    
    try:
        # Verificar si ya hay noticias
        if db.query(Noticia).count() > 0:
            print("La base de datos ya tiene noticias. Saliendo...")
            return
        
        noticias_ejemplo = [
            {
                "titulo": "Hiroyuki Sawano: El compositor que redefinió la épica moderna del anime",
                "resumen": "A los 30 años de carrera, analizamos el legado musical de Sawano desde Attack on Titan hasta Blue Exorcist, y cómo sus composiciones orquestales han influenciado una generación completa de otakus que crecimos con sus soundtracks.",
                "contenido": """Cuando escuchamos los primeros compases de "Vogel im Käfig" o la explosiva entrada de "Attack on Titan", algo sucede en nuestro interior que trasciende la simple apreciación musical. Hiroyuki Sawano no solo compone música; arquitectura emociones, construye universos sonoros que han definido la experiencia otaku de toda una generación que ahora ronda los treinta años.

**El Arquitecto de Emociones Épicas**

Nacido en 1980, Sawano comenzó su carrera en un momento crucial de la industria del anime. Mientras muchos compositores seguían fórmulas establecidas, él decidió romper las reglas. Sus primeros trabajos ya mostraban esa característica fusión de elementos orquestales clásicos con sintetizadores modernos, creando un sonido que se sentiría tanto familiar como revolucionario.

La genialidad de Sawano reside en su capacidad para hacer que cada pieza musical no solo acompañe la narrativa, sino que la potencie exponencialmente. Cuando escuchamos "YouSeeBIGGIRL" durante las revelaciones de Attack on Titan, no solo estamos oyendo música de fondo; estamos experimentando el peso emocional de la traición y la revelación a través del sonido.

**La Evolución de un Genio Musical**

Lo que distingue a Sawano de otros compositores de anime es su versatilidad sin perder identidad. Puede crear la melancolía introspectiva de "Call Your Name" para Attack on Titan, la energía frenética de "Blumenkranz" para Kill la Kill, o la épica espacial de "Before My Body is Dry" en el mismo anime, y aún así mantener esa firma sonora inconfundible.

Para quienes hemos seguido su carrera durante más de una década, resulta fascinante observar cómo ha evolucionado junto a nosotros. Sus composiciones más recientes muestran una madurez y complejidad que refleja no solo su crecimiento como artista, sino también el de su audiencia. Ya no somos los adolescentes que descubrieron el anime; somos adultos que entienden las capas más profundas de sus composiciones.

**El Legado que Trasciende Generaciones**

Sawano ha logrado algo que pocos compositores consiguen: crear música que funciona tanto dentro como fuera del contexto del anime. Sus conciertos están llenos de adultos que crecieron con sus soundtracks, y sus composiciones se han convertido en parte de la banda sonora de nuestras vidas.

La influencia de Sawano se extiende más allá del anime. Ha inspirado a toda una nueva generación de compositores y ha demostrado que la música de anime puede ser tan compleja, emotiva y técnicamente brillante como cualquier otra forma de composición musical.

**Reflexiones de un Otaku Maduro**

Al repasar tres décadas de la carrera de Sawano, no puedo evitar reflexionar sobre cómo sus composiciones han sido la banda sonora de nuestra evolución como otakus. Hemos pasado de ser jóvenes entusiastas a adultos con responsabilidades, pero la música de Sawano sigue teniendo el poder de transportarnos a esos momentos de pura emoción épica.

Su música nos recuerda que crecer no significa perder la capacidad de sentir con intensidad, de emocionarse con una gran composición orquestal, de valorar el arte que trasciende las barreras generacionales. Hiroyuki Sawano no es solo un compositor; es el guardián de nuestras emociones otaku más profundas.""",
                "autor": "Kenji Nakamura",
                "fecha": date(2024, 1, 15),
                "imagen": "/logo.jpg",
                "categoria": "Clásicos",
                "programa": "Nostálgicos del Anime",
                "tags": ["hiroyuki-sawano", "nostalgia", "análisis-musical", "legacy"],
                "vistas": 2850,
                "likes": 445,
                "comentarios": 127,
                "destacada": True
            },
            {
                "titulo": "Studio Ghibli y la filosofía de la madurez emocional",
                "resumen": "Un análisis profundo de cómo las obras de Miyazaki han evolucionado para abordar temas de pérdida, nostalgia y crecimiento personal que resuenan especialmente con espectadores adultos.",
                "contenido": """Las películas de Studio Ghibli no son solo entretenimiento; son meditaciones visuales sobre la condición humana. Para quienes hemos crecido con estas obras, cada revisión revela nuevas capas de significado que solo la experiencia de vida puede desentrañar.

**La Sabiduría del Tiempo**

Miyazaki entiende algo fundamental sobre el anime: que sus espectadores crecen. Las películas de Ghibli funcionan en múltiples niveles, ofreciendo aventuras coloridas para los jóvenes y reflexiones profundas para los adultos. Cuando volvemos a ver "El Viaje de Chihiro" a los treinta años, no vemos solo la historia de una niña perdida; vemos una metáfora sobre encontrar nuestra identidad en un mundo que constantemente nos despoja de ella.

**Temas Universales con Corazón Japonés**

La genialidad de Ghibli reside en su capacidad para abordar temas universales a través de una lente específicamente japonesa. El respeto por la naturaleza, la importancia de la comunidad, la aceptación de la impermanencia: estos conceptos resuenan con audiencias globales precisamente porque están profundamente arraigados en una cultura específica.

Para los otakus maduros, las películas de Ghibli ofrecen algo que pocas obras logran: la validación de nuestras emociones complejas y contradictorias. Nos enseñan que está bien sentir nostalgia, que es natural temer al cambio, y que encontrar belleza en la melancolía no es debilidad sino sabiduría.""",
                "autor": "Miyuki Tanaka",
                "fecha": date(2024, 1, 10),
                "imagen": "/logo.jpg",
                "categoria": "Ghibli",
                "programa": "Cine de Autor Anime",
                "tags": ["ghibli", "miyazaki", "filosofia", "madurez"],
                "vistas": 2156,
                "likes": 389,
                "comentarios": 98,
                "destacada": True
            },
            {
                "titulo": "La evolución del seinen: De Akira a Monster",
                "resumen": "Exploramos la trayectoria del anime dirigido a adultos y cómo obras como Monster, Berserk y Ghost in the Shell han establecido nuevos estándares narrativos para audiencias maduras.",
                "contenido": """El seinen representa la culminación artística del medio anime, donde la complejidad narrativa y temática alcanza su máxima expresión. Para los otakus que hemos madurado, estas obras ofrecen la profundidad que buscamos.

**Más Allá del Entretenimiento**

Obras como "Monster" de Naoki Urasawa no solo cuentan historias; exploran la psicología humana con una profundidad que rivaliza con la literatura clásica. La pregunta central de Monster no es quién es el monstruo, sino qué nos convierte en monstruos. Esta es la clase de introspección que caracteriza al mejor seinen.

**La Madurez Narrativa**

El seinen no teme abordar temas difíciles: la moralidad ambigua, la corrupción del poder, la naturaleza de la identidad en la era digital. "Ghost in the Shell" predijo muchas de las preocupaciones actuales sobre la inteligencia artificial y la identidad digital, mientras que "Berserk" ofrece una de las exploraciones más brutales y honestas sobre el trauma y la supervivencia.""",
                "autor": "Hiroshi Yamamoto",
                "fecha": date(2024, 1, 5),
                "imagen": "/logo.jpg",
                "categoria": "Análisis",
                "programa": "Seinen Profundo",
                "tags": ["seinen", "monster", "akira", "analisis"],
                "vistas": 3200,
                "likes": 512,
                "comentarios": 156,
                "destacada": False
            }
        ]
        
        for noticia_data in noticias_ejemplo:
            # Generar slug único
            slug = generar_slug(noticia_data["titulo"])
            
            # Convertir tags a JSON
            tags_json = tags_a_json(noticia_data.pop("tags"))
            
            # Crear noticia
            noticia = Noticia(
                **noticia_data,
                slug=slug,
                tags=tags_json
            )
            
            db.add(noticia)
            print(f"✓ Agregada: {noticia.titulo}")
        
        db.commit()
        print(f"\n🎉 Se agregaron {len(noticias_ejemplo)} noticias exitosamente!")
        
    except Exception as e:
        print(f"❌ Error al poblar la base de datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    poblar_noticias()