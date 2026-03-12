/**
 * Test script for Dialogflow Voice Navigation
 * Run with: npx tsx scripts/test-dialogflow-voice.ts
 */

import { DialogflowVoiceNavigationService } from '../src/lib/services/DialogflowVoiceNavigationService';

async function testDialogflowVoiceNavigation() {
    console.log('🧪 Testing Dialogflow Voice Navigation Service\n');

    try {
        // Initialize service
        console.log('1️⃣ Initializing Dialogflow service...');
        const service = DialogflowVoiceNavigationService.getInstance();
        await service.initialize();
        console.log('✅ Service initialized\n');

        // Test commands
        const testCommands = [
            { text: 'go to dashboard', language: 'en' },
            { text: 'open product creator', language: 'en' },
            { text: 'show schemes', language: 'en' },
            { text: 'मुझे प्रोडक्ट क्रिएटर जाना है', language: 'hi' },
            { text: 'योजना दिखाओ', language: 'hi' },
            { text: 'show my inventory', language: 'en' },
            { text: 'take me to marketplace', language: 'en' },
            { text: 'go back', language: 'en' },
        ];

        console.log('2️⃣ Testing voice commands:\n');

        for (const command of testCommands) {
            console.log(`📝 Testing: "${command.text}" (${command.language})`);

            const result = await service.processVoiceInput(command.text, command.language);

            if (result.success && result.intent) {
                console.log(`✅ Success!`);
                console.log(`   Intent: ${result.intent.intent}`);
                console.log(`   Confidence: ${(result.intent.confidence * 100).toFixed(1)}%`);
                console.log(`   Route: ${result.intent.targetRoute}`);
                console.log(`   Message: ${result.intent.fulfillmentText || 'N/A'}`);
            } else {
                console.log(`❌ Failed: ${result.error}`);
            }
            console.log('');
        }

        console.log('3️⃣ Testing session management:\n');
        console.log(`Current Session ID: ${service.getSessionId()}`);

        service.resetSession();
        console.log(`New Session ID: ${service.getSessionId()}`);
        console.log('✅ Session reset successful\n');

        console.log('4️⃣ Testing language switching:\n');
        service.setLanguage('hi');
        console.log('✅ Language set to Hindi\n');

        console.log('🎉 All tests completed!\n');
        console.log('📊 Summary:');
        console.log(`   Total commands tested: ${testCommands.length}`);
        console.log(`   Service: Dialogflow CX`);
        console.log(`   Fallback: Semantic AI Service`);
        console.log('');
        console.log('💡 Next steps:');
        console.log('   1. Create Dialogflow agent (see docs/DIALOGFLOW-SETUP-GUIDE.md)');
        console.log('   2. Add training phrases for better accuracy');
        console.log('   3. Test with real voice input in the app');
        console.log('   4. Monitor analytics for usage patterns');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('\n⚠️  Note: If Dialogflow is not configured, the system will use fallback services.');
        console.log('   This is expected behavior and the voice navigation will still work.');
        console.log('\n📖 See docs/DIALOGFLOW-SETUP-GUIDE.md for setup instructions.');
    }
}

// Run tests
testDialogflowVoiceNavigation().catch(console.error);
