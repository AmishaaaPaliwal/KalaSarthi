/**
 * Test script for Unified Data Service
 * Run with: node scripts/test-unified-data.js
 */

const BASE_URL = 'http://localhost:9003';

const testQueries = [
    {
        name: 'Sales Query',
        query: 'Tell me about my sales',
        expectedFeatures: ['sales'],
    },
    {
        name: 'Scheme Query',
        query: 'Which government schemes am I eligible for?',
        expectedFeatures: ['schemes'],
    },
    {
        name: 'Inventory Query',
        query: 'Show my inventory status',
        expectedFeatures: ['inventory'],
    },
    {
        name: 'Buyer Connect Query',
        query: 'Any new buyer messages?',
        expectedFeatures: ['buyerConnect'],
    },
    {
        name: 'Marketplace Query',
        query: 'How are my marketplace listings doing?',
        expectedFeatures: ['marketplace'],
    },
    {
        name: 'Profile Query',
        query: 'Show my profile and skills',
        expectedFeatures: ['profile'],
    },
    {
        name: 'Multi-Feature Query',
        query: 'Give me my business overview',
        expectedFeatures: ['sales', 'inventory', 'marketplace', 'buyerConnect'],
    },
    {
        name: 'Hybrid Query',
        query: 'How can I improve my sales?',
        expectedFeatures: ['sales'],
    },
    {
        name: 'Generic Query (No Data)',
        query: 'What is GST?',
        expectedFeatures: [],
    },
];

async function testUnifiedData() {
    console.log('🧪 Testing Unified Data Service');
    console.log('═'.repeat(60));

    for (const test of testQueries) {
        console.log(`\n📝 Test: ${test.name}`);
        console.log(`Query: "${test.query}"`);
        console.log('─'.repeat(60));

        try {
            const response = await fetch(`${BASE_URL}/api/unified-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: test.query,
                    userId: 'test-user-123',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('✅ Success!');
                console.log(`Has Data: ${data.hasData}`);
                console.log(`Features Detected: ${data.features?.join(', ') || 'None'}`);

                if (test.expectedFeatures.length > 0) {
                    const allExpectedFound = test.expectedFeatures.every(f =>
                        data.features?.includes(f)
                    );
                    if (allExpectedFound) {
                        console.log('✅ All expected features detected!');
                    } else {
                        console.log('⚠️ Some expected features missing');
                        console.log(`Expected: ${test.expectedFeatures.join(', ')}`);
                    }
                } else {
                    if (!data.hasData) {
                        console.log('✅ Correctly identified as generic query (no data fetch)');
                    } else {
                        console.log('⚠️ Unexpected data fetch for generic query');
                    }
                }
            } else {
                console.log('❌ Failed!');
                console.log(JSON.stringify(data, null, 2));
            }
        } catch (error) {
            console.log('❌ Error:', error.message);
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✨ All tests completed!');
    console.log('\nNote: Make sure the dev server is running on port 9003');
    console.log('Run: npm run dev');
}

// Run tests
testUnifiedData().catch(console.error);
