/**
 * Test script for Sales Data API
 * Run with: node scripts/test-sales-api.js
 */

const BASE_URL = 'http://localhost:9003';

async function testAPI(endpoint, options = {}) {
    console.log(`\n🧪 Testing: ${endpoint}`);
    console.log('─'.repeat(50));

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();

        if (response.ok) {
            console.log('✅ Success!');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Failed!');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Sales Data API Test Suite');
    console.log('═'.repeat(50));

    // Test 1: Current Sales
    await testAPI('/api/sales/current');

    // Test 2: Current Sales with userId
    await testAPI('/api/sales/current?userId=test-user-123');

    // Test 3: Aggregated Sales
    await testAPI('/api/sales/aggregated');

    // Test 4: Aggregated Sales with userId
    await testAPI('/api/sales/aggregated?userId=test-user-123');

    // Test 5: Marketplace Sales
    await testAPI('/api/sales/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'test-user-123' }),
    });

    // Test 6: Amazon Sales
    await testAPI('/api/sales/amazon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials: {} }),
    });

    // Test 7: List Artisan Buddy Tools
    await testAPI('/api/artisan-buddy/tools');

    // Test 8: Execute Tool
    await testAPI('/api/artisan-buddy/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            toolName: 'get_aggregated_sales',
            parameters: { userId: 'test-user-123' },
        }),
    });

    console.log('\n' + '═'.repeat(50));
    console.log('✨ All tests completed!');
    console.log('\nNote: Make sure the dev server is running on port 9003');
    console.log('Run: npm run dev');
}

// Run tests
runTests().catch(console.error);
