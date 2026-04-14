from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.database import Base

class TipoUsuario(Base):
    __tablename__ = "tipos_usuario"

    id_tipo_usuario = Column(Integer, primary_key=True, index=True)
    nombre_tipo = Column(String, unique=True)


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    apellidos = Column(String)
    email = Column(String, unique=True)
    nombre_usuario = Column(String, unique=True)
    password_hash = Column(String)
    id_tipo_usuario = Column(Integer, ForeignKey("tipos_usuario.id_tipo_usuario"))
    activo = Column(Boolean, default=True)