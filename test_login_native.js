async function checkLogin() {
    try {
        const response = await fetch('https://escoladeiaform.onrender.com/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin@escoladeia.com',
                password: '@Admin123@'
            })
        });

        const data = await response.json();
        console.log('Login Status:', response.status);
        console.log('Response Data:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

checkLogin();
