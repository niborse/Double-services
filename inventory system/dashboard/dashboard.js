// Load data from local storage
const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
const sales = JSON.parse(localStorage.getItem("salesOrders")) || [];
const purchases = JSON.parse(localStorage.getItem("purchaseOrders")) || [];

// Populate totals in summary cards
document.getElementById("inventory-total").innerText = inventory.reduce((sum, item) => sum + item.collectedQuantity, 0);
document.getElementById("sales-total").innerText = sales.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.subtotal, 0), 0);
document.getElementById("purchases-total").innerText = purchases.reduce((sum, order) => sum + order.products.reduce((productSum, product) => productSum + product.subtotal, 0), 0);

// Populate tables
function populateTable(data, tableId) {
  const tbody = document.getElementById(tableId).querySelector("tbody");
  tbody.innerHTML = '';  // Clear existing rows

  data.forEach(rowData => {
    const row = document.createElement("tr");
    for (let cellData of Object.values(rowData)) {
      const cell = document.createElement("td");
      cell.innerText = cellData;
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  });
}

// Map data to table format
populateTable(
  inventory.map(item => ({ ProductID: item.productId, Quantity: item.collectedQuantity, BinLocation: item.binLocation })),
  "inventory-table"
);

populateTable(
  sales.flatMap(order =>
    order.items.map(item => ({
      OrderNumber: order.orderNumber,
      ProductID: item.productId,
      Quantity: item.quantity,
      Subtotal: item.subtotal
    }))
  ),
  "sales-table"
);

populateTable(
  purchases.flatMap(order =>
    order.products.map(product => ({
      OrderNumber: order.orderNumber,
      ProductID: product.productId,
      Quantity: product.quantity,
      Subtotal: product.subtotal
    }))
  ),
  "purchases-table"
);

// Filter tables by Product ID
function filterTables() {
  const searchValue = document.getElementById("search").value.toLowerCase();

  ['inventory-table', 'sales-table', 'purchases-table'].forEach(tableId => {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(row => {
      const productIdCell = row.cells[1];  // Assuming Product ID is in the second column
      if (productIdCell && productIdCell.innerText.toLowerCase().includes(searchValue)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
}
