
// Sample data for purchase orders

let purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];

// Replace with the actual order number you want to delete
const orderNumberToDelete = 'PO-1724574080271';

// Filter out the order with the specific order number
purchaseOrders = purchaseOrders.filter(order => order.orderNumber !== orderNumberToDelete);

// Save the updated list back to local storage
localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));

console.log('Order deleted successfully.');

function renderPurchaseOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    // Retrieve purchase orders from local storage
    const purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    console.log("Purchase Orders:", purchaseOrders);

    purchaseOrders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order';

        // Render products within the order
        const itemsList = Array.isArray(order.products) && order.products.length > 0
            ? order.products.map((product, index) => `
                <li>
                    ${product.productId || 'Unknown Product'} - 
                    Quantity: ${product.quantity || 'N/A'} - 
                    Unit Price: $${product.unitPrice || 'N/A'} - 
                    Discount: ${product.discount || 'N/A'}% - 
                    Subtotal: $${product.subtotal || 'N/A'} - 
                    Location: ${product.location || 'Unknown Location'}
                </li>
              `).join('')
            : '<li>No products available</li>';

        let statusActions = '';

        // Action buttons for Project Manager
        if (loggedInUser.role === 'project_manager' && order.status === 'raised') {
            statusActions += `<button onclick="editOrder('${order.orderNumber}')">Edit Order</button>`;
        }

        // Action buttons for Purchase Manager
        if (loggedInUser.role === 'purchase_manager') {
            if (order.status === 'raised') {
                statusActions += `<button onclick="editOrder('${order.orderNumber}')">Edit Order</button>`;
                statusActions += `<button onclick="changeStatus('${order.orderNumber}', 'confirmed')">Confirm</button>`;
            } else if (order.status === 'confirmed') {
                statusActions += `<button onclick="changeStatus('${order.orderNumber}', 'sent')">Mark as Sent</button>`;
            }
        }

        // Action buttons for Inventory Manager
        if (loggedInUser.role === 'inventory_manager' && order.status === 'sent') {
            statusActions += `<button onclick="openCollectModal('${order.orderNumber}')">Collect</button>`;
        }

        // Apply class to highlight collected orders
        let orderStatusClass = '';  // Initialize the class with an empty string

        if (order.status === 'collected') {
            orderStatusClass = 'collected-order'; // Add class to highlight the order
        }

        // Render the order information
        const orderNumber = order.orderNumber || 'Unknown Order Number';
        const date = order.orderDate || 'Unknown Date';
        const vendorName = order.vendorName || 'Unknown Vendor';
        const vendorContact = order.vendorContact || 'Unknown Contact';
        const vendorLocation = order.vendorLocation || 'Unknown Location';

        orderDiv.innerHTML = `
            <h3 class="${orderStatusClass}">Order ${orderNumber} - ${order.status}</h3>
            <p>Date: ${date}</p>
            <p>Vendor: ${vendorName} (${vendorContact}), ${vendorLocation}</p>
            <ul>${itemsList}</ul>
            ${statusActions}
        `;

        ordersList.appendChild(orderDiv);
    });
}

function editOrder(orderNumber) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];

    // Find the order by orderNumber (instead of orderId)
    const order = purchaseOrders.find(order => order.orderNumber === orderNumber);

    if (order) {
        console.log("Editing Order:", order); // For debugging, ensure the correct order is being found

        if ((loggedInUser.role === 'project_manager' && order.status === 'raised') || loggedInUser.role === 'purchase_manager') {
            // Redirect to PurchaseOrder.html with the orderNumber as a query parameter
            window.location.href = `editpurchasedOrder.html?orderNumber=${order.orderNumber}`;
        } else {
            alert('You do not have permission to edit this order.');
        }
    } else {
        console.error('Order not found for orderNumber:', orderNumber);
    }
}

// Change Status Function
function changeStatus(orderNumber, newStatus) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    
    // Find the order by orderNumber
    const order = purchaseOrders.find(order => order.orderNumber === orderNumber);

    if (!order) {
        alert('Order not found.');
        return;
    }

    // Check for valid role and status change permissions
    if ((loggedInUser.role === 'purchase_manager' && newStatus === 'confirmed' && order.status === 'raised') ||
        (loggedInUser.role === 'purchase_manager' && newStatus === 'sent' && order.status === 'confirmed') ||
        (loggedInUser.role === 'inventory_manager' && newStatus === 'collectd' && order.status === 'confirmed')) {
        
        // Update the status
        order.status = newStatus;
        localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));

        // Re-render the purchase orders to reflect the status change
        renderPurchaseOrders();

        if (newStatus === 'received' && loggedInUser.role === 'inventory_manager') {
            alert(`Please review the received items for order #${order.orderNumber}.`);
        }
    } else {
        alert('You do not have permission to change the status of this order.');
    }
}

