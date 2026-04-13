const API_BASE = "http://localhost:8000";

// ======================
// API
// ======================
const API = {
    getMovies: async (disponible = true) => {
        try {
            const res = await fetch(`${API_BASE}/movies/?disponible=${disponible}`);

            if (!res.ok) {
                console.error("Error API movies:", res.status);
                return [];
            }

            return await res.json();
        } catch (err) {
            console.error("Fetch error movies:", err);
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
            headers: {
                "Authorization": `Bearer ${token}`
            }
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
                <div style="display:flex; gap:40px; margin-bottom:20px;">

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

        <p>¿No tienes cuenta? 
            <a href="#" data-link="register">Regístrate</a>
        </p>
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
                    <p>${m.anio_produccion ?? ''}</p>

                    ${role == 1 ? `
                        <button onclick="editMovie(${m.id_pelicula}, '${m.titulo}', ${m.anio_produccion}, ${m.precio_alquiler})">
                            Editar
                        </button>
                    ` : ``}
                </div>
            `).join('')}
        </div>
    `;
}

async function editMovie(id, titulo, anio, precio) {
    const nuevoTitulo = prompt("Nuevo título:", titulo);
    const nuevoAnio = prompt("Nuevo año:", anio);
    const nuevoPrecio = prompt("Nuevo precio:", precio);

    const body = {
        titulo: nuevoTitulo,
        anio_produccion: Number(nuevoAnio),
        precio_alquiler: Number(nuevoPrecio)
    };

    const res = await API.updateMovie(id, body);

    if (res.message) {
        alert("Película actualizada");
        renderMovies(true);
    } else {
        alert(res.detail || "Error");
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

    if (sel1) {
        sel1.innerHTML = disponibles.map(m =>
            `<option value="${m.id_pelicula}">${m.titulo}</option>`
        ).join('');
    }

    if (sel2) {
        sel2.innerHTML = noDisponibles.map(m =>
            `<option value="${m.id_pelicula}">${m.titulo}</option>`
        ).join('');
    }
}

async function darDeBaja() {
    const id = document.getElementById("selectDisponibles").value;

    await API.toggleDisponible(id, false);

    alert("Película dada de baja");

    await refreshAdmin();
}

async function darDeAlta() {
    const id = document.getElementById("selectNoDisponibles").value;

    await API.toggleDisponible(id, true);

    alert("Película dada de alta");

    await refreshAdmin();
}

async function refreshAdmin() {
    await loadDropdowns();
    renderMovies(true);
}

// ======================
// LOGIN
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

// ======================
// LOGOUT
// ======================
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    updateNavbar();
    loadRoute("home");
}

// ======================
// REGISTER
// ======================
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

// ======================
// NAVBAR
// ======================
function updateNavbar() {
    const token = localStorage.getItem("token");
    const navLinks = document.querySelector(".nav-links");

    if (token) {
        navLinks.innerHTML = `
            <li><a href="#" data-link="home">Inicio</a></li>
            <li><a href="#" data-link="catalogo">Catálogo</a></li>
            <li><a href="#" data-link="perfil">Mi perfil</a></li>
            <li><a href="#" id="logoutBtn">Logout</a></li>
        `;

        document.getElementById("logoutBtn").addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });

    } else {
        navLinks.innerHTML = `
            <li><a href="#" data-link="home">Inicio</a></li>
            <li><a href="#" data-link="catalogo">Catálogo</a></li>
            <li><a href="#" data-link="login">Identificarse</a></li>
        `;
    }

    document.querySelectorAll("[data-link]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            loadRoute(e.currentTarget.dataset.link);
        });
    });
}

// ======================
// PERFIL
// ======================
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

    document.getElementById("perfilMsg").innerText =
        res.message ? "✔ Datos actualizados" :
        (typeof res.detail === "object" ? JSON.stringify(res.detail) : res.detail);
}

// ======================
// ROUTER
// ======================
async function loadRoute(route) {
    const app = document.getElementById("app");
    const token = localStorage.getItem("token");

    const protectedRoutes = ["catalogo", "perfil"];

    if (protectedRoutes.includes(route) && !token) {
        alert("Debes iniciar sesión");
        return loadRoute("login");
    }

    if (route === "home") app.innerHTML = Views.home();

    if (route === "catalogo") {
        app.innerHTML = Views.catalogo();

        setTimeout(async () => {
            await renderMovies(true);
            await loadDropdowns();
        }, 100);
    }

    if (route === "login") app.innerHTML = Views.login();

    if (route === "register") app.innerHTML = Views.register();

    if (route === "perfil") {
        app.innerHTML = Views.perfil();
        setTimeout(loadProfile, 100);
    }

    updateNavbar();
}

// ======================
// INIT
// ======================
document.addEventListener("DOMContentLoaded", async () => {
    updateNavbar();
    loadRoute("home");

    if (localStorage.getItem("token")) {
        try {
            const me = await API.getMe();
            localStorage.setItem("role", me.role);
        } catch {
            logout();
        }
    }
});