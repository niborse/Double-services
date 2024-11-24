// Preview the uploaded photo
document.getElementById('photo').addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('photoPreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('createProductForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const productId = document.getElementById('productId').value;
    const subGroup = document.getElementById('subGroup').value;
    const groupName = document.getElementById('groupName').value;
    const description = document.getElementById('description').value;
    const openingBalance = document.getElementById('openingBalance').value;
    const location = document.getElementById('location').value;
    const binLocation = document.getElementById('binLocation').value;
    const photo = document.getElementById('photo').files[0];

    // Save the product to local storage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.push({
        productId,
        subGroup,
        groupName,
        description,
        openingBalance,
        location,
        binLocation,
        photo: photo ? URL.createObjectURL(photo) : null
    });
    localStorage.setItem('products', JSON.stringify(products));

    // Redirect back to the purchase order page
    window.location.href = 'purchasedOrder.html';
});
