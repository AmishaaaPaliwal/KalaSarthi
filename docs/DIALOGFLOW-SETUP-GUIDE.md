# Dialogflow Voice Navigation Setup Guide

This guide will help you set up Google Dialogflow CX for enhanced voice navigation in Artisan Buddy.

## Prerequisites

- Google Cloud Project with Dialogflow API enabled
- Service account with Dialogflow API permissions
- Node.js project with `@google-cloud/dialogflow-cx` installed

## Step 1: Enable Dialogflow API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `gen-lang-client-0314311341` (or your project)
3. Navigate to **APIs & Services** > **Library**
4. Search for "Dialogflow API"
5. Click **Enable**

## Step 2: Create Dialogflow CX Agent

1. Go to [Dialogflow CX Console](https://dialogflow.cloud.google.com/cx)
2. Click **Create Agent**
3. Configure:
   - **Display Name**: Artisan Buddy Voice Navigator
   - **Location**: us-central1 (or your preferred region)
   - **Default Language**: English
   - **Time Zone**: Your timezone

## Step 3: Create Navigation Intents

Create the following intents in your Dialogflow agent:

### 1. navigate.dashboard
**Training Phrases:**
- go to dashboard
- open dashboard
- show dashboard
- take me to dashboard
- dashboard
- मुझे डैशबोर्ड दिखाओ
- डैशबोर्ड खोलो

### 2. navigate.product_creator
**Training Phrases:**
- go to product creator
- open product creator
- create product
- add new product
- product creator
- मुझे प्रोडक्ट क्रिएटर जाना है
- प्रोडक्ट बनाना है
- नया प्रोडक्ट जोड़ो

### 3. navigate.schemes
**Training Phrases:**
- show schemes
- government schemes
- tell me about schemes
- योजना दिखाओ
- सरकारी योजनाएं
- योजना के बारे में बताओ

### 4. navigate.inventory
**Training Phrases:**
- show inventory
- my inventory
- stock
- products
- इन्वेंटरी दिखाओ
- मेरा स्टॉक

### 5. navigate.marketplace
**Training Phrases:**
- go to marketplace
- open marketplace
- marketplace
- बाजार
- मार्केटप्लेस

### 6. navigate.buyer_connect
**Training Phrases:**
- buyer connect
- show buyers
- customer connections
- खरीदार
- ग्राहक कनेक्शन

### 7. navigate.trends
**Training Phrases:**
- show trends
- trending products
- market trends
- ट्रेंड दिखाओ
- बाजार के रुझान

### 8. navigate.sales
**Training Phrases:**
- show sales
- my sales
- sales data
- बिक्री दिखाओ
- मेरी बिक्री

### 9. navigate.profile
**Training Phrases:**
- my profile
- show profile
- profile settings
- मेरी प्रोफाइल
- प्रोफाइल दिखाओ

### 10. navigate.cart
**Training Phrases:**
- show cart
- my cart
- shopping cart
- कार्ट दिखाओ
- मेरी कार्ट

### 11. navigate.wishlist
**Training Phrases:**
- show wishlist
- my wishlist
- saved items
- विशलिस्ट
- पसंदीदा

### 12. navigate.back
**Training Phrases:**
- go back
- back
- previous page
- वापस जाओ
- पीछे

## Step 4: Add Multilingual Support

For each intent, add training phrases in multiple languages:

1. Click on the intent
2. Add training phrases in:
   - English
   - Hindi (हिंदी)
   - Bengali (বাংলা)
   - Tamil (தமிழ்)
   - Telugu (తెలుగు)
   - Marathi (मराठी)
   - Gujarati (ગુજરાતી)

## Step 5: Configure Fulfillment

For each intent, add fulfillment responses:

1. Click on the intent
2. Scroll to **Fulfillment**
3. Add response:
   - **Text Response**: "Navigating to [feature name]"
   - Example: "Navigating to Product Creator"

## Step 6: Get Agent Configuration

1. In Dialogflow CX Console, click on your agent
2. Click the **Settings** icon (⚙️)
3. Note down:
   - **Project ID**: `gen-lang-client-0314311341`
   - **Location**: `us-central1`
   - **Agent ID**: Found in the agent settings

## Step 7: Update Environment Variables

Add to your `.env` file:

```env
# Dialogflow Configuration
NEXT_PUBLIC_DIALOGFLOW_PROJECT_ID=gen-lang-client-0314311341
NEXT_PUBLIC_DIALOGFLOW_LOCATION=us-central1
NEXT_PUBLIC_DIALOGFLOW_AGENT_ID=your-agent-id-here
```

## Step 8: Test Voice Navigation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Click the microphone icon in the header

3. Try voice commands:
   - "Go to product creator"
   - "Show me schemes"
   - "Open dashboard"
   - "मुझे प्रोडक्ट क्रिएटर जाना है"

## Advanced Configuration

### Custom Parameters

Add parameters to intents for more specific navigation:

**Entity**: @feature
**Values**: dashboard, profile, inventory, marketplace, etc.

**Training Phrase**: "go to @feature"

### Context Management

Use contexts to maintain conversation state:

1. Create context: `navigation-context`
2. Set lifespan: 5
3. Use in follow-up intents

### Webhook Integration

For dynamic responses, set up webhook:

1. Create API endpoint: `/api/dialogflow/webhook`
2. Configure webhook URL in Dialogflow
3. Handle fulfillment in your API

## Troubleshooting

### Issue: "Dialogflow client not initialized"
**Solution**: Ensure service account credentials are properly configured in `google-credentials.json`

### Issue: "No intent detected"
**Solution**: 
- Add more training phrases
- Check language code matches
- Verify agent is deployed

### Issue: "Permission denied"
**Solution**: 
- Enable Dialogflow API in Google Cloud Console
- Grant service account Dialogflow API Admin role

### Issue: "Session expired"
**Solution**: Session automatically resets. If issues persist, call `resetSession()`

## Best Practices

1. **Add Diverse Training Phrases**: Include variations, typos, and colloquialisms
2. **Test in Multiple Languages**: Ensure Hindi and other Indian languages work
3. **Monitor Analytics**: Check Dialogflow console for unmatched queries
4. **Regular Updates**: Add new training phrases based on user feedback
5. **Fallback Intent**: Configure default fallback for unrecognized commands

## Resources

- [Dialogflow CX Documentation](https://cloud.google.com/dialogflow/cx/docs)
- [Dialogflow CX Console](https://dialogflow.cloud.google.com/cx)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Dialogflow API Reference](https://cloud.google.com/dialogflow/cx/docs/reference)

## Support

For issues or questions:
1. Check Dialogflow logs in Google Cloud Console
2. Review training phrases and intents
3. Test with Dialogflow simulator
4. Contact support if needed
