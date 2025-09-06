const axios = require('axios');

async function testBasic() {
  try {
    console.log('🧪 Testing basic API connectivity...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health check:', healthResponse.data.status);

    // Test mining stats endpoint
    console.log('\n2. Testing mining stats...');
    const miningResponse = await axios.get('http://localhost:3000/api/mining/stats');
    console.log('✅ Mining stats retrieved');

    console.log('\n🎉 Basic API tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testBasic();
