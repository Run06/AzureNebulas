from sqlalchemy.orm import Session
from sqlalchemy import text

def get_movies(db: Session):
    result = db.execute(text("SELECT * FROM v_peliculas_disponibles"))
    return result.fetchall()