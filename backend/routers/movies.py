from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Movie, User
from schemas import MovieBase, MovieOut
from dependencies import get_current_user, require_admin
from typing import List

router = APIRouter(prefix="/movies", tags=["movies"])

@router.get("", response_model=List[MovieOut])
def list_movies(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Movie).all()

@router.get("/{movie_id}", response_model=MovieOut)
def get_movie(movie_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    movie = db.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Película no encontrada")
    return movie

@router.post("", response_model=MovieOut, status_code=status.HTTP_201_CREATED)
def create_movie(data: MovieBase, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    movie = Movie(**data.model_dump())
    db.add(movie)
    db.commit()
    db.refresh(movie)
    return movie

@router.put("/{movie_id}", response_model=MovieOut)
def update_movie(movie_id: int, data: MovieBase, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    movie = db.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Película no encontrada")
    for k, v in data.model_dump().items():
        setattr(movie, k, v)
    db.commit()
    db.refresh(movie)
    return movie

@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(movie_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    movie = db.get(Movie, movie_id)
    if not movie:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Película no encontrada")
    db.delete(movie)
    db.commit()