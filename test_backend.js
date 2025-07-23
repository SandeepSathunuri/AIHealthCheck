// Simple script to test your Render backend
const BACKEND_URL = 'https://aihealthcheck-scoe.onrender.com';

async function testBackend() {
  console.log('🔍 Testing Render Backend...');
  
  // Test 1: Health Check
  try {
    console.log('\n1. Testing Health Check...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  // Test 2: API Status
  try {
    console.log('\n2. Testing API Status...');
    const statusResponse = await fetch(`${BACKEND_URL}/api/status`);
    const statusData = await statusResponse.json();
    console.log('✅ API Status:', statusData);
  } catch (error) {
    console.log('❌ API Status Failed:', error.message);
  }

  // Test 3: Try Signup
  try {
    console.log('\n3. Testing Signup...');
    const signupResponse = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      }),
    });
    
    const signupData = await signupResponse.json();
    console.log('Status:', signupResponse.status);
    console.log('Response:', signupData);
    
    if (signupResponse.ok) {
      console.log('✅ Signup Success');
      
      // Test 4: Try Login with same credentials
      console.log('\n4. Testing Login...');
      const loginResponse = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123'
        }),
      });
      
      const loginData = await loginResponse.json();
      console.log('Status:', loginResponse.status);
      console.log('Response:', loginData);
      
      if (loginResponse.ok) {
        console.log('✅ Login Success');
      } else {
        console.log('❌ Login Failed');
      }
    } else {
      console.log('❌ Signup Failed');
    }
  } catch (error) {
    console.log('❌ Auth Test Failed:', error.message);
  }
}

// Run the test
testBackend();