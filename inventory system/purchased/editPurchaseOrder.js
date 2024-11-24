document.addEventListener('DOMContentLoaded', () => {
    loadPurchaseOrderForEditing();

    // Event listener for saving the updated order
    document.getElementById('saveOrderBtn').addEventListener('click', saveOrder);
});

// Function to load the existing purchase order details into the form
function loadPurchaseOrderForEditing() {
    const orderNumber = getOrderNumberFromUrl();
    if (!orderNumber) {
        console.error('No order number found in URL');
        return;
    }

    const purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    const orderToEdit = purchaseOrders.find(order => order.orderNumber === orderNumber);

    if (orderToEdit) {
        document.getElementById('orderNumber').value = orderToEdit.orderNumber;
        document.getElementById('orderDate').value = orderToEdit.orderDate;
        document.getElementById('vendorName').value = orderToEdit.vendorName;
        document.getElementById('vendorLocation').value = orderToEdit.vendorLocation;
        document.getElementById('vendorContact').value = orderToEdit.vendorContact;

        const productDetailsContainer = document.getElementById('productDetailsContainer');
        productDetailsContainer.innerHTML = ''; 

        orderToEdit.products.forEach((product, index) => {
            const productEntry = `
                <div class="product-entry">
                    <label for="productId${index}">Product ID:</label>
                    <input type="text" id="productId${index}" name="productId${index}" value="${product.productId}" required>

                    <label for="quantity${index}">Quantity:</label>
                    <input type="number" id="quantity${index}" name="quantity${index}" value="${product.quantity}" required>

                    <label for="unitPrice${index}">Unit Price:</label>
                    <input type="number" id="unitPrice${index}" name="unitPrice${index}" value="${product.unitPrice}" required>

                    <label for="discount${index}">Discount:</label>
                    <input type="number" id="discount${index}" name="discount${index}" value="${product.discount}" required>

                    <label for="subtotal${index}">Subtotal Cost:</label>
                    <input type="number" id="subtotal${index}" name="subtotal${index}" value="${product.subtotal}" readonly>

                    <label for="location${index}">Warehouse Location:</label>
                    <input type="text" id="location${index}" name="location${index}" value="${product.location}" required>

                    <button type="button" class="removeProductBtn" onclick="removeProduct(${index})">Remove</button>
                </div>
            `;
            productDetailsContainer.insertAdjacentHTML('beforeend', productEntry);
        });

    } else {
        console.error('Order not found');
    }
}

// Helper function to get order number from the URL
function getOrderNumberFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('orderNumber');
}

// Function to save the updated order
function saveOrder(event) {
    event.preventDefault();

    // Get the existing orders from localStorage
    let purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];

    // Get the current order number (used to find and update the existing order)
    const orderNumber = document.getElementById('orderNumber').value;

    // Collect updated order details
    const updatedOrder = {
        orderDate: document.getElementById('orderDate').value,
        orderNumber: orderNumber,
        products: [],
        status: 'raised',
        vendorContact: document.getElementById('vendorContact').value,
        
        vendorLocation: document.getElementById('vendorLocation').value,
        vendorName: document.getElementById('vendorName').value
        
    };

    // Loop through the product entries to gather all products
    const productEntries = document.querySelectorAll('.product-entry');
    productEntries.forEach((entry, index) => {
        const productId = document.getElementById(`productId${index}`).value;
        const quantity = document.getElementById(`quantity${index}`).value;
        const unitPrice = document.getElementById(`unitPrice${index}`).value;
        const discount = document.getElementById(`discount${index}`).value;
        const subtotal = document.getElementById(`subtotal${index}`).value;
        const location = document.getElementById(`location${index}`).value;

        updatedOrder.products.push({
            productId: productId,
            quantity: parseInt(quantity),
            unitPrice: parseFloat(unitPrice),
            discount: parseFloat(discount),
            subtotal: parseFloat(subtotal),
            location: location,
            
        });
    });

    // Find the index of the existing order in the array
    const orderIndex = purchaseOrders.findIndex(order => order.orderNumber === orderNumber);

    if (orderIndex !== -1) {
        // Replace the existing order with the updated order
        purchaseOrders[orderIndex] = updatedOrder;

        // Save the updated array back to localStorage
        localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));

        alert('Order updated successfully!');
        window.location.href = 'dashboard.html';
    } else {
        console.error('Order not found for updating');
    }
}

// Function to remove a product entry
function removeProduct(index) {
    const productEntry = document.getElementById(`productId${index}`).closest('.product-entry');
    productEntry.remove();
}
