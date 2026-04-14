const API_BASE = "http://localhost:8000";

// ======================
// API
// ======================
const API = {
    getMovies: async (disponible = true) => {
        try {
            const res = await fetch(`${API_BASE}/movies/?disponible=${disponible}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            return [];
        }
    },
    toggleDisponible: async (id, disponible) => {
        const res = await fetch(`${API_BASE}/movies/${id}/disponibilidad`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ disponible })
        });
        return await res.json();
    },
    updateMovie: async (id, data) => {
        const res = await fetch(`${API_BASE}/movies/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return await res.json();
    },
    addMovie: async (data) => {
        const res = await fetch(`${API_BASE}/movies/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return await res.json();
    },
    login: async (email, password) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        return await res.json();
    },
    register: async (data) => {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return await res.json();
    },
    getMe: async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await res.json();
    },
    updateMe: async (data) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/auth/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    },
    getAllUsers: async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/auth/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await res.json();
    },
    updateUserAdmin: async (id, data) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/auth/users/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    },
    toggleView: async (id) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/movies/${id}/toggle-view`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await res.json();
    },
    getMyViews: async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/movies/mis-visualizaciones`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await res.json();
    },
    getUserViews: async (userId) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/movies/user/${userId}/visualizaciones`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await res.json();
    },

    // --- NUEVOS MÉTODOS DE LISTAS ---
    getLists: async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/lists/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await res.json();
    },
    createList: async (data) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/lists/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        return await res.json();
    },
    updateList: async (id, data) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/lists/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        return await res.json();
    },
    deleteList: async (id) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/lists/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await res.json();
    },
    getListMovies: async (id) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/lists/${id}/movies`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await res.json();
    },
    addMovieToList: async (listId, movieId) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/lists/${listId}/movies`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ id_pelicula: movieId })
        });
        return await res.json();
    },
    removeMovieFromList: async (listId, movieId) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/lists/${listId}/movies/${movieId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await res.json();
    }
};

// ======================
// VISTAS
// ======================
const Views = {
    home: () => `
        <section>
            <h2>Bienvenido a Videoteca Paradiso</h2>
        </section>
    `,
    catalogo: () => {
        const role = localStorage.getItem("role");
        return `
            <h2>Catálogo de películas</h2>
            ${role == 1 ? `
                <div style="display:flex; gap:40px; margin-bottom:20px; align-items: flex-end;">
                    <div>
                        <h4>Películas disponibles</h4>
                        <select id="selectDisponibles"></select>
                        <button onclick="darDeBaja()">Dar de baja</button>
                    </div>
                    <div>
                        <h4>Películas no disponibles</h4>
                        <select id="selectNoDisponibles"></select>
                        <button onclick="darDeAlta()">Dar de alta</button>
                    </div>
                    <div>
                        <button onclick="showMovieForm()" style="background-color: #28a745; color: white;">+ Añadir Película</button>
                    </div>
                </div>
            ` : ``}
            <div id="moviesContainer">Cargando...</div>
        `;
    },
    login: () => `
        <h2>Login</h2>
        <form onsubmit="event.preventDefault(); loginUser();">
            <input id="email" type="email" placeholder="Email" required>
            <input id="password" type="password" placeholder="Password" required>
            <button type="submit">Entrar</button>
        </form>
        <p id="loginMsg"></p>
        <p>¿No tienes cuenta? <a href="#" data-link="register">Regístrate</a></p>
    `,
    register: () => `
        <h2>Registro</h2>
        <form onsubmit="event.preventDefault(); registerUser();">
            <input id="nombre" placeholder="Nombre" required>
            <input id="apellidos" placeholder="Apellidos" required>
            <input id="username" placeholder="Usuario" required>
            <input id="email" type="email" placeholder="Email" required>
            <input id="password" type="password" placeholder="Password" required>
            <button type="submit">Registrarse</button>
        </form>
        <p id="registerMsg"></p>
    `,
    perfil: () => `
        <h2>Mi perfil</h2>
        <input id="nombre" placeholder="Nombre">
        <input id="apellidos" placeholder="Apellidos">
        <input id="username" placeholder="Usuario">
        <input id="email" placeholder="Email">
        <button onclick="updateProfile()">Guardar cambios</button>
        <p id="perfilMsg"></p>
    `,
    adminUsuarios: () => `
        <h2>Gestión de Usuarios</h2>
        <div id="usersContainer">Cargando usuarios...</div>
    `,
    misVisualizaciones: () => `
        <h2>Mis películas vistas</h2>
        <div id="viewsContainer">Cargando...</div>
    `,
    // --- NUEVAS VISTAS DE LISTAS ---
    listas: () => `
        <h2>Mis Listas</h2>
        <button onclick="showListForm()" style="background-color: #28a745; color: white; margin-bottom: 20px;">+ Crear Nueva Lista</button>
        <div id="listsContainer">Cargando listas...</div>
    `,
    listaDetalle: (nombreLista) => `
        <h2>Detalle: ${nombreLista}</h2>
        <div style="margin-bottom:20px;">
            <button onclick="loadRoute('listas')" style="background-color: #6c757d; color: white;">Volver a Listas</button>
            <button onclick="showAddMovieToListForm()" style="background-color: #007bff; color: white;">+ Añadir Película a esta lista</button>
        </div>
        <div id="listMoviesContainer">Cargando películas de la lista...</div>
    `
};

