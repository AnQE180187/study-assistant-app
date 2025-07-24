// Integration Test Script for Frontend-Backend API
const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:5000/api';
const FRONTEND_API_URL = 'http://10.12.3.169:5000/api'; // Current IP

// Test credentials
const TEST_ADMIN = {
  email: 'admin@example.com',
  password: 'admin123'
};

const TEST_USER = {
  email: 'user@example.com', 
  password: 'user123'
};

let adminToken = '';
let userToken = '';

// Create API instances for both URLs
const backendApi = axios.create({ baseURL: BACKEND_URL, timeout: 10000 });
const frontendApi = axios.create({ baseURL: FRONTEND_API_URL, timeout: 10000 });

// Add token interceptors
[backendApi, frontendApi].forEach(api => {
  api.interceptors.request.use((config) => {
    if (adminToken && config.url?.includes('admin')) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  });
});

async function testConnection(api, name) {
  try {
    console.log(`\n🔗 Testing ${name} connection...`);
    const response = await api.get('/');
    console.log(`✅ ${name} connection successful`);
    return true;
  } catch (error) {
    console.error(`❌ ${name} connection failed:`, error.message);
    return false;
  }
}

async function testLogin(api, credentials, name) {
  try {
    console.log(`\n🔐 Testing ${name} login...`);
    const response = await api.post('/users/login', credentials);
    const token = response.data.token;
    console.log(`✅ ${name} login successful`);
    return token;
  } catch (error) {
    console.error(`❌ ${name} login failed:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testAdminEndpoints(api, name) {
  console.log(`\n👑 Testing ${name} Admin Endpoints...`);
  
  const tests = [
    {
      name: 'Get All Users',
      endpoint: '/users',
      method: 'get'
    },
    {
      name: 'Get Admin Stats', 
      endpoint: '/users/admin/stats',
      method: 'get'
    },
    {
      name: 'Get Public Decks',
      endpoint: '/decks/public', 
      method: 'get'
    },
    {
      name: 'Get AI Logs',
      endpoint: '/ai/logs?page=1&limit=5',
      method: 'get'
    }
  ];

  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`  📋 Testing ${test.name}...`);
      const response = await api[test.method](test.endpoint);
      console.log(`  ✅ ${test.name}: Success (${Array.isArray(response.data) ? response.data.length : 'object'} items)`);
      results.push({ ...test, success: true, data: response.data });
    } catch (error) {
      console.error(`  ❌ ${test.name}: Failed -`, error.response?.data?.message || error.message);
      results.push({ ...test, success: false, error: error.message });
    }
  }
  
  return results;
}

async function testCRUDOperations(api, name) {
  console.log(`\n🔧 Testing ${name} CRUD Operations...`);
  
  // This would test create/update/delete operations
  // For safety, we'll just test read operations
  console.log('  ℹ️  CRUD tests skipped for safety (would modify data)');
  return [];
}

async function compareResponses(backendResults, frontendResults) {
  console.log('\n🔍 Comparing Backend vs Frontend Responses...');
  
  for (let i = 0; i < backendResults.length; i++) {
    const backend = backendResults[i];
    const frontend = frontendResults[i];
    
    if (backend.success && frontend.success) {
      // Compare data structures
      const backendKeys = Object.keys(backend.data || {});
      const frontendKeys = Object.keys(frontend.data || {});
      
      if (JSON.stringify(backendKeys.sort()) === JSON.stringify(frontendKeys.sort())) {
        console.log(`  ✅ ${backend.name}: Response structures match`);
      } else {
        console.log(`  ⚠️  ${backend.name}: Response structures differ`);
        console.log(`    Backend keys: ${backendKeys.join(', ')}`);
        console.log(`    Frontend keys: ${frontendKeys.join(', ')}`);
      }
    } else if (backend.success !== frontend.success) {
      console.log(`  ❌ ${backend.name}: Success status differs (BE: ${backend.success}, FE: ${frontend.success})`);
    }
  }
}

async function runIntegrationTests() {
  console.log('🚀 Starting Frontend-Backend Integration Tests...\n');
  
  // Test connections
  const backendConnected = await testConnection(backendApi, 'Backend');
  const frontendConnected = await testConnection(frontendApi, 'Frontend');
  
  if (!backendConnected) {
    console.log('❌ Backend not available. Make sure backend is running on localhost:5000');
    return;
  }
  
  if (!frontendConnected) {
    console.log('⚠️  Frontend API URL not accessible. This is expected if IP changed.');
  }
  
  // Test admin login
  adminToken = await testLogin(backendApi, TEST_ADMIN, 'Backend Admin');
  if (!adminToken) {
    console.log('❌ Cannot proceed without admin login');
    return;
  }
  
  // Test admin endpoints on backend
  const backendResults = await testAdminEndpoints(backendApi, 'Backend');
  
  // Test admin endpoints on frontend API if available
  let frontendResults = [];
  if (frontendConnected) {
    frontendResults = await testAdminEndpoints(frontendApi, 'Frontend');
    await compareResponses(backendResults, frontendResults);
  }
  
  // Summary
  console.log('\n📊 Integration Test Summary:');
  console.log(`✅ Backend Connection: ${backendConnected ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Frontend Connection: ${frontendConnected ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Admin Login: ${adminToken ? 'PASS' : 'FAIL'}`);
  
  const backendPassed = backendResults.filter(r => r.success).length;
  const backendTotal = backendResults.length;
  console.log(`✅ Backend Admin APIs: ${backendPassed}/${backendTotal} PASS`);
  
  if (frontendConnected) {
    const frontendPassed = frontendResults.filter(r => r.success).length;
    const frontendTotal = frontendResults.length;
    console.log(`✅ Frontend Admin APIs: ${frontendPassed}/${frontendTotal} PASS`);
  }
  
  console.log('\n🎉 Integration Tests Completed!');
}

// Run tests if called directly
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

module.exports = {
  runIntegrationTests,
  testConnection,
  testLogin,
  testAdminEndpoints,
};
