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
    // Nuevos endpoints para Admins
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
    `
};

// ======================
// RENDER PELÍCULAS
// ======================
async function renderMovies(disponible = true) {
    const movies = await API.getMovies(disponible);
    const role = localStorage.getItem("role");
    const container = document.getElementById("moviesContainer");

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

    // VALIDACIONES
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
        const adminUsersLink = role == 1 ? `<li><a href="#" data-link="adminUsuarios">Editar Usuarios</a></li>` : ``;
        navLinks.innerHTML = `
            <li><a href="#" data-link="home">Inicio</a></li>
            <li><a href="#" data-link="catalogo">Catálogo</a></li>
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

    const protectedRoutes = ["catalogo", "perfil", "adminUsuarios"];

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