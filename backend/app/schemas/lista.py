from pydantic import BaseModel
from typing import Optional, List

class ListaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class ListaCreate(ListaBase):
    pass

class ListaUpdate(ListaBase):
    pass

class ListaOut(ListaBase):
    id: int
    id_usuario: int

    class Config:
        from_attributes = True # Pydantic V2

class AddMovieToList(BaseModel):
    id_pelicula: int