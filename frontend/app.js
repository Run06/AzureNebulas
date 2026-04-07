/**
 * LÓGICA DE LA SPA - AzureNebulas
 * Gestiona el enrutado y la carga de componentes.
 */

// 1. Simulación de "Base de Datos" (API Mock)
const API = {
    getMovies: async () => {
        // TODO Aquí iría el fetch('tu-api-backend/movies')
        return [
            { id: 1, title: "El Padrino", year: 1972, category: "Drama" },
            { id: 2, title: "Pulp Fiction", year: 1994, category: "Crimen" },
            { id: 3, title: "Interstellar", year: 2014, category: "Sci-Fi" },
            { id: 4, title: "Blade Runner 2049", year: 2017, category: "Sci-Fi" }
        ];
    }
};

// 2. Componentes de la Interfaz (Templates)
const Views = {
    home: () => `
        <section class="hero">
            <h1>Bienvenido a AzureNebulas</h1>
            <p>Tu refugio digital para el séptimo arte.</p>
            <button class="btn-submit" style="width: auto; margin-top: 2rem; padding: 1rem 3rem;" onclick="router('catalogo')">
                Explorar Catálogo
            </button>
        </section>
    `,
    catalogo: async () => {
        const movies = await API.getMovies();
        let movieHtml = movies.map(m => `
            <div class="movie-card">
                <div class="movie-img">🎬</div>
                <div class="movie-info">
                    <h3>${m.title}</h3>
                    <p style="color: #E58E26">${m.category} | ${m.year}</p>
                </div>
            </div>
        `).join('');

        return `
            <h2>Catálogo Completo</h2>
            <div class="catalog-grid">${movieHtml}</div>
        `;
    },
    login: () => `
        <div class="login-container">
            <h2>Acceso Usuario</h2>
            <form id="loginForm" onsubmit="event.preventDefault(); alert('Conectando con Backend...')">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="usuario@ejemplo.com" required>
                </div>
                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn-submit">Entrar</button>
            </form>
        </div>
    `
};

// 3. El Enrutador (Router)
async function router(route) {
    const appContainer = document.getElementById('app');

    // Mostramos un pequeño loader visual
    appContainer.innerHTML = '<p style="text-align:center;">Cargando...</p>';

    // Seleccionamos la vista correspondiente
    switch (route) {
        case 'home':
            appContainer.innerHTML = Views.home();
            break;
        case 'catalogo':
            appContainer.innerHTML = await Views.catalogo();
            break;
        case 'login':
            appContainer.innerHTML = Views.login();
            break;
        default:
            appContainer.innerHTML = Views.home();
    }
}

// 4. Inicialización y Eventos
document.addEventListener('DOMContentLoaded', () => {
    // Carga inicial
    router('home');

    // Listener para los enlaces de navegación
    document.querySelectorAll('[data-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = e.target.getAttribute('data-link');
            router(route);
        });
    });
});