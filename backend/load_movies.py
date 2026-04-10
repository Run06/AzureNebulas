from app.database import SessionLocal, Base, engine
from app.models.movie import Pelicula
from app.services.tmdb_service import search_movies

Base.metadata.create_all(bind=engine)

db = SessionLocal()

queries = [
    "Batman", "Matrix", "Star Wars", "Avengers", "Spider-Man",
    "Inception", "Titanic", "Gladiator", "Joker", "Interstellar"
]

count = 0

for q in queries:
    results = search_movies(q)

    for m in results[:10]:  # 10 por búsqueda → ~100 total
        movie = Pelicula(
            titulo=m.get("title"),
            anio_produccion=int(m["release_date"][:4]) if m.get("release_date") else None,
            duracion_minutos=120,
            numero_copias_disponibles=1,
            precio_alquiler=3.99,
            activa=True
        )

        db.add(movie)
        count += 1

db.commit()

print(f"✔ {count} películas insertadas")