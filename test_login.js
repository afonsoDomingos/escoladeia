const axios = require('axios');

async function checkLogin() {
    try {
        const response = await axios.post('https://escoladeiaform.onrender.com/admin/login', {
            username: 'admin@escoladeia.com',
            password: '@Admin123@'
        });
        console.log('Login Status:', response.status);
        console.log('Response Data:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Login Failed. Status:', error.response.status);
            console.log('Error Data:', error.response.data);
        } else {
            console.log('Network/Other Error:', error.message);
        }
    }
}

checkLogin();
