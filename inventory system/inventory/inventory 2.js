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
                            <td rowspan="${binLocations.length + 1}">${product.availableQuantity}</td>
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
    
        // Retrieve the fields by their IDs
        const productIdField = document.getElementById("productId");
        const collectedQuantityField = document.getElementById("collectedQuantity");
        const groupField = document.getElementById("group");
        const subgroupField = document.getElementById("subgroup");
        const locationField = document.getElementById("warehouseLocation");
        
        const binLocationContainer = document.getElementById("binLocationContainer");
    
        // Check if fields exist before trying to set their values
        if (productIdField) productIdField.value = product.productId || "";
        if (collectedQuantityField) collectedQuantityField.value = product.collectedQuantity || "";
        if (groupField) groupField.value = product.group || "";
        if (subgroupField) subgroupField.value = product.subgroup || "";
        if (locationField) locationField.value = product.location || "";
    
        // Clear previous bin location fields
        if (binLocationContainer) {
            binLocationContainer.innerHTML = ''; // Clear any existing inputs
    
            // Create a label for the bin location section
            const sectionLabel = document.createElement('label');
            sectionLabel.textContent = "Bin Locations and Quantities:";
            binLocationContainer.appendChild(sectionLabel);
    
            // Check if binLocations exists and is an array
            const binLocations = Array.isArray(product.binLocations) ? product.binLocations : [];
    
            // Dynamically add input fields with labels for each bin location and quantity
            binLocations.forEach((bin, binIndex) => {
                const binRow = document.createElement('div');
                binRow.classList.add('bin-row');
    
                // Label and input for Bin Location
                const binLocationLabel = document.createElement('label');
                binLocationLabel.textContent = `Bin Location ${binIndex + 1}:`;
                const binLocationInput = document.createElement('input');
                binLocationInput.type = 'text';
                binLocationInput.classList.add('bin-location');
                binLocationInput.value = bin.binLocation || '';
    
                // Label and input for Bin Quantity
                const binQuantityLabel = document.createElement('label');
                binQuantityLabel.textContent = `Bin Quantity ${binIndex + 1}:`;
                const binQuantityInput = document.createElement('input');
                binQuantityInput.type = 'number';
                binQuantityInput.classList.add('bin-quantity');
                binQuantityInput.value = bin.binQuantity || '';
    
                // Append labels and inputs to the row
                binRow.appendChild(binLocationLabel);
                binRow.appendChild(binLocationInput);
                binRow.appendChild(binQuantityLabel);
                binRow.appendChild(binQuantityInput);
    
                // Add the row to the container
                binLocationContainer.appendChild(binRow);
            });
        }
    
        // Show the form and set up the save button
        formContainer.classList.remove('minimized');
        formContainer.classList.add('expanded');
        document.getElementById('toggleFormButton').textContent = "Close Form";
    
        // Set up the save button to trigger saving the edits
        saveProductBtn.onclick = function() {
            saveEditedProduct(index, productIndex);
        };
    }

    // Save edited product
  // Save edited product
  function saveEditedProduct(index, productIndex) {
    const product = inventoryData[index].collectedProducts[productIndex];

    if (product) {
        // Update product details from the form
        product.productId = document.getElementById("productId").value.trim();
        product.collectedQuantity = Number(document.getElementById("collectedQuantity").value.trim());
        product.group = document.getElementById("group").value.trim();
        product.subgroup = document.getElementById("subgroup").value.trim();
        const locationField = document.getElementById("warehouseLocation");
        product.location = locationField ? locationField.value.trim() : "";

        // Update bin locations and quantities
        const binLocations = [];
        document.querySelectorAll('.bin-row').forEach((binRow) => {
            const binLocation = binRow.querySelector('.bin-location').value.trim();
            const binQuantity = Number(binRow.querySelector('.bin-quantity').value.trim());

            // Only push if both binLocation and binQuantity have values
            if (binLocation && binQuantity) {
                binLocations.push({ binLocation, binQuantity });
            }
        });
        product.binLocations = binLocations; // Update the binLocations array of the product

        // Save the updated inventory to localStorage
        localStorage.setItem("inventory", JSON.stringify(inventoryData));

        loadStockSummary(filteredData); 

        // Close the form
        formContainer.classList.remove('expanded');
        formContainer.classList.add('minimized');
        document.getElementById('toggleFormButton').textContent = "Add / Edit Product";
    } else {
        console.error("Product not found for saving.");
    }
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