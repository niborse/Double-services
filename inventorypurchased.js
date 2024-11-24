document.addEventListener('DOMContentLoaded', () => {
    loadRecentOrders();
});

function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    const orderList = document.getElementById('orderList');
    orderList.innerHTML = '';

    orders.slice(-5).forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <p><strong>Product ID:</strong> ${order.productId}</p>
            <p><strong>Quantity:</strong> ${order.quantity}</p>
            <p><strong>Cost:</strong> ${order.cost}</p>
            <p><strong>Status:</strong> ${order.status}</p>
        `;
        orderList.appendChild(orderItem);
    });
}

function checkProductId() {
    const productId = document.getElementById('productId').value;
    const products = JSON.parse(localStorage.getItem('products')) || [];

    const product = products.find(p => p.id === productId);
    
    if (product) {
        // If product exists, display its details
        document.getElementById('productInfo').classList.remove('hidden');
        document.getElementById('availableQuantity').textContent = product.quantity;
        document.getElementById('productLocation').textContent = product.location;
        document.getElementById('productBinLocation').textContent = product.binLocation;
    } else {
        // Hide product info if ID not found
        document.getElementById('productInfo').classList.add('hidden');
    }
}

function saveNewProduct() {
    const newProduct = {
        id: document.getElementById('newProductId').value,
        description: document.getElementById('productDescription').value,
        photo: document.getElementById('itemPhoto').files[0], // File handling will need a different approach for saving
        quantity: parseInt(document.getElementById('openingBalance').value),
        location: document.getElementById('newLocation').value,
        batchId: document.getElementById('batchId').value,
        binLocation: document.getElementById('binLocation').value
    };

    let products = JSON.parse(localStorage.getItem('products')) || [];
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));

    alert('Product saved successfully!');
    
    // Generate and print barcode (placeholder function)
    generateBarcode(newProduct.id);

    document.getElementById('newProductForm').classList.add('hidden');
    document.getElementById('purchaseOrderFormSection').classList.remove('hidden');
}

function generateBarcode(productId) {
    // Placeholder function for barcode generation
    alert(`Barcode for Product ID: ${productId} generated successfully!`);
}

function raisePurchaseOrder() {
    const productId = document.getElementById('productId').value;
    const warehouseLocation = document.getElementById('warehouseLocation').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const cost = parseFloat(document.getElementById('cost').value);
    const vendor = {
        name: document.getElementById('vendorName').value,
        contact: document.getElementById('vendorContact').value,
        address: document.getElementById('vendorAddress').value
    };

    const newOrder = {
        id: Date.now(),
        productId,
        warehouseLocation,
        quantity,
        cost,
        vendor,
        status: 'Raised'
    };

    let purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
    purchaseOrders.push(newOrder);
    localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));

    alert('Purchase order raised successfully!');

    // Refresh recent orders list
    loadRecentOrders();
}