// Initialize dashboard
renderPurchaseOrders();

document.getElementById('createOrderBtn').addEventListener('click', function() {
    window.location.href = 'purchasedOrder.html';
});


function openCollectModal(orderNumber) {
    const collectModal = document.getElementById('collectModal');
    const collectOrderNumber = document.getElementById('collectOrderNumber');
    const collectProductList = document.getElementById('collectProductList');

    // Retrieve the purchase orders from localStorage
    let purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    
    // Find the order using the orderNumber
    const order = purchaseOrders.find(order => order.orderNumber === orderNumber);
    
    // Ensure the order exists
    if (!order) {
        alert('Order not found.');
        return;
    }

    // Check if order has already been collected
    if (order.status === 'collected') {
        alert('This order has already been collected.');
        return;
    }

    // Display the order number in the modal
    collectOrderNumber.textContent = orderNumber;

    // Clear previous product list
    collectProductList.innerHTML = '';

    // Render products for collecting bin locations and quantities
    order.products.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.innerHTML = `
            <h4>${product.productId}</h4>
            <label for="collectedQuantity${index}">Collected Quantity:</label>
            <input type="number" id="collectedQuantity${index}" value="${product.quantity}" max="${product.quantity}" required>

            <label for="binLocations${index}">How many bin locations?</label>
            <input type="number" id="binLocations${index}" min="1" max="5" value="1" required>
            <div id="binLocationFields${index}"></div>

            <label for="location${index}">Location:</label>
            <input type="any" id="location${index}" value="${product.location}" max="${product.location}" required>

        `;

        // Add event listener for bin locations
        productDiv.querySelector(`#binLocations${index}`).addEventListener('input', function () {
            createBinLocationFields(index, this.value);
        });

        collectProductList.appendChild(productDiv);

        // Initialize bin location fields with 1 bin location
        createBinLocationFields(index, 1);
    });

    // Show the modal
    collectModal.style.display = 'block';
}

function createBinLocationFields(productIndex, numLocations) {
    const binLocationFields = document.getElementById(`binLocationFields${productIndex}`);
    binLocationFields.innerHTML = '';

    for (let i = 0; i < numLocations; i++) {
        const binField = document.createElement('div');
        binField.innerHTML = `
            <label for="binLocation${productIndex}_${i}">Bin Location ${i + 1}:</label>
            <input type="text" id="binLocation${productIndex}_${i}" required>
            <label for="binQuantity${productIndex}_${i}">Quantity in Bin:</label>
            <input type="number" id="binQuantity${productIndex}_${i}" required>
        `;
        binLocationFields.appendChild(binField);
    }
}

document.getElementById('saveInventoryBtn').addEventListener('click', saveInventory);

function saveInventory() {
    const collectOrderNumber = document.getElementById('collectOrderNumber').textContent;
   
    let purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

    // Find the order in purchaseOrders by orderNumber
    const order = purchaseOrders.find(order => order.orderNumber === collectOrderNumber);
    if (!order) return;
    
    // Update order status to 'collected'
    order.status = 'collected';

    // Collect product details from the modal
    const collectedProducts = order.products.map((product, index) => {
        const collectedQuantity = document.getElementById(`collectedQuantity${index}`).value;
        const numBins = document.getElementById(`binLocations${index}`).value;
        const location = document.getElementById(`location${index}`).value;

        const binLocations = [];
        for (let i = 0; i < numBins; i++) {
            const binLocation = document.getElementById(`binLocation${index}_${i}`).value;
            const binQuantity = document.getElementById(`binQuantity${index}_${i}`).value;

            binLocations.push({
                binLocation,
                binQuantity: Number(binQuantity),
                location,
                
            });
        }

        return {
            productId: product.productId,
            collectedQuantity: Number(collectedQuantity),
            binLocations,
            location,

        };
    });

    // Save the collected products to the inventory
    inventory.push({
        orderNumber: collectOrderNumber,
        collectedProducts,
        location
        
    });

    // Update purchase orders and inventory in local storage
    localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));
    localStorage.setItem('inventory', JSON.stringify(inventory));

    // Close the modal and refresh the dashboard
    document.getElementById('collectModal').style.display = 'none';
    alert('Items collected and saved to inventory!');
    renderPurchaseOrders(); // Refresh the dashboard to hide the "Collect" button
}


    // Save the collected products to the inventory
    inventory.push({
        orderNumber: collectOrderNumber,
        collectedProducts,
       
        
    });

    localStorage.setItem('inventory', JSON.stringify(inventory));

    // Close the modal and refresh the dashboard
    document.getElementById('collectModal').style.display = 'none';
    alert('Items collected and saved to inventory!');
    renderPurchaseOrders();
