from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.movie import Pelicula
from app.services.movie_service import import_movie_from_tmdb

router = APIRouter(prefix="/movies")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_movies(db: Session = Depends(get_db)):
    return db.query(Pelicula).filter(Pelicula.activa == True).all()

@router.post("/import")
def import_movie(query: str, db: Session = Depends(get_db)):
    movie = import_movie_from_tmdb(db, query)

    if not movie:
        return {"error": "No encontrada"}

    return movie