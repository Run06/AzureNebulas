from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

# Tabla intermedia para la relación muchos a muchos
lista_pelicula_association = Table(
    'lista_pelicula',
    Base.metadata,
    Column('id_lista', Integer, ForeignKey('listas.id', ondelete="CASCADE"), primary_key=True),
    Column('id_pelicula', Integer, ForeignKey('peliculas.id_pelicula', ondelete="CASCADE"), primary_key=True)
)

class Lista(Base):
    __tablename__ = "listas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255), nullable=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)

    # Relación corregida con "Pelicula"
    peliculas = relationship("Pelicula", secondary=lista_pelicula_association, backref="listas")