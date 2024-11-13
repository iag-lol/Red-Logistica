import { initializeGapiClient, loadSheetData, appendData } from '/Red-Logistica/js/googleSheets.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await initializeGapiClient();
        console.log("Conectado a Google Sheets");

        checkConnectionStatus();
        setUpEventListeners();

        // Cargar datos de la tabla de ingresos
        await loadInventory();
    } catch (error) {
        console.error("Error al conectar con Google Sheets:", error);
    }
});

// Verificar estado de conexión
function checkConnectionStatus() {
    const connectionStatus = document.getElementById("connection-status");
    connectionStatus.textContent = "Conectado";
    connectionStatus.classList.add("connected");
}

// Configurar eventos
function setUpEventListeners() {
    const addSupplyForm = document.getElementById("add-supply-form");

    if (addSupplyForm) {
        addSupplyForm.addEventListener("submit", registerSupplyEntry);
    }
}

// Cargar datos en la tabla de ingresos
async function loadInventory() {
    try {
        const inventoryData = await loadSheetData("bodega!A2:D");
        const tableBody = document.getElementById("ingreso-table-body");
        tableBody.innerHTML = '';

        inventoryData.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item[0]}</td>
                <td>${item[1]}</td>
                <td>${item[2]}</td>
                <td>${item[3]}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error al cargar datos de inventario:", error);
    }
}

// Registrar nuevo ingreso
async function registerSupplyEntry(e) {
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

            // Limpiar formulario
            e.target.reset();
        } catch (error) {
            console.error("Error al registrar ingreso:", error);
            alert("Hubo un error al registrar el ingreso. Inténtalo de nuevo.");
        }
    } else {
        alert("Por favor, completa todos los campos.");
    }
}
