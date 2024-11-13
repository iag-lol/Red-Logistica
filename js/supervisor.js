const CLIENT_ID = '739966027132-j4ngpj7la2hpmkhil8l3d74dpbec1eq1.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAqybdPUUYkIbeGBMxc39hMdaRrOhikD8s';
const SPREADSHEET_ID = '1jzTdEoshxRpuf9kHXI5vQLRtoCsSA-Uw-48JX8LxXaU';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

let tokenClient;
let isAuthenticated = false;

document.addEventListener("DOMContentLoaded", initializeGapiClient);

// Inicializar Google API y autenticación
async function initializeGapiClient() {
    await loadGoogleApi();
    initializeOAuth();
}

// Función para cargar y mostrar secciones dinámicamente en `main-content`
function loadSection(section) {
    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = `<p>Cargando ${section}...</p>`;

    fetch(`/roles/${section}.html`)
        .then(response => response.text())
        .then(data => {
            mainContent.innerHTML = data;
        })
        .catch(error => {
            console.error("Error al cargar la sección:", error);
            mainContent.innerHTML = "<p>Error al cargar la sección.</p>";
        });
}

// Función de logout
function logout() {
    localStorage.removeItem('google_access_token');
    window.location.href = "http://127.0.0.1:3000/index.html";
}

// Inicializar OAuth y solicitar token si es necesario
function initializeOAuth() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
            if (response.error) {
                console.error('Error en autenticación:', response);
                return;
            }
            localStorage.setItem('google_access_token', response.access_token);
            loadSection('dashboard'); // Cargar la sección por defecto
        },
    });

    const storedToken = localStorage.getItem('google_access_token');
    if (storedToken) {
        loadSection('dashboard');
    } else {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    }
}