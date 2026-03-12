/**
 * Dialogflow Intent Detection API Route
 * Server-side endpoint for detecting intents using Dialogflow CX
 */

import { NextRequest, NextResponse } from 'next/server';
import { SessionsClient } from '@google-cloud/dialogflow-cx';

// Route mapping for navigation intents (matching actual KalaSarthi routes)
const routeMapping: Record<string, string> = {
    'navigate.dashboard': '/dashboard',
    'navigate.profile': '/profile',
    'navigate.product_creator': '/smart-product-creator',
    'navigate.design_generator': '/ai-design-generator',
    'navigate.artisan_buddy': '/artisan-buddy',
    'navigate.schemes': '/scheme-sahayak',
    'navigate.scheme_sahayak': '/scheme-sahayak',
    'navigate.trends': '/trend-spotter',
    'navigate.trend_spotter': '/trend-spotter',
    'navigate.buyer_connect': '/buyer-connect',
    'navigate.inventory': '/dashboard/inventory',
    'navigate.marketplace': '/marketplace',
    'navigate.global_bazaar': '/marketplace',
    'navigate.finance': '/finance/dashboard',
    'navigate.digital_khata': '/finance/dashboard',
    'navigate.sales': '/sales',
    'navigate.orders': '/orders',
    'navigate.cart': '/marketplace/cart',
    'navigate.wishlist': '/marketplace/wishlist',
    'navigate.settings': '/settings',
    'navigate.help': '/help',
    'navigate.back': 'back',
};

// Map language codes
function mapLanguageCode(languageCode: string): string {
    const mapping: Record<string, string> = {
        'en': 'en',
        'hi': 'hi',
        'bn': 'bn',
        'ta': 'ta',
        'te': 'te',
        'mr': 'mr',
        'gu': 'gu',
        'kn': 'kn',
        'ml': 'ml',
        'pa': 'pa',
        'en-US': 'en',
        'hi-IN': 'hi',
        'bn-IN': 'bn',
        'ta-IN': 'ta',
        'te-IN': 'te',
        'mr-IN': 'mr',
        'gu-IN': 'gu',
        'kn-IN': 'kn',
        'ml-IN': 'ml',
        'pa-IN': 'pa',
    };
    return mapping[languageCode] || 'en';
}

export async function POST(request: NextRequest) {
    try {
        const { text, languageCode = 'en' } = await request.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No text provided',
                },
                { status: 400 }
            );
        }

        // Check if Dialogflow is configured
        const agentId = process.env.NEXT_PUBLIC_DIALOGFLOW_AGENT_ID;
        if (!agentId) {
            console.log('⚠️ Dialogflow not configured, returning fallback response');
            return NextResponse.json({
                success: false,
                error: 'Dialogflow not configured',
            });
        }

        // Initialize Dialogflow client
        const projectId = process.env.NEXT_PUBLIC_DIALOGFLOW_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'gen-lang-client-0314311341';
        const location = process.env.NEXT_PUBLIC_DIALOGFLOW_LOCATION || 'us-central1';
        const sessionId = `voice-nav-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const client = new SessionsClient({
            apiEndpoint: `${location}-dialogflow.googleapis.com`,
        });

        // Create session path
        const sessionPath = client.projectLocationAgentSessionPath(
            projectId,
            location,
            agentId,
            sessionId
        );

        // Prepare request
        const requestPayload = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: text,
                },
                languageCode: mapLanguageCode(languageCode),
            },
        };

        // Detect intent
        const [response] = await client.detectIntent(requestPayload);
        const queryResult = response.queryResult;

        if (!queryResult) {
            return NextResponse.json({
                success: false,
                error: 'No query result from Dialogflow',
            });
        }

        const intentName = queryResult.intent?.displayName || '';
        const confidence = queryResult.intentDetectionConfidence || 0;
        const fulfillmentText = queryResult.responseMessages?.[0]?.text?.text?.[0] || '';

        // Map intent to route
        const targetRoute = routeMapping[intentName] || '/dashboard';

        return NextResponse.json({
            success: true,
            intent: {
                intent: intentName,
                confidence,
                parameters: {},
                targetRoute,
                fulfillmentText,
            },
            sessionId,
        });
    } catch (error) {
        console.error('Dialogflow intent detection error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
