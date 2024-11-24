





document.addEventListener('DOMContentLoaded', function() {
    const orderNumberInput = document.getElementById('orderNumber');
    const orderDateInput = document.getElementById('orderDate');
    const addProductBtn = document.getElementById('addProductBtn');
    const saveOrderBtn = document.getElementById('saveOrderBtn');

    // Generate a unique order number
    const uniqueOrderNumber = `PO-${Date.now()}`;
    orderNumberInput.value = uniqueOrderNumber;

    // Set the current date as default
    orderDateInput.valueAsDate = new Date();

    // Initialize product suggestions for the first product entry
    initializeProductIdInput(document.getElementById('productId1'), 1);

    // Event listeners
    addProductBtn.addEventListener('click', addProductEntry);
    saveOrderBtn.addEventListener('click', function(e) {
        e.preventDefault();
        savePurchaseOrder();
    });
});

// Function to initialize Product ID input with suggestions
function initializeProductIdInput(productIdInput, entryCount) {
    productIdInput.addEventListener('input', function() {
        suggestProductIds(productIdInput);
        checkProductId(productIdInput);
    });
}

function suggestProductIds(inputElement) {
    const inputValue = inputElement.value.trim();
    const dataList = inputElement.nextElementSibling; // Corresponding datalist
    dataList.innerHTML = ''; // Clear previous suggestions

    // Get all existing products from local storage
    const products = JSON.parse(localStorage.getItem('products')) || [];

    products.forEach(product => {
        // Ensure productId is a string before calling toLowerCase()
        const productId = product.productId || '';
        if (typeof productId === 'string' && productId.toLowerCase().includes(inputValue.toLowerCase())) {
            const option = document.createElement('option');
            option.value = productId;
            dataList.appendChild(option);
        }
    });
}

function checkProductId(inputElement) {
    const productId = inputElement.value.trim();
    const entryDiv = inputElement.closest('.product-entry');
    const productDetailsDiv = entryDiv.querySelector('.product-details');

    let inventoryData = [];
    try {
        const inventoryString = localStorage.getItem('inventory');
        inventoryData = JSON.parse(inventoryString) || [];
    } catch (error) {
        console.error("Invalid JSON found in localStorage for 'inventory':", error);
        return;
    }

    let foundProduct = null;

    // Loop through the inventory items to find the matching productId
    inventoryData.forEach(order => {
        const products = order.collectedProducts || [];
        products.forEach(product => {
            if (product.productId === productId) {
                foundProduct = product;
            }
        });
    });

    if (foundProduct) {
        // Display the product details
        productDetailsDiv.innerHTML = `
            <p><strong>Group:</strong> ${foundProduct.group || 'Not Available'}</p>
            <p><strong>Subgroup:</strong> ${foundProduct.subgroup || 'Not Available'}</p>
            <p><strong>Collected Quantity:</strong> ${foundProduct.collectedQuantity}</p>
            <p><strong>Available Quantity:</strong> ${foundProduct.availableQuantity}</p>
            <p><strong>Warehouse Location:</strong> ${foundProduct.location || 'Not Available'}</p>
            <p><strong>Bin Locations:</strong></p>
            <ul>
                ${foundProduct.binLocations.map(bin => `<li>Location: ${bin.binLocation}, Quantity: ${bin.binQuantity}</li>`).join('')}
            </ul>
        `;

        // Optionally auto-fill Unit Price and Warehouse Location
        entryDiv.querySelector('[name^="unitPrice"]').value = foundProduct.unitPrice || '';
        entryDiv.querySelector('[name^="location"]').value = foundProduct.location || '';
    } else {
        // Show message to create a new product
        productDetailsDiv.innerHTML = `<p class="no-product">Product not found. Please create a new product.</p>`;
        entryDiv.querySelector('[name^="unitPrice"]').value = '';
        entryDiv.querySelector('[name^="location"]').value = '';
    }
}
// Function to add a new product entry
function addProductEntry() {
    const productDetailsContainer = document.getElementById('productDetailsContainer');
    const productEntryCount = document.querySelectorAll('.product-entry').length + 1;

    const productEntry = document.createElement('div');
    productEntry.className = 'product-entry';
    productEntry.innerHTML = `
        <div>
            <label for="productId${productEntryCount}">Product ID:</label>
            <input type="text" id="productId${productEntryCount}" name="productId${productEntryCount}" class="productIdInput" list="productList${productEntryCount}" required>
            <datalist id="productList${productEntryCount}"></datalist>
            <div id="productDetails${productEntryCount}" class="product-details"></div>
            <button type="button" class="createProductBtn" onclick="createNewProduct('productId${productEntryCount}')">Create New Product</button>
        </div>

        <label for="quantity${productEntryCount}">Quantity:</label>
        <input type="number" id="quantity${productEntryCount}" name="quantity${productEntryCount}" min="1" required>

        <label for="unitPrice${productEntryCount}">Unit Price:</label>
        <input type="number" id="unitPrice${productEntryCount}" name="unitPrice${productEntryCount}" min="0" step="0.01" required>

        <label for="discount${productEntryCount}">Discount (%):</label>
        <input type="number" id="discount${productEntryCount}" name="discount${productEntryCount}" min="0" max="100" step="0.01" value="0">

        <label for="subtotal${productEntryCount}">Subtotal Cost:</label>
        <input type="number" id="subtotal${productEntryCount}" name="subtotal${productEntryCount}" readonly>

        <label for="location${productEntryCount}">Warehouse Location:</label>
        <input type="text" id="location${productEntryCount}" name="location${productEntryCount}" required>

        <button type="button" class="removeProductBtn" onclick="removeProductEntry(this)">Remove</button>
    `;

    productDetailsContainer.appendChild(productEntry);

    // Initialize Product ID input
    const productIdInput = productEntry.querySelector('.productIdInput');
    initializeProductIdInput(productIdInput);

 // Attach event listeners for the new entry to calculate subtotals
 productEntry.querySelector(`[id^="quantity"]`).addEventListener('input', calculateAllSubtotals);
 productEntry.querySelector(`[id^="unitPrice"]`).addEventListener('input', calculateAllSubtotals);
 productEntry.querySelector(`[id^="discount"]`).addEventListener('input', calculateAllSubtotals);
}




