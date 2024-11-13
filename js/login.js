import { initializeGapiClient, loadSheetData, updateSheetData } from '../api/googleSheets.js';

let username = '';
let password = '';
let userRole = '';


document.addEventListener('DOMContentLoaded', async () => {
    await initializeGapiClient();      document.getElementById('login-form').addEventListener('submit', handleLogin);
});


async function handleLogin(event) {
    event.preventDefault();

    username = document.getElementById('username').value;
    password = document.getElementById('password').value;

 
    const credentials = await loadSheetData('credenciales!A2:E');


    const userIndex = credentials.findIndex(row => row[0] === username && row[1] === password);

    if (userIndex !== -1) {

        localStorage.setItem('username', username);


        const rowToUpdateConnection = `credenciales!D${userIndex + 2}`; 
        const rowToUpdateLastLogin = `credenciales!E${userIndex + 2}`; 
        const currentDateTime = new Date().toLocaleString('es-ES');    

     
        await updateSheetData(rowToUpdateConnection, [['CONECTADO']]);
        await updateSheetData(rowToUpdateLastLogin, [[currentDateTime]]);

   
        userRole = credentials[userIndex][2];

   
        redirectToRolePage(userRole);
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

function redirectToRolePage(role) {
    const baseUrl = 'https://iag-lol.github.io/RedLogistica/roles/';
    switch (role) {
        case 'Supervisor':
            window.location.href = `${baseUrl}supervisor.html`;
            break;
        case 'Planillero':
            window.location.href = `${baseUrl}planillero.html`;
            break;
        case 'Cleaner':
            window.location.href = `${baseUrl}cleaner.html`;
            break;
        case 'Movilizador':
            window.location.href = `${baseUrl}movilizador.html`;
            break;
        default:
            alert('Rol no reconocido');
            break;
    }
}

export async function handleLogout() {
    const credentials = await loadSheetData('credenciales!A2:D');
    const userIndex = credentials.findIndex(row => row[0] === username);

    if (userIndex !== -1) {
        const rowToUpdate = `credenciales!D${userIndex + 2}`;
        await updateSheetData(rowToUpdate, [['DESCONECTADO']]);
        alert('Sesión cerrada');
    }


    localStorage.removeItem('username');
    window.location.href = "/login.html"; 
}