// System Health Check Script
const axios = require('axios');
const prisma = require('./config/prismaClient');

const BACKEND_URL = 'http://localhost:5001/api';
const FRONTEND_URL = 'http://10.12.3.169:5001/api';

// Test credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123'
};

const USER_CREDENTIALS = {
  email: 'user@example.com',
  password: 'user123'
};

let adminToken = '';
let userToken = '';

const api = axios.create({ baseURL: BACKEND_URL, timeout: 10000 });

// Add token interceptor
api.interceptors.request.use((config) => {
  if (adminToken && config.url?.includes('admin')) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

async function checkDatabaseConnection() {
  console.log('\n🗄️  Checking Database Connection...');
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected successfully (${userCount} users)`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function checkBackendServer() {
  console.log('\n🖥️  Checking Backend Server...');
  try {
    const response = await api.get('/');
    console.log('✅ Backend server is running');
    return true;
  } catch (error) {
    console.error('❌ Backend server not accessible:', error.message);
    return false;
  }
}

async function checkAuthentication() {
  console.log('\n🔐 Checking Authentication...');
  
  try {
    // Test admin login
    const adminResponse = await api.post('/users/login', ADMIN_CREDENTIALS);
    adminToken = adminResponse.data.token;
    console.log('✅ Admin authentication working');
    
    // Test user login
    const userResponse = await api.post('/users/login', USER_CREDENTIALS);
    userToken = userResponse.data.token;
    console.log('✅ User authentication working');
    
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function checkAdminEndpoints() {
  console.log('\n👑 Checking Admin Endpoints...');
  
  const endpoints = [
    { name: 'Get All Users', url: '/users' },
    { name: 'Get Admin Stats', url: '/users/admin/stats' },
    { name: 'Get Public Decks', url: '/decks/public' },
    { name: 'Get AI Logs', url: '/ai/logs?page=1&limit=5' }
  ];
  
  let passed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint.url);
      console.log(`✅ ${endpoint.name}: Working`);
      passed++;
    } catch (error) {
      console.error(`❌ ${endpoint.name}: Failed -`, error.response?.data?.message || error.message);
    }
  }
  
  console.log(`📊 Admin endpoints: ${passed}/${endpoints.length} working`);
  return passed === endpoints.length;
}

async function checkUserEndpoints() {
  console.log('\n👤 Checking User Endpoints...');
  
  const endpoints = [
    { name: 'Get Profile', url: '/users/profile' },
    { name: 'Get Decks', url: '/decks' },
    { name: 'Get Notes', url: '/notes' }
  ];
  
  let passed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint.url);
      console.log(`✅ ${endpoint.name}: Working`);
      passed++;
    } catch (error) {
      console.error(`❌ ${endpoint.name}: Failed -`, error.response?.data?.message || error.message);
    }
  }
  
  console.log(`📊 User endpoints: ${passed}/${endpoints.length} working`);
  return passed === endpoints.length;
}

async function checkSystemResources() {
  console.log('\n💻 Checking System Resources...');
  
  try {
    const stats = await api.get('/users/admin/stats');
    const data = stats.data;
    
    console.log('📈 System Statistics:');
    console.log(`   Users: ${data.users?.total || 0}`);
    console.log(`   Notes: ${data.content?.notes || 0}`);
    console.log(`   Decks: ${data.content?.decks || 0}`);
    console.log(`   Flashcards: ${data.content?.flashcards || 0}`);
    console.log(`   Study Plans: ${data.content?.studyPlans || 0}`);
    console.log(`   Uptime: ${Math.floor((data.system?.uptime || 0) / 60)} minutes`);
    console.log(`   Environment: ${data.system?.environment || 'unknown'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to get system stats:', error.message);
    return false;
  }
}

async function checkNetworkConnectivity() {
  console.log('\n🌐 Checking Network Connectivity...');
  
  try {
    const frontendApi = axios.create({ baseURL: FRONTEND_URL, timeout: 5000 });
    const response = await frontendApi.get('/');
    console.log('✅ Frontend network URL accessible');
    return true;
  } catch (error) {
    console.log('⚠️  Frontend network URL not accessible (expected if IP changed)');
    return false;
  }
}

async function runHealthCheck() {
  console.log('🏥 Starting System Health Check...\n');
  console.log('=' .repeat(50));
  
  const results = {
    database: await checkDatabaseConnection(),
    backend: await checkBackendServer(),
    auth: await checkAuthentication(),
    adminEndpoints: await checkAdminEndpoints(),
    userEndpoints: await checkUserEndpoints(),
    systemStats: await checkSystemResources(),
    network: await checkNetworkConnectivity()
  };
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 HEALTH CHECK SUMMARY');
  console.log('=' .repeat(50));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([check, status]) => {
    const icon = status ? '✅' : '❌';
    const name = check.charAt(0).toUpperCase() + check.slice(1);
    console.log(`${icon} ${name}: ${status ? 'PASS' : 'FAIL'}`);
  });
  
  console.log('=' .repeat(50));
  console.log(`🎯 Overall Health: ${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('🎉 System is healthy and ready to use!');
  } else if (passed >= total * 0.8) {
    console.log('⚠️  System has minor issues but is mostly functional');
  } else {
    console.log('🚨 System has significant issues that need attention');
  }
  
  await prisma.$disconnect();
  process.exit(passed === total ? 0 : 1);
}

if (require.main === module) {
  runHealthCheck().catch(console.error);
}

module.exports = { runHealthCheck };
