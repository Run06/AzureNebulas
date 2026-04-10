from sqlalchemy.orm import Session
from app.models.movie import Pelicula
from app.services.tmdb_service import search_movies

def import_movie_from_tmdb(db: Session, query: str):
    results = search_movies(query)

    if not results:
        return None

    movie = results[0]  # primera coincidencia

    new_movie = Pelicula(
        titulo=movie["title"],
        anio_produccion=int(movie["release_date"][:4]) if movie.get("release_date") else None,
        duracion_minutos=120,  # TMDB requiere otra llamada para runtime
        numero_copias_disponibles=1,
        precio_alquiler=3.99,
        activa=True
    )

    db.add(new_movie)
    db.commit()
    db.refresh(new_movie)

    return new_movie