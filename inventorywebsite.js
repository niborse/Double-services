document.getElementById('purchaseForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const productId = document.getElementById('productId').value;
    const quantity = document.getElementById('quantity').value;
    const location = document.getElementById('location').value;
    const binLocation = document.getElementById('binLocation').value;
    
    // Handle purchase order submission logic here
    console.log('Purchase Order Submitted:', { productId, quantity, location, binLocation });
});

document.getElementById('rawMaterialOutForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const projectId = document.getElementById('projectId').value;
    const outQuantity = document.getElementById('outQuantity').value;
    
    // Handle raw material out logic here
    console.log('Raw Material Out Submitted:', { projectId, outQuantity });
});

document.getElementById('batchManagementForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const batchId = document.getElementById('batchId').value;
    const batchQuantity = document.getElementById('batchQuantity').value;
    
    // Handle batch management logic here
    console.log('Batch Added:', { batchId, batchQuantity });
});
