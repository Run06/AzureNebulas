from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import Usuario
from app.utils.security import verify_password, create_token
from app.schemas.auth import LoginRequest  # 👈 IMPORTANTE
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.auth_service import create_user
from app.utils.security import decode_token
from app.utils.dependencies import get_current_user
from pydantic import BaseModel, EmailStr
from typing import Optional

class UpdateUser(BaseModel):
    nombre: Optional[str] = None
    apellidos: Optional[str] = None
    email: Optional[EmailStr] = None
    nombre_usuario: Optional[str] = None

router = APIRouter(prefix="/auth")

# ======================
# DB DEPENDENCY
# ======================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ======================
# LOGIN (CORREGIDO)
# ======================
@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # Buscar usuario
    user = db.query(Usuario).filter(Usuario.email == data.email).first()

    # Validar credenciales
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    # Crear token
    token = create_token({"sub": user.email})

    return {
        "access_token": token,
        "role": user.id_tipo_usuario
    }

# ======================
# REGISTER
# ======================
@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user, error = create_user(db, data)

    if error == "EMAIL_EXISTS":
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    if error == "USERNAME_EXISTS":
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    return {"message": "Usuario creado correctamente"}



@router.get("/me")
def get_me(user = Depends(get_current_user)):
    return {
        "email": user.email,
        "nombre": user.nombre,
        "apellidos": user.apellidos,
        "username": user.nombre_usuario,
        "role": user.id_tipo_usuario
    }

@router.put("/me")
def update_me(
    data: UpdateUser,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.merge(user)
    if data.nombre is not None:
        user.nombre = data.nombre

    if data.apellidos is not None:
        user.apellidos = data.apellidos

    if data.email is not None:
        user.email = data.email

    if data.nombre_usuario is not None:
        user.nombre_usuario = data.nombre_usuario

    try:
        db.commit()
        db.refresh(user)
        return {"message": "Usuario actualizado", "nombre": user.nombre}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en base de datos: {str(e)}")

    return {"message": "Usuario actualizado"}