import { initializeGapiClient, loadSheetData, appendData, isUserAuthenticated } from '/RedLogistica/api/googleSheets.js';

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await initializeGapiClient();
        console.log("Conectado a Google Sheets");
        checkConnectionStatus();
        setUpEventListeners();
        await loadInitialData();
    } catch (error) {
        console.error("Error al conectar con Google Sheets:", error);
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

// Configurar eventos para botones y formularios
function setUpEventListeners() {
    const stockButton = document.getElementById("reviewStockBtn");
    const closeStockModalBtn = document.getElementById("closeStockModalBtn");
    const downloadSummaryBtn = document.getElementById("downloadSummaryBtn");
    const addSupplyForm = document.getElementById("add-supply-form");
    const removeSupplyForm = document.getElementById("remove-supply-form");
    const truckDeliveryBtn = document.getElementById("registerTruckDeliveryBtn");
    const submitTruckDeliveryBtn = document.getElementById("submitTruckDeliveryBtn");

    // Revisar si los elementos existen antes de añadir el listener
    if (stockButton) stockButton.addEventListener("click", openStockModal);
    if (closeStockModalBtn) closeStockModalBtn.addEventListener("click", closeStockModal);
    if (downloadSummaryBtn) downloadSummaryBtn.addEventListener("click", downloadPDF);
    if (addSupplyForm) addSupplyForm.addEventListener("submit", registerSupplyEntry);
    if (removeSupplyForm) removeSupplyForm.addEventListener("submit", registerSupplyExit);
    if (truckDeliveryBtn) truckDeliveryBtn.addEventListener("click", openTruckDeliveryModal);
    if (submitTruckDeliveryBtn) submitTruckDeliveryBtn.addEventListener("click", registerTruckDelivery);
}

// Función para abrir el modal de stock
function openStockModal() {
    const modal = document.getElementById("stockModal");
    if (modal) {
        modal.style.display = "block";
        loadStockData();
    }
}

// Función para cerrar el modal de stock
function closeStockModal() {
    const modal = document.getElementById("stockModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Cargar datos iniciales
async function loadInitialData() {
    await loadInventory();
    await loadDeliveries();
    await updateSummaryCounters();
}

// Actualizar contadores de resumen
async function updateSummaryCounters() {
    const inventoryData = await loadSheetData("bodega!A2:D");
    const deliveryData = await loadSheetData("bodega!E2:H");
    const lowStockCount = inventoryData.filter(item => parseInt(item[1], 10) < 5).length;

    document.getElementById("total-inventory").textContent = `${inventoryData.length} artículos`;
    document.getElementById("truck-deliveries").textContent = `${deliveryData.length} entregas`;
    document.getElementById("low-stock-alerts").textContent = `${lowStockCount} alertas`;
}

// Cargar datos de inventario
async function loadInventory() {
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
}

// Cargar datos de entregas
async function loadDeliveries() {
    const deliveryData = await loadSheetData("bodega!E2:H");
    const tableBody = document.getElementById("egreso-table-body");
    tableBody.innerHTML = '';

    deliveryData.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item[0]}</td>
            <td>${item[1]}</td>
            <td>${item[2]}</td>
            <td>${item[3]}</td>
        `;
        tableBody.appendChild(row);
    });
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
        await appendData("bodega!A2:D", values);
        alert("Ingreso registrado exitosamente");
        await loadInventory();
        await updateSummaryCounters();
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
        await appendData("bodega!E2:H", values);
        alert("Egreso registrado exitosamente");
        await loadDeliveries();
        await updateSummaryCounters();
    }
}

// Descargar resumen en PDF
function downloadPDF() {
    const doc = new jsPDF();
    doc.text("Resumen de Stock", 14, 20);
    const stockTable = document.getElementById("stock-table");
    const rows = [];

    for (let i = 1; i < stockTable.rows.length; i++) {
        const cells = stockTable.rows[i].cells;
        const rowData = [];
        for (let j = 0; j < cells.length; j++) {
            rowData.push(cells[j].textContent);
        }
        rows.push(rowData);
    }

    doc.autoTable({
        head: [['Artículo', 'Cantidad Ingreso', 'Cantidad Egreso', 'Stock Actual']],
        body: rows,
        startY: 30,
    });
    doc.save("Resumen_Stock.pdf");
}
