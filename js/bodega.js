import { initializeGapiClient, loadSheetData, appendData, isUserAuthenticated } from '/Red-Logistica/api/googleSheets.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Inicializar el cliente de Google API y cargar la autenticación
        await initializeGapiClient();
        console.log("Cliente GAPI inicializado y autenticado.");

        // Cargar los datos de inventario
        if (isUserAuthenticated()) {
            await loadInventory();
        } else {
            console.warn("Usuario no autenticado. Intentando autenticación...");
        }
    } catch (error) {
        console.error("Error al inicializar la API de Google:", error);
    }
});

// Función para cargar datos de inventario desde Google Sheets
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
        console.error("Error al cargar inventario:", error);
    }
}

// Registrar nuevo ingreso
document.getElementById("add-supply-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const itemName = document.getElementById("ingreso-item-name").value.trim();
    const itemQuantity = parseInt(document.getElementById("ingreso-item-quantity").value, 10);
    const itemCategory = document.getElementById("ingreso-item-category").value;
    const date = new Date().toLocaleString('es-ES', { hour12: false });

    if (itemName && itemQuantity && itemCategory) {
        try {
            const values = [[itemName, itemQuantity, itemCategory, date]];
            await appendData("bodega!A2:D", values);
            alert("Ingreso registrado exitosamente");
            await loadInventory();
            e.target.reset(); // Limpiar formulario
        } catch (error) {
            console.error("Error al registrar ingreso:", error);
        }
    } else {
        alert("Por favor, completa todos los campos.");
    }
});

});
