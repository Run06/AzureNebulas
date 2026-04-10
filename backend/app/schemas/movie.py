from pydantic import BaseModel

class MovieBase(BaseModel):
    titulo: str
    anio_produccion: int
    precio_alquiler: float

class MovieResponse(MovieBase):
    id_pelicula: int

    class Config:
        orm_mode = True