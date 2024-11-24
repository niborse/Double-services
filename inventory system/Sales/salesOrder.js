document.addEventListener('DOMContentLoaded', () => {
    // Generate unique Sales Order Number
    const orderNumberInput = document.getElementById('orderNumber');
    orderNumberInput.value = generateUniqueOrderNumber();

    // Set today's date
    const orderDateInput = document.getElementById('orderDate');
    orderDateInput.valueAsDate = new Date();

    // Load inventory data from local storage
    let inventoryData = [];
    try {
        const inventoryString = localStorage.getItem('inventory');
        inventoryData = JSON.parse(inventoryString) || [];
    } catch (error) {
        console.error("Invalid JSON found in localStorage for 'inventory':", error);
    }

    // Add initial product suggestion for all product ID inputs
    document.querySelectorAll('.productIdInput').forEach(inputElement => {
        inputElement.addEventListener('input', () => suggestProductIds(inputElement, inventoryData));
    });

    // Add product functionality
    document.getElementById('addProductBtn').addEventListener('click', addAnotherProduct);

    // Save sales order
    document.getElementById('saveOrderBtn').addEventListener('click', saveSalesOrder);
});

// Generate a unique sales order number
function generateUniqueOrderNumber() {
    const currentTimestamp = new Date().getTime();
    return `SO-${currentTimestamp}`;
}

