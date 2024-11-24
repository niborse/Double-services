// roleHandler.js

document.addEventListener('DOMContentLoaded', function() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (!loggedInUser) {
        window.location.href = 'login.html'; // Redirect to login if not logged in
    } else {
        const roleSpecificContent = document.getElementById('roleSpecificContent');
        
        if (loggedInUser.role === 'projectManager') {
            roleSpecificContent.innerHTML = '<h2>Project Manager Dashboard</h2><p>You can raise purchase orders.</p>';
        } else if (loggedInUser.role === 'purchaseManager') {
            roleSpecificContent.innerHTML = '<h2>Purchase Manager Dashboard</h2><p>You can raise, confirm, and send purchase orders.</p>';
        } else if (loggedInUser.role === 'inventoryManager') {
            roleSpecificContent.innerHTML = '<h2>Inventory Manager Dashboard</h2><p>You can receive stock and manage inventory.</p>';
        }
    }
});