// ======================
// RENDER PELÍCULAS
// ======================
async function renderMovies(disponible = true) {
    const movies = await API.getMovies(disponible);
    const role = localStorage.getItem("role");
    const container = document.getElementById("moviesContainer");

    const myViews = await API.getMyViews();
    const viewedIds = myViews.map(v => v.id_pelicula);

    if (!movies || movies.length === 0) {
        container.innerHTML = "<p>No hay películas</p>";
        return;
    }

    container.innerHTML = `
        <div class="grid">
            ${movies.map(m => `
                <div class="card">
                    <h3>${m.titulo}</h3>
                    <p>Año: ${m.anio_produccion ?? 'N/A'}</p>
                    <p>Precio: ${m.precio_alquiler ?? '0'} €</p>
                    ${role == 1 ? `
                        <button onclick="showMovieForm(${m.id_pelicula}, '${m.titulo.replace(/'/g, "\\'")}', ${m.anio_produccion}, ${m.precio_alquiler})">
                            Editar
                        </button>
                    ` : ``}
                    <button 
                        onclick="toggleView(${m.id_pelicula}, this)"
                        style="
                            background:${viewedIds.includes(m.id_pelicula) ? '#ffc107' : '#ccc'};
                            color:black;
                            border:none;
                            padding:5px;
                            cursor:pointer;
                        "
                    >
                        ${viewedIds.includes(m.id_pelicula) ? '★ Vista' : '☆ Marcar vista'}
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

// VENTANA EMERGENTE (MODAL) PARA PELÍCULAS
function showMovieForm(id = null, titulo = '', anio = '', precio = '') {
    const existing = document.getElementById("customModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "customModal";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;";

    modal.innerHTML = `
        <div style="background:white; padding:30px; border-radius:8px; width:300px; display:flex; flex-direction:column; gap:15px; color:black;">
            <h3 style="margin:0;">${id ? 'Editar Película' : 'Añadir Película'}</h3>
            <input id="modTitulo" value="${titulo}" placeholder="Título" style="padding:8px;">
            <input id="modAnio" type="number" value="${anio}" placeholder="Año (ej. 2024)" style="padding:8px;">
            <input id="modPrecio" type="number" step="0.01" value="${precio}" placeholder="Precio Alquiler" style="padding:8px;">
            <div style="display:flex; justify-content:space-between; margin-top:10px;">
                <button onclick="saveMovie(${id})" style="background:#007bff; color:white; padding:8px; border:none; border-radius:4px; cursor:pointer;">Guardar</button>
                <button onclick="document.getElementById('customModal').remove()" style="background:#dc3545; color:white; padding:8px; border:none; border-radius:4px; cursor:pointer;">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveMovie(id) {
    const titulo = document.getElementById("modTitulo").value.trim();
    const anio = parseInt(document.getElementById("modAnio").value);
    const precio = parseFloat(document.getElementById("modPrecio").value);

    if (!titulo) return alert("El título es obligatorio.");
    if (precio < 0) return alert("El precio no puede ser negativo.");

    const currentYear = new Date().getFullYear();
    if (anio < 1888 || anio > currentYear + 5) {
        return alert(`El año debe ser válido (entre 1888 y ${currentYear + 5}).`);
    }

    const body = { titulo, anio_produccion: anio, precio_alquiler: precio };

    let res;
    if (id) {
        res = await API.updateMovie(id, body);
    } else {
        res = await API.addMovie(body);
    }

    if (res.message) {
        alert(id ? "Película actualizada" : "Película añadida");
        document.getElementById('customModal').remove();
        refreshAdmin();
    } else {
        alert(res.detail || "Error al procesar la película");
    }
}

// ======================
// GESTIÓN DE USUARIOS (ADMIN)
// ======================
async function renderAdminUsers() {
    const users = await API.getAllUsers();
    const container = document.getElementById("usersContainer");

    if (!users || users.length === 0) {
        container.innerHTML = "<p>No hay usuarios</p>";
        return;
    }

    container.innerHTML = `
        <div class="grid">
            ${users.map(u => `
                <div class="card" style="font-size: 0.9em;">
                    <h3>${u.nombre_usuario}</h3>
                    <p>${u.nombre} ${u.apellidos}</p>
                    <p>${u.email}</p>
                    <button onclick="showUserForm(${u.id_usuario}, '${u.nombre}', '${u.apellidos}', '${u.nombre_usuario}', '${u.email}')">Editar Usuario</button>
                    <button onclick="showUserViews(${u.id_usuario}, '${u.nombre_usuario}')">
                        Ver visualizaciones
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function showUserForm(id, nombre, apellidos, username, email) {
    const existing = document.getElementById("customModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "customModal";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;";

    modal.innerHTML = `
        <div style="background:white; padding:30px; border-radius:8px; width:300px; display:flex; flex-direction:column; gap:10px; color:black;">
            <h3 style="margin:0;">Editar Usuario</h3>
            <label>Nombre:</label> <input id="modUsrNombre" value="${nombre}" style="padding:5px;">
            <label>Apellidos:</label> <input id="modUsrApel" value="${apellidos}" style="padding:5px;">
            <label>Username:</label> <input id="modUsrUser" value="${username}" style="padding:5px;">
            <label>Email:</label> <input id="modUsrEmail" value="${email}" style="padding:5px;">
            
            <div style="display:flex; justify-content:space-between; margin-top:15px;">
                <button onclick="saveAdminUser(${id})" style="background:#007bff; color:white; padding:8px; border:none; border-radius:4px; cursor:pointer;">Guardar</button>
                <button onclick="document.getElementById('customModal').remove()" style="background:#dc3545; color:white; padding:8px; border:none; border-radius:4px; cursor:pointer;">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveAdminUser(id) {
    const body = {
        nombre: document.getElementById("modUsrNombre").value,
        apellidos: document.getElementById("modUsrApel").value,
        nombre_usuario: document.getElementById("modUsrUser").value,
        email: document.getElementById("modUsrEmail").value
    };

    const res = await API.updateUserAdmin(id, body);
    if (res.message) {
        alert("Usuario actualizado con éxito");
        document.getElementById('customModal').remove();
        renderAdminUsers();
    } else {
        alert("Error al actualizar usuario");
    }
}

// ======================
// ADMIN DROPDOWNS
// ======================
async function loadDropdowns() {
    const disponibles = await API.getMovies(true);
    const noDisponibles = await API.getMovies(false);
    const sel1 = document.getElementById("selectDisponibles");
    const sel2 = document.getElementById("selectNoDisponibles");

    if (sel1) sel1.innerHTML = disponibles.map(m => `<option value="${m.id_pelicula}">${m.titulo}</option>`).join('');
    if (sel2) sel2.innerHTML = noDisponibles.map(m => `<option value="${m.id_pelicula}">${m.titulo}</option>`).join('');
}

async function darDeBaja() {
    const id = document.getElementById("selectDisponibles").value;
    if(!id) return;
    await API.toggleDisponible(id, false);
    alert("Película dada de baja");
    await refreshAdmin();
}

async function darDeAlta() {
    const id = document.getElementById("selectNoDisponibles").value;
    if(!id) return;
    await API.toggleDisponible(id, true);
    alert("Película dada de alta");
    await refreshAdmin();
}

async function refreshAdmin() {
    const route = localStorage.getItem("currentRoute");
    if(route === "catalogo") {
        await loadDropdowns();
        renderMovies(true);
    }
}

// ======================
// LÓGICA DE LISTAS
// ======================
async function renderLists() {
    const lists = await API.getLists();
    const container = document.getElementById("listsContainer");

    if (!lists || lists.length === 0) {
        container.innerHTML = "<p>No tienes listas creadas.</p>";
        return;
    }

    container.innerHTML = `
        <div class="grid">
            ${lists.map(l => `
                <div class="card">
                    <h3>${l.nombre}</h3>
                    <p>${l.descripcion || 'Sin descripción'}</p>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button onclick="openListDetail(${l.id}, '${l.nombre.replace(/'/g, "\\'")}')" style="background:#17a2b8; color:white;">Ver</button>
                        <button onclick="showListForm(${l.id}, '${l.nombre.replace(/'/g, "\\'")}', '${(l.descripcion || '').replace(/'/g, "\\'")}')">Editar</button>
                        <button onclick="deleteUserList(${l.id})" style="background:#dc3545; color:white;">Borrar</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function showListForm(id = null, nombre = '', descripcion = '') {
    const existing = document.getElementById("customModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "customModal";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;";

    modal.innerHTML = `
        <div style="background:white; padding:30px; border-radius:8px; width:300px; display:flex; flex-direction:column; gap:15px; color:black;">
            <h3 style="margin:0;">${id ? 'Editar Lista' : 'Nueva Lista'}</h3>
            <input id="modListName" value="${nombre}" placeholder="Nombre de la lista" style="padding:8px;">
            <textarea id="modListDesc" placeholder="Descripción" style="padding:8px; height:60px; resize:none;">${descripcion}</textarea>
            <div style="display:flex; justify-content:space-between; margin-top:10px;">
                <button onclick="saveUserList(${id})" style="background:#007bff; color:white; padding:8px; border:none; border-radius:4px; cursor:pointer;">Guardar</button>
                <button onclick="document.getElementById('customModal').remove()" style="background:#dc3545; color:white; padding:8px; border:none; border-radius:4px; cursor:pointer;">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveUserList(id) {
    const nombre = document.getElementById("modListName").value.trim();
    const descripcion = document.getElementById("modListDesc").value.trim();

    if (!nombre) return alert("El nombre es obligatorio.");

    const body = { nombre, descripcion };
    let res = id ? await API.updateList(id, body) : await API.createList(body);

    if (res.id || res.message) {
        document.getElementById('customModal').remove();
        renderLists();
    } else {
        alert("Error al procesar la lista");
    }
}

async function deleteUserList(id) {
    if (!confirm("¿Seguro que quieres borrar esta lista?")) return;
    await API.deleteList(id);
    renderLists();
}

function openListDetail(id, nombre) {
    localStorage.setItem("currentListId", id);
    localStorage.setItem("currentListName", nombre);
    loadRoute("listaDetalle");
}

async function renderListMoviesDetail() {
    const listId = localStorage.getItem("currentListId");
    const movies = await API.getListMovies(listId);
    const container = document.getElementById("listMoviesContainer");

    if (!movies || movies.length === 0) {
        container.innerHTML = "<p>No hay películas en esta lista.</p>";
        return;
    }

    container.innerHTML = `
        <div class="grid">
            ${movies.map(m => `
                <div class="card">
                    <h3>${m.titulo}</h3>
                    <button onclick="removeMovieFromList(${listId}, ${m.id_pelicula})" style="background:#dc3545; color:white;">Quitar de la lista</button>
                </div>
            `).join('')}
        </div>
    `;
}

async function showAddMovieToListForm() {
    const movies = await API.getMovies(true);
    const existing = document.getElementById("customModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "customModal";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;";

    modal.innerHTML = `
        <div style="background:white; padding:30px; border-radius:8px; width:300px; display:flex; flex-direction:column; gap:15px; color:black;">
            <h3 style="margin:0;">Añadir Película</h3>
            <select id="modListPeliSelect" style="padding:8px;">
                ${movies.map(m => `<option value="${m.id_pelicula}">${m.titulo}</option>`).join('')}
            </select>
            <div style="display:flex; justify-content:space-between; margin-top:10px;">
                <button onclick="addMovieToCurrentList()" style="background:#007bff; color:white; padding:8px; border:none; border-radius:4px; cursor:pointer;">Añadir</button>
                <button onclick="document.getElementById('customModal').remove()" style="background:#dc3545; color:white; padding:8px; border:none; border-radius:4px; cursor:pointer;">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function addMovieToCurrentList() {
    const listId = localStorage.getItem("currentListId");
    const movieId = document.getElementById("modListPeliSelect").value;
    const res = await API.addMovieToList(listId, movieId);

    if (res.message) {
        document.getElementById('customModal').remove();
        renderListMoviesDetail();
    } else {
        alert(res.detail || "Error al añadir película");
    }
}

async function removeMovieFromList(listId, movieId) {
    await API.removeMovieFromList(listId, movieId);
    renderListMoviesDetail();
}

// ======================
// RESTO DEL CÓDIGO (Auth, Nav, Router)
// ======================
async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const data = await API.login(email, password);

    if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        const me = await API.getMe();
        localStorage.setItem("role", me.role);
        updateNavbar();
        document.getElementById("loginMsg").innerText = "✔ Login correcto";
        setTimeout(() => loadRoute("catalogo"), 800);
    } else {
        document.getElementById("loginMsg").innerText = "❌ Error login";
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    updateNavbar();
    loadRoute("home");
}

async function registerUser() {
    const body = {
        nombre: document.getElementById("nombre").value,
        apellidos: document.getElementById("apellidos").value,
        nombre_usuario: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };
    const data = await API.register(body);

    if (data.message) {
        document.getElementById("registerMsg").innerText = "✔ Usuario creado";
        setTimeout(() => loadRoute("login"), 1000);
    } else {
        document.getElementById("registerMsg").innerText = data.detail || "Error";
    }
}

function updateNavbar() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const navLinks = document.querySelector(".nav-links");

    if (token) {
        const adminUsersLink = role == 1 ? `<li><a href="#" data-link="adminUsuarios">Gestionar Usuarios</a></li>` : ``;
        navLinks.innerHTML = `
            <li><a href="#" data-link="home">Inicio</a></li>
            <li><a href="#" data-link="catalogo">Catálogo</a></li>
            <li><a href="#" data-link="listas">Listas</a></li>
            <li><a href="#" data-link="misVisualizaciones">Mis Visualizaciones</a></li>
            ${adminUsersLink}
            <li><a href="#" data-link="perfil">Mi perfil</a></li>
            <li><a href="#" id="logoutBtn" style="color: #ff4d4d; font-weight: bold;">Logout</a></li>
        `;
        document.getElementById("logoutBtn").addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    } else {
        navLinks.innerHTML = `
            <li><a href="#" data-link="home">Inicio</a></li>
            <li><a href="#" data-link="catalogo">Catálogo</a></li>
            <li><a href="#" data-link="login" class="btn-login">Identificarse</a></li>
        `;
    }

    document.querySelectorAll("[data-link]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            loadRoute(e.currentTarget.dataset.link);
        });
    });
}

