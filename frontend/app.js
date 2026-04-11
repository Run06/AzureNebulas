const API_BASE = "http://localhost:8000";

// ======================
// API
// ======================
const API = {
    getMovies: async () => {
        const res = await fetch(`${API_BASE}/movies/`);
        return await res.json();
    },

    importMovie: async (query) => {
        const res = await fetch(`${API_BASE}/movies/import?query=${query}`, {
            method: "POST"
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
                <div style="margin-bottom:15px;">
                    <input id="searchMovie" placeholder="Importar película (ej: Inception)" />
                    <button onclick="importMovie()">Importar</button>
                </div>
            ` : `
                <p style="color:red;">Solo administradores pueden importar películas</p>
            `}

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
            <a href="#" onclick="loadRoute('register')">Regístrate</a>
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
async function renderMovies() {
    const movies = await API.getMovies();

    document.getElementById("moviesContainer").innerHTML = `
        <div class="grid">
            ${movies.map(m => `
                <div class="card">
                    <h3>${m.titulo}</h3>
                    <p>${m.anio_produccion ?? ''}</p>
                </div>
            `).join('')}
        </div>
    `;
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

    updateNavbar(); // ✅ AQUÍ EXACTAMENTE

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

    updateNavbar(); // ✅ AQUÍ

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
// UPDATENAVBAR
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

    // 🔁 Reasignar eventos SPA
    document.querySelectorAll("[data-link]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            loadRoute(e.target.dataset.link);
        });
    });
}

// ======================
// LOADPROFILE
// ======================
async function loadProfile() {
    const me = await API.getMe();

    document.getElementById("nombre").value = me.nombre || "";
    document.getElementById("apellidos").value = me.apellidos || "";
    document.getElementById("username").value = me.username || "";
    document.getElementById("email").value = me.email || "";
}

// ======================
// UPDATEPROFILE
// ======================
async function updateProfile() {
    const body = {
        nombre: document.getElementById("nombre").value,
        apellidos: document.getElementById("apellidos").value,
        nombre_usuario: document.getElementById("username").value,
        email: document.getElementById("email").value
    };

    const res = await API.updateMe(body);

    console.log(res); // 👈 DEBUG (MUY IMPORTANTE)

    if (res.message) {
        document.getElementById("perfilMsg").innerText = "✔ Datos actualizados";
    } else {
        document.getElementById("perfilMsg").innerText =
            typeof res.detail === "object"
                ? JSON.stringify(res.detail)
                : res.detail || "Error";
    }
}

// ======================
// IMPORTAR PELÍCULA (ADMIN)
// ======================
async function importMovie() {
    const query = document.getElementById("searchMovie").value;

    await API.importMovie(query);

    alert("Película importada");

    loadRoute("catalogo");
}

// ======================
// ROUTER SPA
// ======================
async function loadRoute(route) {
    const app = document.getElementById("app");
    const token = localStorage.getItem("token");

    // 🔒 PROTECCIÓN
    const protectedRoutes = ["catalogo", "perfil"];

    if (protectedRoutes.includes(route) && !token) {
        alert("Debes iniciar sesión");
        return loadRoute("login");
    }

    if (route === "home") {
        app.innerHTML = Views.home();
    }

    if (route === "catalogo") {
        app.innerHTML = Views.catalogo();
        setTimeout(renderMovies, 100);
    }

    if (route === "login") {
        app.innerHTML = Views.login();
    }

    if (route === "register") {
        app.innerHTML = Views.register();
    }

    if (route === "perfil") {
        app.innerHTML = Views.perfil();
        setTimeout(loadProfile, 100);
    }
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