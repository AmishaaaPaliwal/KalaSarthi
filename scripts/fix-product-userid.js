/**
 * Script to add/update userId field in Firestore products
 * Run with: node scripts/fix-product-userid.js YOUR_USER_ID
 * 
 * This will add the userId field to all products that don't have it
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../google-credentials.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function fixProductUserId(userId) {
    if (!userId) {
        console.error('❌ Error: Please provide a user ID');
        console.log('Usage: node scripts/fix-product-userid.js YOUR_USER_ID');
        process.exit(1);
    }

    console.log('🔧 Fixing product userId fields...');
    console.log(`Target userId: ${userId}`);
    console.log('─'.repeat(60));

    try {
        // Get all products
        const productsSnapshot = await db.collection('products').get();

        if (productsSnapshot.empty) {
            console.log('⚠️  No products found in Firestore');
            return;
        }

        console.log(`📦 Found ${productsSnapshot.size} products`);
        console.log('');

        let updated = 0;
        let skipped = 0;
        let errors = 0;

        // Update each product
        for (const doc of productsSnapshot.docs) {
            const data = doc.data();
            const productName = data.name || data.productName || doc.id;

            try {
                if (!data.userId) {
                    // Add userId if missing
                    await doc.ref.update({ userId });
                    console.log(`✅ Updated: ${productName} (added userId)`);
                    updated++;
                } else if (data.userId !== userId) {
                    // Update userId if different
                    await doc.ref.update({ userId });
                    console.log(`✅ Updated: ${productName} (changed userId from ${data.userId})`);
                    updated++;
                } else {
                    // Already has correct userId
                    console.log(`⏭️  Skipped: ${productName} (already has correct userId)`);
                    skipped++;
                }
            } catch (error) {
                console.error(`❌ Error updating ${productName}:`, error.message);
                errors++;
            }
        }

        console.log('');
        console.log('─'.repeat(60));
        console.log('📊 Summary:');
        console.log(`   Updated: ${updated}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Errors: ${errors}`);
        console.log('');

        if (updated > 0) {
            console.log('✅ Products updated successfully!');
            console.log('');
            console.log('Next steps:');
            console.log('1. Restart your dev server: npm run dev');
            console.log('2. Ask Artisan Buddy: "Tell me about my inventory"');
            console.log('3. You should now see your products!');
        } else if (skipped > 0 && errors === 0) {
            console.log('✅ All products already have the correct userId!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Get userId from command line argument
const userId = process.argv[2];
fixProductUserId(userId);
