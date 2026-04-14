from fastapi import FastAPI
from app.database import Base, engine
from app.routes import movies, auth, lists  # <-- Añadido lists
from fastapi.middleware.cors import CORSMiddleware

# Esto crea las tablas en la base de datos (incluyendo la nueva tabla 'listas' y la asociación)
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movies.router)
app.include_router(auth.router)
app.include_router(lists.router)

@app.get("/")
def root():
    return {"msg": "API funcionando"}