function calculateSubtotal() {
    const productEntries = document.querySelectorAll('.product-entry');
    productEntries.forEach(entry => {
        const quantity = parseFloat(entry.querySelector('input[name^="quantity"]').value) || 0;
        const unitPrice = parseFloat(entry.querySelector('input[name^="unitPrice"]').value) || 0;
        const discount = parseFloat(entry.querySelector('input[name^="discount"]').value || 0);
        const subtotalInput = entry.querySelector('input[name^="subtotal"]');

        if (quantity && unitPrice) {
            const subtotal = (quantity * unitPrice) * (1 - discount / 100);


            subtotalInput.value = subtotal.toFixed(2);
        }
    });
    
}
let productCount = 1; // Counter to ensure unique IDs



// Function to remove a product entry
function removeProductEntry(button) {
    const productEntry = button.closest('.product-entry');
    productEntry.remove();
}

// Function to initialize subtotal calculation

// Function to create a new product and store it in local storage
function createNewProduct(productIdInputId) {
    const productIdInput = document.getElementById(productIdInputId);
    const productId = productIdInput.value.trim();

    if (!productId) {
        alert('Please enter a Product ID before creating a new product.');
        return;
    }

    // Gather product details from the user
    const description = prompt('Enter Product Description:');
    if (description === null) return; // User cancelled

    const quantity = prompt('Enter Available Quantity:', '0');
    if (quantity === null) return;

    const unitPrice = prompt('Enter Unit Price:', '0.00');
    if (unitPrice === null) return;

    const location = prompt('Enter Warehouse Location:');
    if (location === null) return;

    const binLocation = prompt('Enter Bin Location:');
    if (binLocation === null) return;

    // Create new product object
    const newProduct = {
        productId,
        description,
        quantity: parseInt(quantity),
        unitPrice: parseFloat(unitPrice),
        location,
        binLocation
    };

    // Save to local storage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const existingProductIndex = products.findIndex(p => p.productId === productId);

    if (existingProductIndex !== -1) {
        // Update existing product
        products[existingProductIndex] = newProduct;
        alert('Product updated successfully!');
    } else {
        // Add new product
        products.push(newProduct);
        alert('New product created successfully!');
    }

    localStorage.setItem('products', JSON.stringify(products));

    // Refresh product details display
    checkProductId(productIdInput);
}

// Function to save the purchase order
function savePurchaseOrder() {
    const orderNumber = document.getElementById('orderNumber').value;
    const orderDate = document.getElementById('orderDate').value;
    const vendorName = document.getElementById('vendorName').value.trim();
    const vendorLocation = document.getElementById('vendorLocation').value.trim();
    const vendorContact = document.getElementById('vendorContact').value.trim();

    if (!vendorName || !vendorLocation || !vendorContact) {
        alert('Please fill out all vendor information fields.');
        return;
    }

    const productEntries = document.querySelectorAll('.product-entry');
    if (productEntries.length === 0) {
        alert('Please add at least one product to the purchase order.');
        return;
    }

    const products = [];
    let isValid = true;

    productEntries.forEach((entry, index) => {
        const productId = entry.querySelector('.productIdInput').value.trim();
        const quantity = parseInt(entry.querySelector(`[id^="quantity"]`).value);
        const unitPrice = parseFloat(entry.querySelector(`[id^="unitPrice"]`).value);
        const discount = parseFloat(entry.querySelector(`[id^="discount"]`).value);
        const subtotal = parseFloat(entry.querySelector(`[id^="subtotal"]`).value);
        const location = entry.querySelector(`[id^="location"]`).value.trim();

        if (!productId || isNaN(quantity) || isNaN(unitPrice) || isNaN(discount) || isNaN(subtotal) || !location) {
            alert(`Please fill out all fields correctly for product entry ${index + 1}.`);
            isValid = false;
            return;
        }

        products.push({
            productId,
            quantity,
            unitPrice,
            discount,
            subtotal,
            location
        });
    });

    if (!isValid) return;

    const purchaseOrder = {
        orderNumber,
        orderDate,
        vendorName,
        vendorLocation,
        vendorContact,
        status: 'raised',
        products
    };

    // Save purchase order to local storage
    const purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    purchaseOrders.push(purchaseOrder);
    localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));

    alert('Purchase order saved and raised successfully!');
    window.location.href = 'dashboard.html';
}
