from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.movie import Pelicula

router = APIRouter(prefix="/movies")


# ======================
# DB SESSION
# ======================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ======================
# GET MOVIES (FILTRADO BD)
# ======================
@router.get("/")
def get_movies(disponible: bool = True, db: Session = Depends(get_db)):
    return db.query(Pelicula).filter(
        Pelicula.disponible == disponible
    ).all()


# ======================
# TOGGLE DISPONIBILIDAD
# ======================
@router.put("/{movie_id}/disponibilidad")
def update_disponibilidad(movie_id: int, data: dict, db: Session = Depends(get_db)):
    movie = db.query(Pelicula).filter(Pelicula.id_pelicula == movie_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Película no encontrada")

    movie.disponible = data.get("disponible")

    db.commit()
    db.refresh(movie)

    return {"message": "Estado actualizado", "movie": movie}