// Suggest product IDs based on user input
function suggestProductIds(inputElement, inventoryData) {
    const inputValue = inputElement.value.trim();
    const dataList = inputElement.nextElementSibling; 
    dataList.innerHTML = ''; // Clear existing options

   

    inventoryData.forEach(order => {
        const products = order.collectedProducts || [];
        products.forEach(product => {
            const productId = product.productId || '';
            if (productId.toLowerCase().includes(inputValue.toLowerCase())) {
                const option = document.createElement('option');
                option.value = productId;
                dataList.appendChild(option);
            }
        });
    });
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
// Calculate the subtotal for each product



// Add new product entry dynamically
let productCount = 1;
let inventoryData = [];
try {
    const inventoryString = localStorage.getItem('inventory');
    inventoryData = JSON.parse(inventoryString) || [];
} catch (error) {
    console.error("Invalid JSON found in localStorage for 'inventory':", error);
}

function addAnotherProduct() {
    const container = document.getElementById('productDetailsContainer');
    const newProductEntry = container.firstElementChild.cloneNode(true);
    productCount++;

    newProductEntry.querySelectorAll('input').forEach(input => {
        const originalId = input.id;
        if (originalId) {
            input.id = originalId.replace(/\d+$/, '') + productCount;
        }

        const originalName = input.name;
        if (originalName) {
            input.name = originalName.replace(/\d+$/, '') + productCount;
        }

        input.value = ''; // Clear the input fields
    });

    // Update the product ID input to use a unique datalist
    const newProductIdInput = newProductEntry.querySelector('.productIdInput');
    const newDatalistId = `productList${productCount}`;
    newProductIdInput.setAttribute('list', newDatalistId);

    let existingDatalist = newProductEntry.querySelector('datalist');
    if (existingDatalist) {
        existingDatalist.id = newDatalistId; // Update the datalist ID
    } else {
        const newProductDataList = document.createElement('datalist');
        newProductDataList.id = newDatalistId;
        newProductIdInput.parentNode.appendChild(newProductDataList);
    }

    // Add event listener for suggestions
    newProductIdInput.addEventListener('input', () => suggestProductIds(newProductIdInput, inventoryData));

    // Add the new product entry to the container
    container.appendChild(newProductEntry);
}
// Save sales order and adjust inventory
function saveSalesOrder() {
    let inventoryData = [];
    
    // Fetch inventory data from localStorage
    try {
        const inventoryString = localStorage.getItem('inventory');
        inventoryData = JSON.parse(inventoryString) || [];
    } catch (error) {
        console.error("Invalid JSON found in localStorage for 'inventory':", error);
        return;
    }

    // Prepare the sales order object
    const productEntries = document.querySelectorAll('.product-entry');
    const salesOrder = {
        orderNumber: document.getElementById('orderNumber').value,
        orderDate: document.getElementById('orderDate').value,
        customerName: document.getElementById('customerName').value,
        customerLocation: document.getElementById('customerLocation').value,
        customerContact: document.getElementById('customerContact').value,
        items: [],
        status: 'raised',
    };

    let isValidOrder = true;
    let errorMessages = [];

    productEntries.forEach((entry, index) => {
        
       
        const productIdInput = entry.querySelector('.productIdInput');
        if (productIdInput) {
            const productId = productIdInput.value.trim();  // Define productId here
            if (!productId) {
                console.error(`Product ID is undefined or empty for entry at.`);
            } else {
                console.log(`Product ID for entry ${index}:`, productId);
    
                // Now you can use productId here safely
                const quantity = parseInt(entry.querySelector('input[name^="quantity"]').value) || 0;
                const unitPrice = parseFloat(entry.querySelector('input[name^="unitPrice"]').value) || 0;
                const discount = parseFloat(entry.querySelector('input[name^="discount"]').value || 0);
                const subtotal = parseFloat(entry.querySelector('input[name^="subtotal"]').value) || 0;
                const location = entry.querySelector('input[name^="location"]').value;
    
                // Check if productId is provided and valid
                if (productId) {
                    let foundProduct = inventoryData.find(item => item.productId === productId);
                    
                    if (!foundProduct) {
                        foundProduct = inventoryData.find(p => 
                            Array.isArray(p.collectedProducts) &&
                            p.collectedProducts.some(product => product.productId === productId)
                        );
                    }
    
                    if (foundProduct) {
                        const productData = foundProduct.collectedProducts
                            ? foundProduct.collectedProducts.find(product => product.productId === productId)
                            : foundProduct;
    
                        // Calculate the total available quantity from bin locations
                        let totalAvailableQuantity = 0;
                        if (Array.isArray(productData.binLocations)) {
                        productData.binLocations.forEach(bin => {
                            totalAvailableQuantity += parseInt(bin.binQuantity, 10);
                        });
                        } else {
                        console.error('Bin locations not found for product ID:', productId);
                        }
                        // Check if the available quantity is enough to fulfill the order
                        if (totalAvailableQuantity >= quantity) {
                            salesOrder.items.push({
                                productId,
                                quantity,
                                unitPrice,
                                discount,
                                subtotal,
                                location,
                                
                            });
    
                            let remainingQuantity = quantity;
                            productData.binLocations.forEach(bin => {
                                const binQuantity = parseInt(bin.binQuantity, 10);
    
                                if (binQuantity >= remainingQuantity) {
                                    bin.binQuantity = binQuantity - remainingQuantity;
                                    remainingQuantity = 0;
                                } else {
                                    remainingQuantity -= binQuantity;
                                    bin.binQuantity = 0;
                                }
                            });
    
                            // Update the available quantity in the main product data
                            productData.availableQuantity = totalAvailableQuantity - quantity;
                        } else {
                            isValidOrder = false;
                            errorMessages.push(`Insufficient quantity for product ID: ${productId}. Available: ${totalAvailableQuantity}, Requested: ${quantity}`);
                        }
                    } else {
                        isValidOrder = false;
                        errorMessages.push(`Product ID: ${productId} not found in inventory.`);
                    }
                }
            }
        } else {
            console.error(`Product ID input field not found for entry at index ${index}.`);
        }
    });
    
    if (isValidOrder) {
        const salesOrders = JSON.parse(localStorage.getItem('salesOrders')) || [];
        salesOrders.push(salesOrder);
        localStorage.setItem('salesOrders', JSON.stringify(salesOrders));
    
        // Update inventory in local storage, including the new available quantities and bin quantities
        localStorage.setItem('inventory', JSON.stringify(inventoryData));
    
        alert('Sales order saved successfully!');
        document.getElementById('purchaseOrderForm').reset();
        window.location.href = 'dashboard.html';
    } else {
        alert(errorMessages.join('\n'));

    }
    
    

// Sample code for searching the product in inventory
function findProductInInventory(productId, inventory) {
    return inventory.find(item => {
        if (item.collectedProducts) {
            return item.collectedProducts.some(product => product.productId === productId);
        }
        return false;
    });
}
}


// Function to remove a product entry
function removeProductEntry(button) {
    const productEntry = button.closest('.product-entry');
    productEntry.remove();
}

function createNewProduct(productIdInputId) {
    const productIdInput = document.getElementById(productIdInputId);
    const productId = productIdInput.value.trim();
    newProductIdInput.addEventListener('input', () => suggestProductIds(newProductIdInput, inventoryData));

    if (!productId) {
        alert('Please enter a Product ID before creating a new product.');
        return;
    }

    // Gather finished product details from the user
    const finishedQuantity = document.getElementById('finishedquantity1').value;
    const finishedUnitPrice = document.getElementById('finishedunitPrice1').value;
    const finishedLocation = document.getElementById('finishedlocation1').value;
    const finishedDiscount = document.getElementById('finisheddiscount1').value;

    // Calculate subtotal
    const subtotal = (finishedUnitPrice - (finishedDiscount || 0)) * finishedQuantity;

    // Create new finished product object
    const newFinishedProduct = {
        productId,
        quantity: parseInt(finishedQuantity),
        unitPrice: parseFloat(finishedUnitPrice),
        discount: parseFloat(finishedDiscount) || 0,
        subtotal: subtotal,
        location: finishedLocation
    };

    // Save to local storage
    const finishedProducts = JSON.parse(localStorage.getItem('finishedProducts')) || [];
    const existingProductIndex = finishedProducts.findIndex(p => p.productId === productId);

    if (existingProductIndex !== -1) {
        // Update existing finished product
        finishedProducts[existingProductIndex] = newFinishedProduct;
        alert('Finished product updated successfully!');
    } else {
        // Add new finished product
        finishedProducts.push(newFinishedProduct);
        alert('New finished product created successfully!');
    }

    localStorage.setItem('finishedProducts', JSON.stringify(finishedProducts));

    // Optionally refresh the product details display
    checkFinishedProductId(productIdInput);
}
function checkFinishedProductId(inputElement) {
    const productId = inputElement.value.trim();
    const entryDiv = inputElement.closest('.product-entry');
    const productDetailsDiv = entryDiv.querySelector('.product-details');

    let finishedProductsData = [];
    try {
        const finishedProductsString = localStorage.getItem('finishedProducts');
        finishedProductsData = JSON.parse(finishedProductsString) || [];
    } catch (error) {
        console.error("Invalid JSON found in localStorage for 'finishedProducts':", error);
        return;
    }

    let foundProduct = null;

    // Loop through finished products to find the matching productId
    finishedProductsData.forEach(product => {
        if (product.productId === productId) {
            foundProduct = product;
        }
    });

    if (foundProduct) {
        // Display the product details
        productDetailsDiv.innerHTML = `
            <p><strong>Unit Price:</strong> ${foundProduct.unitPrice || 'Not Available'}</p>
            <p><strong>Available Quantity:</strong> ${foundProduct.quantity || 'N/A'}</p>
            <p><strong>Warehouse Location:</strong> ${foundProduct.location || 'Not Available'}</p>
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
// Function to check and display product details based on the selected product ID
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
function finishedcalculateSubtotal() {
    const productEntries = document.querySelectorAll('.product-entry');
    productEntries.forEach(entry => {
        // Get the input elements
        const quantityInput = entry.querySelector('input[name^="finishedquantity"]');
        const unitPriceInput = entry.querySelector('input[name^="finishedunitPrice"]');
        const discountInput = entry.querySelector('input[name^="finisheddiscount"]');
        const subtotalInput = entry.querySelector('input[name^="finishedsubtotal"]');

        // Check if all required inputs exist
        if (!quantityInput || !unitPriceInput || !discountInput || !subtotalInput) {
            console.error('One or more inputs are missing in this product-entry:', entry);
            return; // Skip this entry if any input is missing
        }

        // Parse values from inputs
        const quantity = parseFloat(quantityInput.value) || 0;
        const unitPrice = parseFloat(unitPriceInput.value) || 0;
        const discount = parseFloat(discountInput.value || 0);

        // Only calculate if both quantity and unitPrice are valid
        if (quantity && unitPrice) {
            const subtotal = (quantity * unitPrice) * (1 - discount / 100);
            subtotalInput.value = subtotal.toFixed(2);
        } else {
            // Clear subtotal if either quantity or unitPrice is missing
            subtotalInput.value = '0.00';
        }
    });
}

