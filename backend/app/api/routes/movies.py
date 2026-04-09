from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.crud.movie import get_movies

router = APIRouter()

@router.get("/")
def read_movies(db: Session = Depends(get_db)):
    movies = get_movies(db)

    return [
        {
            "id": m.id_pelicula,
            "title": m.titulo,
            "year": m.anio_produccion,
            "category": m.genero
        }
        for m in movies
    ]