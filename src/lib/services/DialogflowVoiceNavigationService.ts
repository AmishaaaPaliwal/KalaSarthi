/**
 * Dialogflow Voice Navigation Service
 * Integrates Google Dialogflow CX for enhanced voice navigation with better intent recognition
 */

import { SessionsClient } from '@google-cloud/dialogflow-cx';

export interface DialogflowConfig {
    projectId: string;
    location: string;
    agentId: string;
    languageCode: string;
}

export interface DialogflowIntent {
    intent: string;
    confidence: number;
    parameters: Record<string, any>;
    targetRoute?: string;
    fulfillmentText?: string;
}

export interface DialogflowResponse {
    success: boolean;
    intent?: DialogflowIntent;
    error?: string;
    sessionId: string;
}

export class DialogflowVoiceNavigationService {
    private static instance: DialogflowVoiceNavigationService;
    private client: SessionsClient | null = null;
    private config: DialogflowConfig;
    private sessionId: string;

    // Route mapping for navigation intents
    private readonly routeMapping: Record<string, string> = {
        'navigate.dashboard': '/dashboard',
        'navigate.profile': '/profile',
        'navigate.product_creator': '/smart-product-creator',
        'navigate.inventory': '/inventory',
        'navigate.marketplace': '/marketplace',
        'navigate.buyer_connect': '/buyer-connect',
        'navigate.schemes': '/scheme-sahayak',
        'navigate.trends': '/trend-spotter',
        'navigate.sales': '/sales',
        'navigate.orders': '/orders',
        'navigate.cart': '/marketplace/cart',
        'navigate.wishlist': '/marketplace/wishlist',
        'navigate.settings': '/settings',
        'navigate.help': '/help',
        'navigate.back': 'back',
    };

    private constructor() {
        this.config = {
            projectId: process.env.NEXT_PUBLIC_DIALOGFLOW_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'gen-lang-client-0314311341',
            location: process.env.NEXT_PUBLIC_DIALOGFLOW_LOCATION || 'us-central1',
            agentId: process.env.NEXT_PUBLIC_DIALOGFLOW_AGENT_ID || '',
            languageCode: 'en',
        };
        this.sessionId = this.generateSessionId();
    }

    public static getInstance(): DialogflowVoiceNavigationService {
        if (!DialogflowVoiceNavigationService.instance) {
            DialogflowVoiceNavigationService.instance = new DialogflowVoiceNavigationService();
        }
        return DialogflowVoiceNavigationService.instance;
    }

    /**
     * Initialize Dialogflow client
     */
    public async initialize(): Promise<void> {
        try {
            // Initialize Dialogflow CX client
            this.client = new SessionsClient({
                apiEndpoint: `${this.config.location}-dialogflow.googleapis.com`,
            });

            console.log('✅ Dialogflow Voice Navigation Service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Dialogflow client:', error);
            throw error;
        }
    }

    /**
     * Process voice input using Dialogflow
     */
    public async processVoiceInput(
        text: string,
        languageCode: string = 'en'
    ): Promise<DialogflowResponse> {
        try {
            if (!this.client) {
                await this.initialize();
            }

            if (!this.client) {
                throw new Error('Dialogflow client not initialized');
            }

            // Update language code
            this.config.languageCode = this.mapLanguageCode(languageCode);

            // Create session path
            const sessionPath = this.client.projectLocationAgentSessionPath(
                this.config.projectId,
                this.config.location,
                this.config.agentId,
                this.sessionId
            );

            // Prepare request
            const request = {
                session: sessionPath,
                queryInput: {
                    text: {
                        text: text,
                    },
                    languageCode: this.config.languageCode,
                },
            };

            // Detect intent
            const [response] = await this.client.detectIntent(request);

            // Extract intent information
            const queryResult = response.queryResult;

            if (!queryResult) {
                return {
                    success: false,
                    error: 'No query result from Dialogflow',
                    sessionId: this.sessionId,
                };
            }

            const intentName = queryResult.intent?.displayName || '';
            const confidence = queryResult.intentDetectionConfidence || 0;
            const parameters = this.extractParameters(queryResult.parameters);
            const fulfillmentText = queryResult.responseMessages?.[0]?.text?.text?.[0] || '';

            // Map intent to route
            const targetRoute = this.mapIntentToRoute(intentName, parameters);

            return {
                success: true,
                intent: {
                    intent: intentName,
                    confidence,
                    parameters,
                    targetRoute,
                    fulfillmentText,
                },
                sessionId: this.sessionId,
            };
        } catch (error) {
            console.error('Dialogflow intent detection error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                sessionId: this.sessionId,
            };
        }
    }

    /**
     * Map language code to Dialogflow format
     */
    private mapLanguageCode(languageCode: string): string {
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

    /**
     * Extract parameters from Dialogflow response
     */
    private extractParameters(parameters: any): Record<string, any> {
        if (!parameters || !parameters.fields) {
            return {};
        }

        const extracted: Record<string, any> = {};

        for (const [key, value] of Object.entries(parameters.fields)) {
            const field = value as any;

            if (field.stringValue) {
                extracted[key] = field.stringValue;
            } else if (field.numberValue !== undefined) {
                extracted[key] = field.numberValue;
            } else if (field.boolValue !== undefined) {
                extracted[key] = field.boolValue;
            } else if (field.listValue) {
                extracted[key] = field.listValue.values?.map((v: any) => v.stringValue || v.numberValue) || [];
            }
        }

        return extracted;
    }

    /**
     * Map Dialogflow intent to application route
     */
    private mapIntentToRoute(intentName: string, parameters: Record<string, any>): string {
        // Direct mapping
        if (this.routeMapping[intentName]) {
            return this.routeMapping[intentName];
        }

        // Handle parameterized routes
        if (parameters.feature) {
            const feature = parameters.feature.toLowerCase();
            const featureRoutes: Record<string, string> = {
                'dashboard': '/dashboard',
                'profile': '/profile',
                'product': '/smart-product-creator',
                'inventory': '/inventory',
                'marketplace': '/marketplace',
                'buyer': '/buyer-connect',
                'scheme': '/scheme-sahayak',
                'schemes': '/scheme-sahayak',
                'trend': '/trend-spotter',
                'trends': '/trend-spotter',
                'sales': '/sales',
                'orders': '/orders',
                'cart': '/marketplace/cart',
                'wishlist': '/marketplace/wishlist',
                'settings': '/settings',
                'help': '/help',
            };

            if (featureRoutes[feature]) {
                return featureRoutes[feature];
            }
        }

        // Default fallback
        return '/dashboard';
    }

    /**
     * Generate unique session ID
     */
    private generateSessionId(): string {
        return `voice-nav-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    /**
     * Reset session (useful for new conversation)
     */
    public resetSession(): void {
        this.sessionId = this.generateSessionId();
    }

    /**
     * Update language
     */
    public setLanguage(languageCode: string): void {
        this.config.languageCode = this.mapLanguageCode(languageCode);
    }

    /**
     * Get current session ID
     */
    public getSessionId(): string {
        return this.sessionId;
    }
}
