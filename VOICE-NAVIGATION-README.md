# 🎤 Voice Navigation Feature

Enhanced voice navigation for Artisan Buddy using Google Dialogflow CX API.

## Quick Start

### For Users
1. Click the microphone icon (🎤) in the header
2. Speak your command: "go to product creator" or "मुझे प्रोडक्ट क्रिएटर जाना है"
3. Wait for navigation

**See**: [User Guide](./docs/VOICE-NAVIGATION-USER-GUIDE.md)

### For Developers

#### Test the Feature
```bash
# Start development server
npm run dev

# Test Dialogflow service (optional)
npm run test:voice
```

#### Setup Dialogflow (Optional)
The feature works without Dialogflow using AI fallback, but Dialogflow provides better accuracy.

1. Enable Dialogflow API in Google Cloud Console
2. Create Dialogflow CX agent
3. Add agent ID to `.env`:
   ```env
   NEXT_PUBLIC_DIALOGFLOW_AGENT_ID=your-agent-id
   ```

**See**: [Setup Guide](./docs/DIALOGFLOW-SETUP-GUIDE.md)

## Features

✅ **Natural Language Understanding**: Understands variations and natural speech
✅ **Multilingual Support**: Works in 12+ languages including Hindi, Bengali, Tamil
✅ **3-Tier Intelligence**: Dialogflow → Semantic AI → Pattern Matching
✅ **Real-time Feedback**: Visual and audio feedback during processing
✅ **Performance Optimized**: Intent caching, lazy loading, audio caching
✅ **Graceful Fallbacks**: Works even if Dialogflow is not configured

## Supported Commands

### English
- "Go to dashboard"
- "Open product creator"
- "Show schemes"
- "Show inventory"
- "Open marketplace"
- "Show trends"
- "My profile"
- "Show cart"
- "Go back"

### Hindi (हिंदी)
- "डैशबोर्ड खोलो"
- "प्रोडक्ट क्रिएटर खोलो"
- "योजना दिखाओ"
- "इन्वेंटरी दिखाओ"
- "बाजार खोलो"
- "ट्रेंड दिखाओ"
- "मेरी प्रोफाइल"
- "कार्ट दिखाओ"
- "वापस जाओ"

## Architecture

```
Voice Input → Speech-to-Text → Intent Detection → Route Mapping → Navigation
                                       ↓
                              ┌────────┴────────┐
                              │                 │
                         Dialogflow      Semantic AI
                         (Primary)       (Fallback)
                              │                 │
                              └────────┬────────┘
                                       ↓
                                Pattern Match
                                (Final Fallback)
```

## Files Created

### Core Implementation
- `src/lib/services/DialogflowVoiceNavigationService.ts` - Dialogflow integration
- `src/components/global-voice-navigation.tsx` - Enhanced component (updated)
- `src/app/api/dialogflow/webhook/route.ts` - Webhook endpoint

### Documentation
- `docs/DIALOGFLOW-SETUP-GUIDE.md` - Complete setup instructions
- `docs/VOICE-NAVIGATION-QUICK-START.md` - Quick start guide
- `docs/VOICE-NAVIGATION-USER-GUIDE.md` - User-friendly guide
- `DIALOGFLOW-VOICE-NAVIGATION-IMPLEMENTATION.md` - Technical summary

### Testing
- `scripts/test-dialogflow-voice.ts` - Test script

## Configuration

### Required (Already Configured)
```env
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_CLOUD_PROJECT=gen-lang-client-0314311341
```

### Optional (For Dialogflow)
```env
NEXT_PUBLIC_DIALOGFLOW_PROJECT_ID=gen-lang-client-0314311341
NEXT_PUBLIC_DIALOGFLOW_LOCATION=us-central1
NEXT_PUBLIC_DIALOGFLOW_AGENT_ID=your-agent-id-here
```

## How It Works

1. **User clicks microphone** → Requests microphone access
2. **User speaks** → Browser captures audio
3. **Speech-to-Text** → Converts audio to text (Gemini or Browser API)
4. **Intent Detection** → Understands command (Dialogflow → AI → Pattern)
5. **Route Mapping** → Maps intent to app route
6. **Navigation** → Navigates to target page
7. **Feedback** → Provides audio and visual confirmation

## Performance

- **Intent Caching**: 30-minute cache for repeated commands
- **Lazy Loading**: Services load on-demand
- **Audio Caching**: Faster TTS playback
- **Analytics**: Tracks usage and performance

## Browser Support

✅ Chrome (Recommended)
✅ Edge
✅ Safari
✅ Mobile browsers
❌ Firefox (limited speech API support)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Microphone access denied | Allow in browser settings |
| No speech detected | Speak louder, check microphone |
| Command not recognized | Use simpler phrases, check language |
| Not working | Update browser, check internet |

## Testing Checklist

- [ ] Microphone access works
- [ ] Voice level indicator shows
- [ ] English commands work
- [ ] Hindi commands work
- [ ] Navigation happens correctly
- [ ] Audio feedback plays
- [ ] Error handling works
- [ ] Fallback services work

## Resources

### Documentation
- [Setup Guide](./docs/DIALOGFLOW-SETUP-GUIDE.md) - Dialogflow configuration
- [Quick Start](./docs/VOICE-NAVIGATION-QUICK-START.md) - Get started in 5 minutes
- [User Guide](./docs/VOICE-NAVIGATION-USER-GUIDE.md) - For end users
- [Implementation](./DIALOGFLOW-VOICE-NAVIGATION-IMPLEMENTATION.md) - Technical details

### External
- [Dialogflow CX Docs](https://cloud.google.com/dialogflow/cx/docs)
- [Dialogflow Console](https://dialogflow.cloud.google.com/cx)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

For issues:
1. Check browser console for errors
2. Review documentation guides
3. Test with different commands
4. Verify microphone permissions
5. Check API credentials

## Next Steps

### For Immediate Use
1. Test with existing commands
2. Try in different languages
3. Share with team for feedback

### For Production
1. Create Dialogflow agent (optional but recommended)
2. Add more training phrases
3. Monitor analytics
4. Optimize based on usage

### For Enhancement
1. Add more navigation intents
2. Implement action commands
3. Add conversational context
4. Enable voice search

## Summary

✅ **Ready to Use**: Works immediately with AI fallback
✅ **Multilingual**: Supports 12+ languages
✅ **Intelligent**: 3-tier system for best accuracy
✅ **Optimized**: Fast and efficient
✅ **Documented**: Comprehensive guides included

---

**Start using voice navigation now!** Click the microphone icon and say "go to dashboard" 🎤✨