async function loadProfile() {
    const me = await API.getMe();
    document.getElementById("nombre").value = me.nombre || "";
    document.getElementById("apellidos").value = me.apellidos || "";
    document.getElementById("username").value = me.username || "";
    document.getElementById("email").value = me.email || "";
}

async function updateProfile() {
    const body = {
        nombre: document.getElementById("nombre").value,
        apellidos: document.getElementById("apellidos").value,
        nombre_usuario: document.getElementById("username").value,
        email: document.getElementById("email").value
    };
    const res = await API.updateMe(body);
    document.getElementById("perfilMsg").innerText = res.message ? "✔ Datos actualizados" : res.detail;
}

async function loadRoute(route) {
    const app = document.getElementById("app");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    localStorage.setItem("currentRoute", route);

    const protectedRoutes = ["catalogo", "perfil", "adminUsuarios", "listas", "misVisualizaciones", "listaDetalle"];

    if (protectedRoutes.includes(route) && !token) {
        alert("Debes iniciar sesión");
        return loadRoute("login");
    }

    if (route === "adminUsuarios" && role != 1) {
        alert("Acceso denegado");
        return loadRoute("home");
    }

    if (route === "home") app.innerHTML = Views.home();
    if (route === "login") app.innerHTML = Views.login();
    if (route === "register") app.innerHTML = Views.register();

    if (route === "catalogo") {
        app.innerHTML = Views.catalogo();
        setTimeout(async () => {
            await renderMovies(true);
            await loadDropdowns();
        }, 100);
    }
    if (route === "perfil") {
        app.innerHTML = Views.perfil();
        setTimeout(loadProfile, 100);
    }
    if (route === "adminUsuarios") {
        app.innerHTML = Views.adminUsuarios();
        setTimeout(renderAdminUsers, 100);
    }
    if (route === "misVisualizaciones") {
        app.innerHTML = Views.misVisualizaciones();
        setTimeout(renderViews, 100);
    }
    if (route === "listas") {
        app.innerHTML = Views.listas();
        setTimeout(renderLists, 100);
    }
    if (route === "listaDetalle") {
        const nombre = localStorage.getItem("currentListName");
        app.innerHTML = Views.listaDetalle(nombre);
        setTimeout(renderListMoviesDetail, 100);
    }
    updateNavbar();
}

