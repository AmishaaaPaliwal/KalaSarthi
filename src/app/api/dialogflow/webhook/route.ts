/**
 * Dialogflow Webhook API Route
 * Handles fulfillment requests from Dialogflow CX
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Extract intent information
        const intentInfo = body.intentInfo;
        const sessionInfo = body.sessionInfo;
        const pageInfo = body.pageInfo;

        const intentName = intentInfo?.displayName || '';
        const parameters = intentInfo?.parameters || {};

        console.log('📞 Dialogflow Webhook called:', {
            intent: intentName,
            parameters,
            session: sessionInfo?.session,
        });

        // Route mapping (matching actual KalaSarthi routes)
        const routeMapping: Record<string, { route: string; message: string }> = {
            'navigate.dashboard': {
                route: '/dashboard',
                message: 'Opening your dashboard',
            },
            'navigate.product_creator': {
                route: '/smart-product-creator',
                message: 'Opening Product Creator',
            },
            'navigate.design_generator': {
                route: '/ai-design-generator',
                message: 'Opening Design Generator',
            },
            'navigate.artisan_buddy': {
                route: '/artisan-buddy',
                message: 'Opening Artisan Buddy',
            },
            'navigate.schemes': {
                route: '/scheme-sahayak',
                message: 'Showing government schemes',
            },
            'navigate.scheme_sahayak': {
                route: '/scheme-sahayak',
                message: 'Opening Scheme Sahayak',
            },
            'navigate.inventory': {
                route: '/dashboard/inventory',
                message: 'Opening your inventory',
            },
            'navigate.marketplace': {
                route: '/marketplace',
                message: 'Opening marketplace',
            },
            'navigate.global_bazaar': {
                route: '/marketplace',
                message: 'Opening Global Bazaar',
            },
            'navigate.buyer_connect': {
                route: '/buyer-connect',
                message: 'Opening Buyer Connect',
            },
            'navigate.trends': {
                route: '/trend-spotter',
                message: 'Showing market trends',
            },
            'navigate.trend_spotter': {
                route: '/trend-spotter',
                message: 'Opening Trend Spotter',
            },
            'navigate.finance': {
                route: '/finance/dashboard',
                message: 'Opening Finance Dashboard',
            },
            'navigate.digital_khata': {
                route: '/finance/dashboard',
                message: 'Opening Digital Khata',
            },
            'navigate.sales': {
                route: '/sales',
                message: 'Opening sales dashboard',
            },
            'navigate.profile': {
                route: '/profile',
                message: 'Opening your profile',
            },
            'navigate.cart': {
                route: '/marketplace/cart',
                message: 'Opening shopping cart',
            },
            'navigate.wishlist': {
                route: '/marketplace/wishlist',
                message: 'Opening wishlist',
            },
            'navigate.settings': {
                route: '/settings',
                message: 'Opening settings',
            },
            'navigate.back': {
                route: 'back',
                message: 'Going back',
            },
        };

        const routeInfo = routeMapping[intentName];

        if (!routeInfo) {
            return NextResponse.json({
                fulfillmentResponse: {
                    messages: [
                        {
                            text: {
                                text: ["I'm not sure where you want to go. Please try again."],
                            },
                        },
                    ],
                },
                sessionInfo: {
                    parameters: {
                        targetRoute: '/dashboard',
                        success: false,
                    },
                },
            });
        }

        // Return fulfillment response
        return NextResponse.json({
            fulfillmentResponse: {
                messages: [
                    {
                        text: {
                            text: [routeInfo.message],
                        },
                    },
                ],
            },
            sessionInfo: {
                parameters: {
                    targetRoute: routeInfo.route,
                    success: true,
                },
            },
        });
    } catch (error) {
        console.error('Dialogflow webhook error:', error);

        return NextResponse.json(
            {
                fulfillmentResponse: {
                    messages: [
                        {
                            text: {
                                text: ['Sorry, something went wrong. Please try again.'],
                            },
                        },
                    ],
                },
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
