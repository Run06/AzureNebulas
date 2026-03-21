from pydantic import BaseModel, EmailStr
from models import Role

# Auth
class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Movies
class MovieBase(BaseModel):
    title: str
    director: str
    year: int
    genre: str

class MovieOut(MovieBase):
    id: int
    class Config:
        from_attributes = True