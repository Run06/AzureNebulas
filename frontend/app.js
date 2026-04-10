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

        <input id="email" placeholder="Email">
        <input id="password" type="password" placeholder="Password">

        <button onclick="loginUser()">Entrar</button>

        <p id="loginMsg"></p>
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
        localStorage.setItem("role", data.role);

        document.getElementById("loginMsg").innerText = "✔ Login correcto";
    } else {
        document.getElementById("loginMsg").innerText = "❌ Error login";
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
}

// ======================
// INIT
// ======================
document.addEventListener("DOMContentLoaded", () => {
    loadRoute("home");

    document.querySelectorAll("[data-link]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            loadRoute(e.target.dataset.link);
        });
    });
});