document.addEventListener("DOMContentLoaded", async () => {
    if (localStorage.getItem("token")) {
        try {
            const me = await API.getMe();
            localStorage.setItem("role", me.role);
        } catch {
            logout();
        }
    }
    updateNavbar();
    loadRoute("home");
});

async function renderViews() {
    const movies = await API.getMyViews();
    const container = document.getElementById("viewsContainer");

    if (!movies.length) {
        container.innerHTML = "<p>No has visto ninguna película</p>";
        return;
    }

    container.innerHTML = `
        <div class="grid">
            ${movies.map(m => `
                <div class="card">
                    <h3>${m.titulo}</h3>
                    <button onclick="toggleView(${m.id_pelicula}, this)">
                        ❌ Quitar de vistas
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

async function showUserViews(userId, username) {
    const views = await API.getUserViews(userId);
    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;";
    modal.innerHTML = `
        <div style="background:white; padding:20px; border-radius:8px; width:300px; color:black;">
            <h3>Vistas de ${username}</h3>
            <ul>${views.map(m => `<li>${m.titulo}</li>`).join('')}</ul>
            <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
        </div>
    `;
    document.body.appendChild(modal);
}

async function toggleView(id, btn) {
    btn.disabled = true;
    const res = await API.toggleView(id);
    if (localStorage.getItem("currentRoute") === "misVisualizaciones") {
        await renderViews();
        btn.disabled = false;
        return;
    }
    if (res.message.includes("eliminada")) {
        btn.innerText = "☆ Marcar vista";
        btn.style.background = "#ccc";
    } else {
        btn.innerText = "★ Vista";
        btn.style.background = "#ffc107";
    }
    btn.disabled = false;
}