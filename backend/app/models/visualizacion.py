from sqlalchemy import Column, Integer, ForeignKey
from app.database import Base

class Visualizacion(Base):
    __tablename__ = "visualizaciones"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id_usuario"))
    pelicula_id = Column(Integer, ForeignKey("peliculas.id_pelicula"))