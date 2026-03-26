const API_URL = "http://127.0.0.1:8000";
let mode = "login";

function setMessage(text, color = "red") {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.style.color = color;
}

function toggleMode() {
  mode = mode === "login" ? "register" : "login";

  document.getElementById("title").textContent =
    mode === "login" ? "Iniciar sesión" : "Crear cuenta";

  document.getElementById("toggleText").textContent =
    mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?";

  document.getElementById("toggleLink").textContent =
    mode === "login" ? "Regístrate" : "Inicia sesión";

  setMessage("", "white");
}

async function submitAuth() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    setMessage("Debes completar email y contraseña");
    return;
  }

  const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
  const payload = { email, password };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.detail || "Error en la operación");
      return;
    }

    if (mode === "register") {
      setMessage("Registro correcto. Ahora inicia sesión.", "lightgreen");
      toggleMode();
      return;
    }

    localStorage.setItem("token", data.access_token);

    const tokenPayload = JSON.parse(atob(data.access_token.split(".")[1]));
    localStorage.setItem("role", tokenPayload.role);

    if (tokenPayload.role === "ADMIN") {
      window.location.href = "./admin.html";
    } else {
      window.location.href = "./catalog.html";
    }
  } catch (error) {
    console.error(error);
    setMessage("No se pudo conectar con el servidor");
  }
}