from pydantic import BaseModel
from typing import Optional

class MovieBase(BaseModel):
    titulo: str
    anio_produccion: int
    precio_alquiler: float

class MovieResponse(MovieBase):
    id_pelicula: int

    class Config:
        from_attributes = True

class MovieUpdate(BaseModel):
    titulo: Optional[str] = None
    anio_produccion: Optional[int] = None
    precio_alquiler: Optional[float] = None