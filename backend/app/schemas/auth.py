from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    nombre: str
    apellidos: str
    email: EmailStr
    nombre_usuario: str
    password: str