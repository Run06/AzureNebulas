from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt
from app.utils.security import decode_token
from app.database import SessionLocal
from app.models.user import Usuario

security = HTTPBearer()

def get_current_user(token=Depends(security)):
    payload = decode_token(token.credentials)

    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")

    db = SessionLocal()
    user = db.query(Usuario).filter(Usuario.email == payload.get("sub")).first()

    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    return user