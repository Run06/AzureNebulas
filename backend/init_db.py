from app.database import SessionLocal, Base, engine
from app.models.user import Usuario, TipoUsuario
from app.utils.security import hash_password

# 🔥 CREAR TABLAS PRIMERO
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Tipos usuario
admin = TipoUsuario(id_tipo_usuario=1, nombre_tipo="ADMIN")
user = TipoUsuario(id_tipo_usuario=2, nombre_tipo="USER")

db.add_all([admin, user])
db.commit()

# Usuario admin
admin_user = Usuario(
    nombre="Admin",
    apellidos="Sistema",
    email="admin@videoteca.com",
    nombre_usuario="admin",
    password_hash=hash_password("admin"),
    id_tipo_usuario=1
)

db.add(admin_user)
db.commit()

print("✔ Base de datos creada correctamente")