from sqlalchemy.orm import Session
from app.models.user import Usuario
from app.utils.security import hash_password

def create_user(db: Session, data):
    # Verificar email existente
    if db.query(Usuario).filter(Usuario.email == data.email).first():
        return None, "EMAIL_EXISTS"

    # Verificar username existente
    if db.query(Usuario).filter(Usuario.nombre_usuario == data.nombre_usuario).first():
        return None, "USERNAME_EXISTS"

    user = Usuario(
        nombre=data.nombre,
        apellidos=data.apellidos,
        email=data.email,
        nombre_usuario=data.nombre_usuario,
        password_hash=hash_password(data.password),
        id_tipo_usuario=0  # por defecto
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user, None