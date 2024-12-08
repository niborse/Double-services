document.addEventListener('DOMContentLoaded', () => {
    // Fetch Data from Local Storage
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
    const salesOrders = JSON.parse(localStorage.getItem('salesOrders') || '[]');

    // Dynamically calculate available quantity in inventory
    inventory.forEach(item => {
        item.availableQuantity = item.binLocations?.reduce((total, bin) => total + (bin.binQuantity || 0), 0) || 0;
    });

    // Calculate Summary Metrics
    const totalInventory = inventory.reduce((sum, item) => sum + item.availableQuantity, 0);
    const totalSales = salesOrders.reduce((sum, order) =>
        sum + order.items.reduce((subtotal, item) => subtotal + item.subtotal, 0), 0);
    const pendingOrders = purchaseOrders.filter(order => order.status === 'raised').length;

    // Display Summary Metrics
    document.querySelector('#total-inventory span').textContent = totalInventory;
    document.querySelector('#total-sales span').textContent = `$${totalSales}`;
    document.querySelector('#pending-orders span').textContent = pendingOrders;

    // Populate Data Table
    function updateTable(data) {
        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = data.map(order => `
            <tr>
                <td>${order.orderNumber}</td>
                <td>${order.products?.[0]?.productId || order.items?.[0]?.productId || ''}</td>
                <td>${order.status}</td>
                <td>${order.products?.[0]?.quantity || order.items?.[0]?.quantity || ''}</td>
                <td>${order.location?.[0]?.location || order.items?.[0]?.location || ''}</td>
            </tr>
        `).join('');
    }

    // Initially load all purchase and sales orders
    updateTable([...purchaseOrders, ...salesOrders]);

    // Search and Filter
    const searchBar = document.getElementById('search-bar');
    const filterStatus = document.getElementById('filter-status');

    searchBar.addEventListener('input', filterData);
    filterStatus.addEventListener('change', filterData);

    function filterData() {
        const query = searchBar.value.toLowerCase();
        const statusFilter = filterStatus.value;

        const filteredData = [...purchaseOrders, ...salesOrders].filter(order => {
            const matchesQuery = query === '' || 
                order.orderNumber.toLowerCase().includes(query) ||
                (order.products?.[0]?.productId?.toLowerCase().includes(query) || 
                order.items?.[0]?.productId?.toLowerCase().includes(query));
            const matchesStatus = statusFilter === '' || order.status === statusFilter;
            return matchesQuery && matchesStatus;
        });

        updateTable(filteredData);
    }
});
