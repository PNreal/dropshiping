// Quick health check script
const http = require('http');

console.log('🔍 Checking application health...\n');

// Check backend
const checkBackend = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:5000/health', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Backend: Running on port 5000');
          resolve(true);
        } else {
          console.log('❌ Backend: Not responding correctly');
          resolve(false);
        }
      });
    }).on('error', () => {
      console.log('❌ Backend: Not running (port 5000)');
      console.log('   → Run: cd backend && npm start');
      resolve(false);
    });
  });
};

// Check API endpoints
const checkAPI = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:5000/api/services', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const services = JSON.parse(data);
          console.log(`✅ API Services: ${services.length} services found`);
          resolve(true);
        } else {
          console.log('❌ API Services: Not responding');
          resolve(false);
        }
      });
    }).on('error', () => {
      console.log('❌ API Services: Cannot connect');
      resolve(false);
    });
  });
};

// Run checks
(async () => {
  const backendOk = await checkBackend();
  if (backendOk) {
    await checkAPI();
  }
  
  console.log('\n📝 Next steps:');
  if (!backendOk) {
    console.log('   1. Start backend: cd backend && npm start');
  }
  console.log('   2. Start frontend: cd frontend && npm run dev');
  console.log('   3. Open browser: http://localhost:5173');
  console.log('\n📖 For more help, see TROUBLESHOOTING.md');
})();

