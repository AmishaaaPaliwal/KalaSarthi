# Voice Navigation Quick Start Guide

Get started with enhanced voice navigation using Dialogflow in Artisan Buddy.

## Quick Setup (5 minutes)

### 1. Enable Dialogflow API

```bash
# Using gcloud CLI (if installed)
gcloud services enable dialogflow.googleapis.com --project=gen-lang-client-0314311341
```

Or manually:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Dialogflow API"

### 2. Create Dialogflow Agent (Optional)

If you want to use Dialogflow (recommended for better accuracy):

1. Go to [Dialogflow CX Console](https://dialogflow.cloud.google.com/cx)
2. Create a new agent: "Artisan Buddy Voice Navigator"
3. Copy the Agent ID from settings
4. Add to `.env`:
   ```env
   NEXT_PUBLIC_DIALOGFLOW_AGENT_ID=your-agent-id-here
   ```

**Note**: Voice navigation will work without Dialogflow using the built-in semantic service as fallback.

### 3. Test Voice Navigation

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser

3. Click the microphone icon in the header

4. Try these commands:

## Voice Commands

### English Commands

| Command | Action |
|---------|--------|
| "Go to dashboard" | Opens dashboard |
| "Open product creator" | Opens product creator |
| "Show schemes" | Opens scheme sahayak |
| "Show inventory" | Opens inventory |
| "Open marketplace" | Opens marketplace |
| "Show trends" | Opens trend spotter |
| "My profile" | Opens profile |
| "Show cart" | Opens shopping cart |
| "Show wishlist" | Opens wishlist |
| "Go back" | Goes to previous page |

### Hindi Commands (हिंदी)

| Command | Action |
|---------|--------|
| "मुझे डैशबोर्ड दिखाओ" | Opens dashboard |
| "प्रोडक्ट क्रिएटर खोलो" | Opens product creator |
| "योजना दिखाओ" | Opens scheme sahayak |
| "इन्वेंटरी दिखाओ" | Opens inventory |
| "बाजार खोलो" | Opens marketplace |
| "ट्रेंड दिखाओ" | Opens trend spotter |
| "मेरी प्रोफाइल" | Opens profile |
| "कार्ट दिखाओ" | Opens shopping cart |
| "वापस जाओ" | Goes to previous page |

### Natural Language Examples

The system understands natural variations:

- "I want to go to product creator"
- "Take me to the dashboard"
- "Can you show me the schemes?"
- "मुझे प्रोडक्ट बनाना है"
- "योजना के बारे में बताओ"

## How It Works

### 3-Tier Intelligence System

1. **Dialogflow CX** (Primary)
   - Best accuracy for trained phrases
   - Supports 30+ languages
   - Handles complex intents

2. **Semantic AI Service** (Fallback)
   - Uses Gemini AI for understanding
   - Handles untrained phrases
   - Context-aware navigation

3. **Pattern Matching** (Final Fallback)
   - Fast keyword-based matching
   - Works offline
   - Cached responses

### Voice Flow

```
User speaks → Speech-to-Text → Dialogflow → Route Mapping → Navigation
                                    ↓ (if fails)
                              Semantic AI Service
                                    ↓ (if fails)
                              Pattern Matching
```

## Features

### Real-Time Feedback

- **Voice Level Indicator**: Shows microphone input level
- **Voice Detection**: Visual feedback when voice is detected
- **Confidence Score**: Shows recognition confidence
- **Processing Status**: Real-time processing updates

### Multilingual Support

Supports all Indian languages:
- Hindi (हिंदी)
- Bengali (বাংলা)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)

### Performance Optimization

- **Intent Caching**: Instant response for repeated commands
- **Lazy Loading**: Services load on-demand
- **Audio Feedback Caching**: Faster TTS responses
- **Analytics Tracking**: Monitor usage and performance

## Troubleshooting

### "Microphone access denied"
**Solution**: Allow microphone access in browser settings

### "No speech detected"
**Solution**: 
- Speak louder or closer to microphone
- Check microphone is working
- Try in a quieter environment

### "Voice navigation not supported"
**Solution**: 
- Use Chrome, Edge, or Safari
- Update browser to latest version
- Check HTTPS connection

### "Intent not recognized"
**Solution**:
- Speak more clearly
- Use simpler phrases
- Try alternative commands
- Check language setting matches your speech

## Advanced Usage

### Custom Commands

To add custom commands, update the route mapping in:
`src/lib/services/DialogflowVoiceNavigationService.ts`

```typescript
private readonly routeMapping: Record<string, string> = {
  'navigate.custom_feature': '/custom-route',
  // Add more mappings
};
```

### Analytics

View voice navigation analytics:
```typescript
import { VoiceNavigationAnalytics } from '@/lib/services/VoiceNavigationAnalytics';

const analytics = VoiceNavigationAnalytics.getInstance();
const report = analytics.generateReport();
console.log(report);
```

### Performance Monitoring

Monitor performance:
```typescript
import { VoiceNavigationPerformanceMonitor } from '@/lib/services/VoiceNavigationAnalytics';

const monitor = VoiceNavigationPerformanceMonitor.getInstance();
const metrics = monitor.getMetrics();
console.log(metrics);
```

## Best Practices

1. **Speak Clearly**: Enunciate words clearly
2. **Use Natural Language**: Speak naturally, not robotically
3. **Wait for Feedback**: Wait for visual confirmation before speaking again
4. **Quiet Environment**: Use in a quiet place for best results
5. **Check Language**: Ensure language setting matches your speech

## Testing Checklist

- [ ] Microphone access granted
- [ ] Voice level indicator shows activity
- [ ] English commands work
- [ ] Hindi commands work
- [ ] Navigation happens correctly
- [ ] Audio feedback plays
- [ ] Error handling works
- [ ] Multiple languages tested

## Next Steps

1. **Add More Training Phrases**: Improve Dialogflow agent
2. **Test Edge Cases**: Try unusual commands
3. **Monitor Analytics**: Check usage patterns
4. **Optimize Performance**: Review metrics
5. **User Feedback**: Collect user experiences

## Resources

- [Full Dialogflow Setup Guide](./DIALOGFLOW-SETUP-GUIDE.md)
- [Voice Navigation Architecture](./COMPLETE-SYSTEM-ARCHITECTURE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING-INVENTORY.md)

## Support

For issues:
1. Check browser console for errors
2. Review Dialogflow logs
3. Test with different commands
4. Check microphone permissions
5. Verify API credentials

---

**Pro Tip**: The system learns from usage. The more you use it, the better it gets with cached responses!
