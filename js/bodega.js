import { initializeGapiClient, loadSheetData, appendData, isUserAuthenticated } from '/Red-Logistica/js/googleSheets.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Espera a que la API de Google se haya cargado completamente antes de inicializar el cliente
        await ensureGoogleApiLoaded();
        await initializeGapiClient();
        console.log("Conectado a Google Sheets");

        // Verificar si el usuario está autenticado
        if (isUserAuthenticated()) {
            await loadInventory();
        } else {
            console.warn("Usuario no autenticado");
        }
    } catch (error) {
        console.error("Error al conectar con Google Sheets:", error);
    }
});

// Función para verificar si la API de Google está completamente cargada
async function ensureGoogleApiLoaded() {
    return new Promise((resolve, reject) => {
        if (typeof gapi !== 'undefined') {
            resolve();
        } else {
            console.error("La API de Google no se ha cargado.");
            reject("API de Google no cargada");
        }
    });
}

// Función para cargar datos en la tabla de ingresos
async function loadInventory() {
    try {
        const inventoryData = await loadSheetData("bodega!A2:D");
        const tableBody = document.getElementById("ingreso-table-body");
        tableBody.innerHTML = '';

        inventoryData.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td>`;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al cargar datos de inventario:", error);
    }
}

// Función para registrar un nuevo ingreso
document.getElementById("add-supply-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const itemName = document.getElementById("ingreso-item-name").value.trim();
    const itemQuantity = parseInt(document.getElementById("ingreso-item-quantity").value, 10);
    const itemCategory = document.getElementById("ingreso-item-category").value;
    const date = new Date().toLocaleString();

    if (itemName && itemQuantity && itemCategory) {
        try {
            const values = [[itemName, itemQuantity, itemCategory, date]];
            await appendData("bodega!A2:D", values);
            alert("Ingreso registrado exitosamente");
            await loadInventory();
        } catch (error) {
            console.error("Error al registrar ingreso:", error);
        }
    } else {
        alert("Por favor, completa todos los campos.");
    }
});
