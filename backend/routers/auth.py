from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserRegister, UserLogin, Token
from dependencies import SECRET_KEY, ALGORITHM

router  = APIRouter(prefix="/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email ya registrado")
    user = User(email=data.email, password=pwd_ctx.hash(data.password))
    db.add(user)
    db.commit()
    return {"message": "Usuario registrado correctamente"}

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not pwd_ctx.verify(data.password, user.password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciales inválidas")
    token = jwt.encode(
        {"sub": user.id, "role": user.role, "exp": datetime.utcnow() + timedelta(hours=8)},
        SECRET_KEY, algorithm=ALGORITHM
    )
    return {"access_token": token}