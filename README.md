# AzureNebulas
Proyecto grupal para la asignatura de Gestión de Proyectos del grado en Ingeniería Informática de Gestión y Sistemas de Información en la EHU.

# 1. Instalar dependencias
cd backend

pip install -r requirements.txt

# 2. Arrancar el servidor (crea la BD automáticamente al inicio)
#Instalar si no se tiene (pip install uvicorn)

uvicorn main:app --reload

# 3. Acceder a la documentación interactiva de la API
http://localhost:8000/docs

# 4. Abrir el frontend
Abrir frontend/index.html directamente en el navegador
