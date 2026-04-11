from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import Usuario
from app.utils.security import verify_password, create_token
from app.schemas.auth import LoginRequest  # 👈 IMPORTANTE

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