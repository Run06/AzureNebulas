# AzureNebulas
Proyecto grupal para la asignatura de Gestión de Proyectos del grado en Ingeniería Informática de Gestión y Sistemas de Información en la EHU.

# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Instalar dependencias
cd backend

py init_db.py      (Crear base de datos vacía)

py load_movies.py     (Necesario .env con API key para cargar películas, TMDB_API_KEY = "clave")

# 3. Arrancar el servidor (crea la BD automáticamente al inicio)
#Instalar si no se tiene (pip install uvicorn)

cd backend

uvicorn main:app --reload

# 4. Acceder a la documentación interactiva de la API
http://localhost:8000/docs

# 5. Abrir el frontend
!!! Versión bcrypt (pip install bcrypt==4.0.1). Por incompatibilidad con passlib. (Posible error)

En PyCharm: Click derecho al fichero index.html -> Abrir con Browser (http://localhost:63342/AzureNebulas/frontend/index.html)
