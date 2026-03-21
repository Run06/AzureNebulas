from sqlalchemy import Column, Integer, String, Enum as SAEnum
from database import Base
import enum

class Role(str, enum.Enum):
    admin = "admin"
    user  = "user"

class User(Base):
    __tablename__ = "users"
    id       = Column(Integer, primary_key=True, index=True)
    email    = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role     = Column(SAEnum(Role), default=Role.user, nullable=False)

class Movie(Base):
    __tablename__ = "movies"
    id       = Column(Integer, primary_key=True, index=True)
    title    = Column(String, nullable=False)
    director = Column(String, nullable=False)
    year     = Column(Integer, nullable=False)
    genre    = Column(String, nullable=False)