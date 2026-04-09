from sqlalchemy import Column, Integer, String, Boolean
from app.db.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True)
    password_hash = Column(String(255))
    activo = Column(Boolean)
    id_tipo_usuario = Column(Integer)


class Pelicula(Base):
    __tablename__ = "peliculas"

    id_pelicula = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255))
    anio_produccion = Column(Integer)