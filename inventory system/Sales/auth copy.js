document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Define the credentials for each role
    const credentials = {
        project_manager: { username: 'project_manager', password: 'project123' },
        purchase_manager: { username: 'purchase_manager', password: 'purchase123' },
        inventory_manager: { username: 'inventory_manager', password: 'inventory123' }
    };

    // Check if the role exists and if the provided username and password match
    if (credentials[role] && credentials[role].username === username && credentials[role].password === password) {
        localStorage.setItem('loggedInUser', JSON.stringify({ username, role }));
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid login details');
        document.getElementById('password').value = ''; // Clear the password field
    }
});
