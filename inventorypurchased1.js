function calculateTotal() {
    const quantity = parseFloat(document.getElementById('quantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
  
    const totalCost = quantity * unitPrice * (1 - discount / 100);
    document.getElementById('totalCost').value = totalCost.toFixed(2);
  }