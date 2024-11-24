document.addEventListener("DOMContentLoaded", function() {
    const stockSummaryTable = document.getElementById("stockSummaryTable");
    const formContainer = document.getElementById("productFormContainer");
    const saveProductBtn = document.getElementById("saveProductBtn");
    const searchInput = document.getElementById("searchInput");
    let currentSortColumn = null;
    let sortAscending = true;

    // Load inventory data from localStorage
    const inventoryData = JSON.parse(localStorage.getItem('inventory')) || [];
    let filteredData = [...inventoryData];

    // Load stock summary table with data
    function loadStockSummary(data) {
        stockSummaryTable.innerHTML = ""; // Clear the table before loading
        
        data.forEach((item, index) => {
            if (item.collectedProducts && item.collectedProducts.length > 0) {
                item.collectedProducts.forEach((product, productIndex) => {
                    const binLocations = product.binLocations || [];

                    const mainRow = `
                        <tr>
                            <td rowspan="${binLocations.length + 1}">${product.productId}</td>
                            <td rowspan="${binLocations.length + 1}">${product.group}</td>
                            <td rowspan="${binLocations.length + 1}">${product.subgroup}</td>
                            <td rowspan="${binLocations.length + 1}">${product.collectedQuantity}</td>
                            <td rowspan="${binLocations.length + 1}">${product.location}</td>
                        </tr>
                    `;
                    stockSummaryTable.innerHTML += mainRow;

                    binLocations.forEach((binLocation, binIndex) => {
                        const binRow = `
                            <tr>
                                <td>${binLocation.binLocation}</td>
                                <td>${binLocation.binQuantity}</td>
                                <td>
                                    <span class="edit-btn" data-index="${index}" data-product-index="${productIndex}" data-bin-index="${binIndex}">Edit</span>
                                    <span class="delete-btn" data-index="${index}" data-product-index="${productIndex}" data-bin-index="${binIndex}">Delete</span>
                                </td>
                            </tr>
                        `;
                        stockSummaryTable.innerHTML += binRow;
                    });
                });
            }
        });
    }

    // Load stock summary initially
    loadStockSummary(filteredData);

    // Search functionality
    searchInput.addEventListener("input", function() {
        const searchTerm = searchInput.value.toLowerCase();
        
        filteredData = inventoryData.filter(item => {
            // Ensure that collectedProducts is an array before using .some()
            return Array.isArray(item.collectedProducts) && item.collectedProducts.some(product => {
                return (
                    (product.productId || "").toLowerCase().includes(searchTerm) ||
                    (product.group || "").toLowerCase().includes(searchTerm) ||
                    (product.subgroup || "").toLowerCase().includes(searchTerm) ||
                    
                    (product.binLocations || []).some(bin => (bin.binLocation || "").toLowerCase().includes(searchTerm))
                );
            });
        });
    
        loadStockSummary(filteredData); // Update table with filtered data
    });
    
    
    // Event delegation for editing and deleting products
    stockSummaryTable.addEventListener("click", function(event) {
        if (event.target.classList.contains("edit-btn")) {
            const index = event.target.getAttribute("data-index");
            const productIndex = event.target.getAttribute("data-product-index");
            editProduct(index, productIndex);
        } else if (event.target.classList.contains("delete-btn")) {
            const index = event.target.getAttribute("data-index");
            const productIndex = event.target.getAttribute("data-product-index");
            deleteProduct(index, productIndex);
        }
    });
    // Edit product function
    function editProduct(index, productIndex) {
        const product = inventoryData[index].collectedProducts[productIndex];

        // Fill in the form fields with the current product data
        document.getElementById("productId").value = product.productId;
        document.getElementById("collectedQuantity").value = product.collectedQuantity
        document.getElementById("group").value = product.group;
        document.getElementById("subgroup").value = product.subgroup;

        document.getElementById("location").value = product.location;
        

        const binLocations = product.binLocations || [];
        const binLocationContainer = document.getElementById("binLocationContainer");
        binLocationContainer.innerHTML = ''; // Clear previous bin locations

        // Dynamically add input fields for bin locations and quantities
        binLocations.forEach((bin, binIndex) => {
            const binRow = document.createElement('div');
            binRow.classList.add('bin-row');
            binRow.innerHTML = `
                <input type="text" class="bin-location" placeholder="Bin Location" value="${bin.binLocation}">
                <input type="number" class="bin-quantity" placeholder="Bin Quantity" value="${bin.binQuantity}">
            `;
            binLocationContainer.appendChild(binRow);
        });
        console.log("Bin locations added:", binLocations);
        // Show the form
        formContainer.classList.remove('minimized');
        formContainer.classList.add('expanded');
        document.getElementById('toggleFormButton').textContent = "Close Form";

        // Save product changes
        saveProductBtn.onclick = function() {
            saveEditedProduct(index, productIndex);
        };
    }

    // Save edited product
    function saveEditedProduct(index, productIndex) {
        const product = inventoryData[index].collectedProducts[productIndex];
        
        // Update product details from the form
        product.productId = document.getElementById("productId").value;
        product.collectedQuantity = document.getElementById("collectedQuantity").value;
        product.group = document.getElementById("group").value;
        product.subgroup = document.getElementById("subgroup").value;
        product.location = document.getElementById("location").value;
        


       

        // Update bin locations and quantities
        const binLocations = [];
        document.querySelectorAll('.bin-row').forEach((binRow) => {
            const binLocation = binRow.querySelector('.bin-location').value;
            const binQuantity = binRow.querySelector('.bin-quantity').value;
            binLocations.push({ binLocation, binQuantity });
        });
        product.binLocations = binLocations;

        // Save the updated inventory to localStorage
        localStorage.setItem("inventory", JSON.stringify(inventoryData));

        // Reload the stock summary
        loadStockSummary();
        

        // Close the form
        formContainer.classList.remove('expanded');
        formContainer.classList.add('minimized');
        document.getElementById('toggleFormButton').textContent = "Add / Edit Product";
    }

    // Delete product
    function deleteProduct(index, productIndex) {
        if (confirm("Are you sure you want to delete this product?")) {
            inventoryData[index].collectedProducts.splice(productIndex, 1);
            localStorage.setItem("inventory", JSON.stringify(inventoryData));
            loadStockSummary();
        }
    }

    // Load stock summary on page load
    loadStockSummary(filteredData);
});
function loadLatestIncomingProducts() {
    const inventoryData = JSON.parse(localStorage.getItem('inventory')) || [];
    console.log("Inventory Data:", inventoryData); // Check inventory data

    const latestProducts = inventoryData.slice(-5).reverse(); // Reverse to show latest first
    console.log("Latest Products:", latestProducts); // Check latest products

    const tickerContent = document.getElementById('tickerContent');
    tickerContent.innerHTML = ""; // Clear previous content

    latestProducts.forEach(item => {
        if (item.collectedProducts && item.collectedProducts.length > 0) {
            const product = item.collectedProducts[0]; // Get the first product
            console.log("Product:", product); // Check each product

            // Create a ticker item
            const tickerItem = document.createElement('span');
            tickerItem.className = 'ticker-item';
            tickerItem.textContent = `New Arrival: ${product.productId} - ${product.collectedQuantity} units`;

            tickerContent.appendChild(tickerItem);
        }
    });
}
  window.onload = function() {
    loadLatestIncomingProducts();
  };