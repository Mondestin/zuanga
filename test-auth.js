// Quick test script for authentication endpoints
const baseUrl = 'http://localhost:3000/api/v1';

// Wait for server to be ready
async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${baseUrl.replace('/api/v1', '')}/api/v1/health`);
      if (response.ok) {
        console.log('✅ Server is ready!\n');
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('❌ Server not responding after multiple attempts');
  return false;
}

async function test() {
  console.log('🧪 Testing Authentication System...\n');
  
  // Wait for server
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.log('Please make sure the server is running on port 3000');
    return;
  }

  // Test 1: Register a parent
  console.log('1. Testing user registration (PARENT)...');
  try {
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'parent@test.com',
        phone: '+1234567890',
        password: 'Test1234',
        first_name: 'John',
        last_name: 'Parent',
        role: 'PARENT',
      }),
    });

    const registerData = await registerResponse.json();
    if (registerResponse.ok) {
      console.log('   ✅ Registration successful');
      console.log('   User ID:', registerData.data.user.id);
      console.log('   Access Token:', registerData.data.tokens.access_token.substring(0, 20) + '...');
      
      // Test 2: Login
      console.log('\n2. Testing login...');
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'parent@test.com',
          password: 'Test1234',
        }),
      });

      const loginData = await loginResponse.json();
      if (loginResponse.ok) {
        console.log('   ✅ Login successful');
        
        // Test 3: Get current user
        console.log('\n3. Testing /auth/me endpoint...');
        const meResponse = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${loginData.data.tokens.access_token}`,
          },
        });

        const meData = await meResponse.json();
        if (meResponse.ok) {
          console.log('   ✅ Get current user successful');
          console.log('   User:', meData.data.user.email, '-', meData.data.user.role);
        } else {
          console.log('   ❌ Get current user failed:', meData.error?.message);
        }

        // Test 4: Register a driver
        console.log('\n4. Testing driver registration...');
        const driverResponse = await fetch(`${baseUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'driver@test.com',
            phone: '+1234567891',
            password: 'Driver1234',
            first_name: 'Jane',
            last_name: 'Driver',
            role: 'DRIVER',
            license_number: 'DL123456',
            vehicle_make: 'Toyota',
            vehicle_model: 'Camry',
            vehicle_color: 'Blue',
            vehicle_plate_number: 'ABC123',
          }),
        });

        const driverData = await driverResponse.json();
        if (driverResponse.ok) {
          console.log('   ✅ Driver registration successful');
          console.log('   Driver ID:', driverData.data.user.id);
        } else {
          console.log('   ❌ Driver registration failed:', driverData.error?.message);
        }

      } else {
        console.log('   ❌ Login failed:', loginData.error?.message);
      }
    } else {
      console.log('   ❌ Registration failed:', registerData.error?.message);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  console.log('\n✅ Testing complete!');
}

test().catch(console.error);

