from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.lista import Lista
from app.models.movie import Pelicula  # Nombre corregido
from app.schemas.lista import ListaCreate, ListaUpdate, ListaOut, AddMovieToList
from app.routes.auth import get_current_user

router = APIRouter(
    prefix="/lists",
    tags=["Listas"]
)


@router.get("/", response_model=List[ListaOut])
def get_user_lists(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Lista).filter(Lista.id_usuario == current_user.id_usuario).all()


@router.post("/", response_model=ListaOut)
def create_list(lista_data: ListaCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    nueva_lista = Lista(
        nombre=lista_data.nombre,
        descripcion=lista_data.descripcion,
        id_usuario=current_user.id_usuario
    )
    db.add(nueva_lista)
    db.commit()
    db.refresh(nueva_lista)
    return nueva_lista


@router.put("/{list_id}", response_model=ListaOut)
def update_list(list_id: int, lista_data: ListaUpdate, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    lista = db.query(Lista).filter(Lista.id == list_id, Lista.id_usuario == current_user.id_usuario).first()
    if not lista:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    lista.nombre = lista_data.nombre
    lista.descripcion = lista_data.descripcion
    db.commit()
    db.refresh(lista)
    return lista


@router.delete("/{list_id}")
def delete_list(list_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    lista = db.query(Lista).filter(Lista.id == list_id, Lista.id_usuario == current_user.id_usuario).first()
    if not lista:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    db.delete(lista)
    db.commit()
    return {"message": "Lista eliminada exitosamente"}


@router.get("/{list_id}/movies")
def get_list_movies(list_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    lista = db.query(Lista).filter(Lista.id == list_id, Lista.id_usuario == current_user.id_usuario).first()
    if not lista:
        raise HTTPException(status_code=404, detail="Lista no encontrada")
    return lista.peliculas


@router.post("/{list_id}/movies")
def add_movie_to_list(list_id: int, data: AddMovieToList, db: Session = Depends(get_db),
                      current_user=Depends(get_current_user)):
    lista = db.query(Lista).filter(Lista.id == list_id, Lista.id_usuario == current_user.id_usuario).first()
    if not lista: raise HTTPException(status_code=404, detail="Lista no encontrada")

    # Buscamos por id_pelicula como en tu modelo
    pelicula = db.query(Pelicula).filter(Pelicula.id_pelicula == data.id_pelicula).first()
    if not pelicula: raise HTTPException(status_code=404, detail="Película no encontrada")

    if pelicula in lista.peliculas:
        raise HTTPException(status_code=400, detail="La película ya está en la lista")

    lista.peliculas.append(pelicula)
    db.commit()
    return {"message": "Película añadida a la lista"}


@router.delete("/{list_id}/movies/{id_pelicula}")
def remove_movie_from_list(list_id: int, id_pelicula: int, db: Session = Depends(get_db),
                           current_user=Depends(get_current_user)):
    lista = db.query(Lista).filter(Lista.id == list_id, Lista.id_usuario == current_user.id_usuario).first()
    if not lista: raise HTTPException(status_code=404, detail="Lista no encontrada")

    pelicula = db.query(Pelicula).filter(Pelicula.id_pelicula == id_pelicula).first()
    if not pelicula or pelicula not in lista.peliculas:
        raise HTTPException(status_code=404, detail="La película no está en la lista")

    lista.peliculas.remove(pelicula)
    db.commit()
    return {"message": "Película eliminada de la lista"}