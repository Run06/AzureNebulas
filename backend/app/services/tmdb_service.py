import requests
from app.config import TMDB_API_KEY

def search_movies(query: str):
    url = "https://api.themoviedb.org/3/search/movie"

    params = {
        "api_key": TMDB_API_KEY,
        "query": query,
        "language": "es-ES"
    }

    res = requests.get(url, params=params)

    print(res.status_code)
    print(res.text[:200])

    return res.json().get("results", [])