from sqlalchemy.orm import Session
from app.models.user import Usuario
from app.utils.security import verify_password, create_token

def login_user(db: Session, email: str, password: str):
    user = db.query(Usuario).filter(Usuario.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    token = create_token({"sub": user.email})
    return token