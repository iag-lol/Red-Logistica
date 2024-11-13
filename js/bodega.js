import { initializeGapiClient, loadSheetData, appendData, isUserAuthenticated } from '/RedLogistica/api/googleSheets.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Inicializar Google API y autenticación
        await initializeGapiClient();
        checkConnectionStatus();

        // Configurar eventos para botones y formularios
        setUpEventListeners();

        // Cargar datos iniciales
        await loadInventory();
        await loadDeliveries();
        await updateSummaryCounters();
    } catch (error) {
        console.error("Error durante la carga inicial:", error);
    }
});

// Verificar autenticación y mostrar estado de conexión
function checkConnectionStatus() {
    const connectionStatus = document.getElementById("connection-status");
    if (!connectionStatus) {
        console.error("Elemento de estado de conexión no encontrado.");
        return;
    }

    const isConnected = isUserAuthenticated();
    connectionStatus.textContent = isConnected ? "Conectado" : "Desconectado";
    connectionStatus.classList.toggle("connected", isConnected);
}

// Configurar eventos para los botones y formularios
function setUpEventListeners() {
    const stockButton = document.getElementById("reviewStockBtn");
    const closeStockModalBtn = document.getElementById("closeStockModalBtn");
    const downloadSummaryBtn = document.getElementById("downloadSummaryBtn");
    const addSupplyForm = document.getElementById("add-supply-form");
    const removeSupplyForm = document.getElementById("remove-supply-form");
    const truckDeliveryBtn = document.getElementById("registerTruckDeliveryBtn");
    const submitTruckDeliveryBtn = document.getElementById("submitTruckDeliveryBtn");

    if (stockButton) stockButton.addEventListener("click", openStockModal);
    else console.error("Botón 'reviewStockBtn' no encontrado.");

    if (closeStockModalBtn) closeStockModalBtn.addEventListener("click", closeStockModal);
    else console.error("Botón 'closeStockModalBtn' no encontrado.");

    if (downloadSummaryBtn) downloadSummaryBtn.addEventListener("click", downloadPDF);
    else console.error("Botón 'downloadSummaryBtn' no encontrado.");

    if (addSupplyForm) addSupplyForm.addEventListener("submit", registerSupplyEntry);
    else console.error("Formulario 'add-supply-form' no encontrado.");

    if (removeSupplyForm) removeSupplyForm.addEventListener("submit", registerSupplyExit);
    else console.error("Formulario 'remove-supply-form' no encontrado.");

    if (truckDeliveryBtn) truckDeliveryBtn.addEventListener("click", openTruckDeliveryModal);
    else console.error("Botón 'registerTruckDeliveryBtn' no encontrado.");

    if (submitTruckDeliveryBtn) submitTruckDeliveryBtn.addEventListener("click", registerTruckDelivery);
    else console.error("Botón 'submitTruckDeliveryBtn' no encontrado.");
}

// Funciones para abrir y cerrar modales
function openStockModal() {
    const modal = document.getElementById("stockModal");
    if (modal) {
        modal.style.display = "flex";
        loadStockData();
    } else {
        console.error("Modal de stock no encontrado.");
    }
}

function closeStockModal() {
    const modal = document.getElementById("stockModal");
    if (modal) {
        modal.style.display = "none";
    } else {
        console.error("Modal de stock no encontrado.");
    }
}

// Registrar ingreso de insumos
async function registerSupplyEntry(e) {
    e.preventDefault();
    const itemName = document.getElementById("ingreso-item-name").value.trim();
    const itemQuantity = parseInt(document.getElementById("ingreso-item-quantity").value, 10);
    const itemCategory = document.getElementById("ingreso-item-category").value;
    const date = new Date().toLocaleString();

    if (itemName && itemQuantity && itemCategory) {
        const values = [[itemName, itemQuantity, itemCategory, date]];
        try {
            await appendData("bodega!A2:D", values);
            alert("Ingreso registrado exitosamente");
            await loadInventory();
            await updateSummaryCounters();
        } catch (error) {
            console.error("Error registrando ingreso:", error);
        }
    } else {
        alert("Por favor, completa todos los campos.");
    }
}

// Registrar egreso de insumos
async function registerSupplyExit(e) {
    e.preventDefault();
    const itemName = document.getElementById("egreso-item-name").value.trim();
    const itemQuantity = parseInt(document.getElementById("egreso-item-quantity").value, 10);
    const personReceiving = document.getElementById("person-receiving").value.trim();
    const date = new Date().toLocaleString();

    if (itemName && itemQuantity && personReceiving) {
        const values = [[itemName, itemQuantity, personReceiving, date]];
        try {
            await appendData("bodega!E2:H", values);
            alert("Egreso registrado exitosamente");
            await loadDeliveries();
            await updateSummaryCounters();
        } catch (error) {
            console.error("Error registrando egreso:", error);
        }
    } else {
        alert("Por favor, completa todos los campos.");
    }
}

