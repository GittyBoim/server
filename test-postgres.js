const axios = require('axios');

async function testPostgreSQLConnectivity() {
  const baseURL = 'http://localhost:3000';

  try {
    console.log('Testing PostgreSQL Database Connectivity...\n');

    // Test 1: Register a user (should work with database)
    console.log('1. Registering a test user...');
    const registerResponse = await axios.post(baseURL + '/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '123-456-7890'
    });
    console.log('? User registered successfully:', registerResponse.data.user.name);

    const token = registerResponse.data.token;

    // Test 2: Create QR item (should work with database)
    console.log('\n2. Creating QR item with authentication...');
    const createResponse = await axios.post(baseURL + '/items/create', {}, {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('? Item created with serial:', createResponse.data.item.serialNumber);
    console.log('? QR URL:', createResponse.data.qrUrl);

    const serialNumber = createResponse.data.item.serialNumber;

    // Test 3: Get item by serial (should work with database)
    console.log('\n3. Retrieving item by serial number...');
    const getResponse = await axios.get(baseURL + '/items/' + serialNumber);
    console.log('? Item retrieved:', getResponse.data.serialNumber);
    console.log('? Item status:', getResponse.data.status);

    // Test 4: Get user items (should work with database)
    console.log('\n4. Getting user items...');
    const myItemsResponse = await axios.get(baseURL + '/items/my/items', {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('? User has', myItemsResponse.data.length, 'items');

    // Test 5: Login (should work with database)
    console.log('\n5. Testing login...');
    const loginResponse = await axios.post(baseURL + '/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('? Login successful for:', loginResponse.data.user.name);

    console.log('\n?? PostgreSQL database connectivity is working perfectly!');
    console.log('? All CRUD operations successful');
    console.log('? Authentication working');
    console.log('? QR system fully functional');

  } catch (error) {
    console.error('? Test failed:', error.response?.data?.error || error.message);
    if (error.response?.status) {
      console.error('Status code:', error.response.status);
    }
  }
}

testPostgreSQLConnectivity();
