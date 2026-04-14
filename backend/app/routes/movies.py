from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.movie import Pelicula
from app.models.visualizacion import Visualizacion
from app.utils.dependencies import get_current_user

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

from app.schemas.movie import MovieUpdate

@router.put("/{movie_id}")
def update_movie(movie_id: int, data: MovieUpdate, db: Session = Depends(get_db)):
    movie = db.query(Pelicula).filter(Pelicula.id_pelicula == movie_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Película no encontrada")

    if data.titulo is not None:
        movie.titulo = data.titulo

    if data.anio_produccion is not None:
        movie.anio_produccion = data.anio_produccion

    if data.precio_alquiler is not None:
        movie.precio_alquiler = data.precio_alquiler

    db.commit()
    db.refresh(movie)

    return {"message": "Película actualizada", "movie": movie}

from pydantic import BaseModel

class MovieCreate(BaseModel):
    titulo: str
    anio_produccion: int
    precio_alquiler: float

# ======================
# CREATE MOVIE (ADMIN)
# ======================
@router.post("/")
def create_movie(data: MovieCreate, db: Session = Depends(get_db)):
    nueva_pelicula = Pelicula(
        titulo=data.titulo,
        anio_produccion=data.anio_produccion,
        precio_alquiler=data.precio_alquiler,
        disponible=True # Por defecto entran disponibles
    )
    db.add(nueva_pelicula)
    db.commit()
    db.refresh(nueva_pelicula)
    return {"message": "Película añadida", "movie": nueva_pelicula}

@router.post("/{movie_id}/toggle-view")
def toggle_view(movie_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Visualizacion).filter(
        Visualizacion.usuario_id == user.id_usuario,
        Visualizacion.pelicula_id == movie_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Visualización eliminada"}
    else:
        new_view = Visualizacion(
            usuario_id=user.id_usuario,
            pelicula_id=movie_id
        )
        db.add(new_view)
        db.commit()
        return {"message": "Película marcada como vista"}

@router.get("/mis-visualizaciones")
def get_my_views(user=Depends(get_current_user), db: Session = Depends(get_db)):
    views = db.query(Pelicula).join(
        Visualizacion,
        Visualizacion.pelicula_id == Pelicula.id_pelicula
    ).filter(
        Visualizacion.usuario_id == user.id_usuario
    ).all()

    return views