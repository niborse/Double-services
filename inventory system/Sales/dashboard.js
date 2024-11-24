// Sample data for sales orders
let salesOrders = JSON.parse(localStorage.getItem('salesOrders')) || [];

// Save the updated list back to local storage
localStorage.setItem('salesOrders', JSON.stringify(salesOrders));

// Function to render the sales orders on the dashboard
function renderSalesOrders() {
    const salesOrdersList = document.getElementById('salesOrdersList');
    salesOrdersList.innerHTML = '';

    // Retrieve sales orders from local storage
    const salesOrders = JSON.parse(localStorage.getItem('salesOrders')) || [];
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    console.log("Sales Orders:", salesOrders);

    // Loop through each order and display it on the dashboard
    salesOrders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order';

        // Render the products/items in each order
        const itemsList = Array.isArray(order.items) && order.items.length > 0
            ? order.items.map(item => `
                <li>
                    ${item.productId || 'Unknown Product'} - 
                    Quantity: ${item.quantity || 'N/A'} - 
                    Unit Price: $${item.unitPrice || 'N/A'} - 
                    Subtotal: $${item.subtotal || 'N/A'}
                </li>
              `).join('')
            : '<li>No items available</li>';

        let statusActions = '';

        // Action buttons based on logged-in user's role and current order status
        if (loggedInUser.role === 'sales_manager' && order.status === 'raised') {
            statusActions += `<button onclick="changeStatus('${order.orderNumber}', 'confirmed')">Confirm Order</button>`;
        } else if (loggedInUser.role === 'sales_manager' && order.status === 'dispatch') {
            statusActions += `<button onclick="changeStatus('${order.orderNumber}', 'delivered')">Mark as Delivered</button>`;
        } else if (loggedInUser.role === 'inventory_manager' && order.status === 'picking') {
            statusActions += `<button onclick="changeStatus('${order.orderNumber}', 'dispatch')">Mark as Dispatch</button>`;
        } else if (loggedInUser.role === 'warehouse_manager' && order.status === 'confirmed') {
            statusActions += `<button onclick="changeStatus('${order.orderNumber}', 'picking')">Mark as picking</button>`;
        }

        // Apply class to highlight completed orders
        let orderStatusClass = order.status === 'delivered' ? 'delivered-order' : '';

        // Render order details
        const orderNumber = order.orderNumber || 'Unknown Order Number';
        const date = order.orderDate || 'Unknown Date';
        const customerName = order.customerName || 'Unknown Customer'; // Ensure customerName field exists in your data

        orderDiv.innerHTML = `
            <h3 class="${orderStatusClass}">Order ${orderNumber} - ${order.status}</h3>
            <p>Date: ${date}</p>
            <p>Customer: ${customerName}</p>
            <ul>${itemsList}</ul>
            ${statusActions}
        `;

        salesOrdersList.appendChild(orderDiv);
    });
}

// Change Status Function remains the same
// Change Status Function
function changeStatus(orderNumber, newStatus) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let salesOrders = JSON.parse(localStorage.getItem('salesOrders')) || [];

    // Find the order by orderNumber
    const order = salesOrders.find(order => order.orderNumber === orderNumber);

    if (!order) {
        alert('Order not found.');
        return;
    }

    // Update status based on the logged-in user's role
    if ((loggedInUser.role === 'sales_manager' && order.status === 'raised' && newStatus === 'confirmed') ||
        (loggedInUser.role === 'sales_manager' && order.status === 'dispatch' && newStatus === 'delivered') ||
        (loggedInUser.role === 'inventory_manager' && order.status === 'picking' && newStatus === 'dispatch') ||
        (loggedInUser.role === 'warehouse_manager' && order.status === 'confirmed' && newStatus === 'picking')) {
        
        order.status = newStatus;
        localStorage.setItem('salesOrders', JSON.stringify(salesOrders));

        // Re-render the sales orders to reflect the status change
        renderSalesOrders();

        if (newStatus === 'delivered') {
            alert('Order #${order.orderNumber} has been marked as delivered.');
        }
    } else {
        alert('You do not have permission to change the status of this order.');
    }
}

// Initialize sales dashboard
renderSalesOrders();

// Button to create a new sales order (only for Sales Manager)
if (JSON.parse(localStorage.getItem('loggedInUser')).role === 'sales_manager') {
    document.getElementById('createSalesOrderBtn').addEventListener('click', function() {
        window.location.href = 'createSalesOrder.html';
    });
}