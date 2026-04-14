from sqlalchemy import Column, Integer, String, Boolean, Float
from app.database import Base

class Pelicula(Base):
    __tablename__ = "peliculas"

    id_pelicula = Column(Integer, primary_key=True)
    titulo = Column(String)
    anio_produccion = Column(Integer)
    duracion_minutos = Column(Integer)
    numero_copias_disponibles = Column(Integer)
    precio_alquiler = Column(Float)
    activa = Column(Boolean, default=True)
    disponible = Column(Boolean, default=True)