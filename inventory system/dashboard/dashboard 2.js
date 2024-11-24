document.addEventListener('DOMContentLoaded', () => {
    // Fetch Data from Local Storage
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
    const salesOrders = JSON.parse(localStorage.getItem('salesOrders') || '[]');
  
    // Calculate Summary Metrics
    const totalInventory = inventory.reduce((sum, item) => sum + item.availableQuantity, 0);
    const totalSales = salesOrders.reduce((sum, order) =>
      sum + order.items.reduce((subtotal, item) => subtotal + item.subtotal, 0), 0);
    const pendingOrders = purchaseOrders.filter(order => order.status === 'pending').length;
  
    document.getElementById('total-inventory').textContent = totalInventory;
    document.getElementById('total-sales').textContent = `$${totalSales}`;
    document.getElementById('pending-orders').textContent = pendingOrders;
  
    // Populate Data Table
    function updateTable(data) {
      const tableBody = document.querySelector('#data-table tbody');
      tableBody.innerHTML = data.map(order => `
        <tr>
          <td>${order.orderNumber}</td>
          <td>${order.products?.[0]?.productId || order.items?.[0]?.productId || ''}</td>
          <td>${order.status}</td>
          <td>${order.products?.[0]?.quantity || order.items?.[0]?.quantity || ''}</td>
          <td>${order.location ?.[0]?.location || order.items?.[0]?.location || ''}</td>
        </tr>
      `).join('');
    }
  
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
        const matchesQuery = query === '' || order.orderNumber.toLowerCase().includes(query);
        const matchesStatus = statusFilter === '' || order.status === statusFilter;
        return matchesQuery && matchesStatus;
      });
  
      updateTable(filteredData);
    }
  
    // Render Charts
    const ctxInventory = document.getElementById('inventory-chart').getContext('2d');
    const inventoryChart = new Chart(ctxInventory, {
      type: 'bar',
      data: {
        labels: inventory.map(item => item.productId),
        datasets: [{
          label: 'Available Quantity',
          data: inventory.map(item => item.availableQuantity),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  
    const ctxSales = document.getElementById('sales-trends-chart').getContext('2d');
    const salesChart = new Chart(ctxSales, {
      type: 'line',
      data: {
        labels: salesOrders.map(order => order.orderDate),
        datasets: [{
          label: 'Sales Amount',
          data: salesOrders.map(order =>
            order.items.reduce((subtotal, item) => subtotal + item.subtotal, 0)),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  });
  