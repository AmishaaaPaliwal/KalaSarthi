'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Mic,
  Volume2,
  VolumeX,
  User,
  Bot,
  Loader2,
  Settings,
  History,
  Heart,
  Pause,
  Play,
  Wifi,
  WifiOff,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { SimpleOfflineAI } from '@/lib/services/SimpleOfflineAI';
import { useAuth } from '@/context/auth-context';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'image' | 'audio';
  imageUrl?: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestions?: string[];
  };
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

export default function ArtisanBuddyPage() {
  // Get authenticated user
  const { user, userProfile } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Online state
  const [isOnline, setIsOnline] = useState(true);

  // AI system state
  const [gemmaReady, setGemmaReady] = useState(false);
  const [gemmaLoading, setGemmaLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const [currentPlayingMessageId, setCurrentPlayingMessageId] = useState<string | null>(null);
  const [aiType, setAiType] = useState<'gemini_nano' | 'simple_offline' | 'browser_compatible' | null>(null);
  const gemmaServiceRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Back online - using Gemini 2.0 Flash');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Offline detected - automatically loading offline AI...');

      // Automatically load offline AI when going offline
      if (!gemmaReady && !gemmaLoading) {
        initializeGemma();
      }
    };

    // Set initial state based on navigator.onLine
    const initialOnlineState = navigator.onLine;
    setIsOnline(initialOnlineState);

    // If starting offline, automatically load offline AI
    if (!initialOnlineState && !gemmaReady && !gemmaLoading) {
      console.log('📴 Starting offline - automatically loading offline AI...');
      setTimeout(() => initializeGemma(), 1000); // Small delay to let component settle
    }

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize AI with fallback system
  const initializeGemma = async () => {
    if (gemmaServiceRef.current) return;

    try {
      setGemmaLoading(true);
      setLoadingProgress(0);
      setLoadingStage('Initializing AI...');
      console.log('🤖 Loading AI assistant with fallback system...');

      // Try Gemini Nano first (if available)
      let aiService = null;
      let aiType = 'fallback';

      try {
        setLoadingStage('Checking for Gemini Nano...');
        setLoadingProgress(20);

        // Check if Gemini Nano is available
        if ('ai' in window && 'languageModel' in (window as any).ai) {
          console.log('🚀 Gemini Nano detected, attempting to initialize...');
          setLoadingStage('Loading Gemini Nano...');
          setLoadingProgress(40);

          // Try to create Gemini Nano session
          const session = await (window as any).ai.languageModel.create({
            systemPrompt: 'You are an AI assistant helping Indian artisans and craftspeople with their business, marketing, and craft-related questions. Respond in the same language as the user (Hindi or English).'
          });

          if (session) {
            aiService = session;
            const currentAiType = 'gemini_nano';
            setAiType(currentAiType);
            console.log('✅ Gemini Nano initialized successfully!');
            setLoadingStage('Gemini Nano ready!');
            setLoadingProgress(80);
          }
        }
      } catch (nanoError) {
        console.log('⚠️ Gemini Nano not available:', nanoError);
      }

      // Fallback to our SimpleOfflineAI if Gemini Nano failed
      if (!aiService) {
        console.log('🔄 Falling back to SimpleOfflineAI...');
        setLoadingStage('Loading fallback AI...');
        setLoadingProgress(50);

        aiService = SimpleOfflineAI.getInstance();
        const currentAiType = 'simple_offline';
        setAiType(currentAiType);
        console.log('✅ SimpleOfflineAI initialized as fallback');
        setLoadingProgress(80);
      }

      // Final fallback to BrowserCompatibleOfflineAI
      if (!aiService) {
        console.log('🔄 Loading enhanced rule-based AI...');
        setLoadingStage('Loading enhanced AI...');
        setLoadingProgress(60);

        const { BrowserCompatibleOfflineAI } = await import('@/lib/services/BrowserCompatibleOfflineAI');
        aiService = BrowserCompatibleOfflineAI.getInstance();
        const currentAiType = 'browser_compatible';
        setAiType(currentAiType);
      }

      gemmaServiceRef.current = aiService;

      // Initialize based on AI type
      let success = true;
      let modelInfo = { modelId: 'Unknown', type: aiType || 'unknown' };
      const currentAiType = aiType;

      if (currentAiType === 'gemini_nano') {
        // Gemini Nano is already initialized
        setLoadingProgress(100);
        setLoadingStage('Gemini Nano Ready!');
        modelInfo = { modelId: 'Gemini Nano', type: 'Google AI' };
      } else if (currentAiType === 'simple_offline') {
        // SimpleOfflineAI doesn't need initialization
        setLoadingProgress(100);
        setLoadingStage('Simple AI Ready!');
        modelInfo = { modelId: 'SimpleOfflineAI', type: 'Cached + Fallback AI' };
      } else {
        // BrowserCompatibleOfflineAI needs initialization
        success = await gemmaServiceRef.current.initialize(
          (progress: number, stage: string) => {
            setLoadingProgress(Math.max(80, progress));
            setLoadingStage(stage);
          }
        );

        if (success) {
          modelInfo = gemmaServiceRef.current.getModelInfo();
        }
      }

      if (!success) {
        throw new Error('Failed to initialize AI model');
      }

      setGemmaReady(true);
      setLoadingProgress(100);
      setLoadingStage('Ready!');

      console.log('✅ AI system ready!', {
        aiType: currentAiType,
        modelId: modelInfo.modelId,
        type: modelInfo.type
      });

      // Add success notification message based on AI type
      let successContent = '';
      if (currentAiType === 'gemini_nano') {
        successContent = `🚀 **Gemini Nano Ready!**\n\nI'm now powered by Google's advanced on-device AI!\n\nमैं अब Google के एडवांस AI से powered हूँ!`;
      } else if (currentAiType === 'simple_offline') {
        successContent = `💾 **Smart AI Ready!**\n\nI can use cached responses and online AI when available!\n\nमैं cached responses और online AI का उपयोग कर सकता हूँ!`;
      } else {
        successContent = `✅ **Enhanced AI Ready!**\n\nI can now help you even without internet connection!\n\nआप अब बिना इंटरनेट के भी मुझसे बात कर सकते हैं।`;
      }

      const successMessage: Message = {
        id: 'ai-ready-' + Date.now(),
        content: successContent,
        sender: 'assistant',
        timestamp: new Date(),
        metadata: {
          intent: 'system_notification',
          suggestions: [
            'मेरे व्यापार की जानकारी दिखाएं',
            'नया उत्पाद बनाने में मदद करें',
            'Show my business analytics',
            'Help me create a new product'
          ]
        }
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error('❌ Offline AI initialization error:', error);

      // Even if initialization fails, we can still provide basic functionality
      setGemmaReady(true); // Set to true because our system always works

      const infoMessage: Message = {
        id: `ai-info-${Date.now()}`,
        content: '✅ **Offline Mode Ready!**\n\nI can help you even without internet!\n\n🎨 **I can help with:**\n• Business and financial advice\n• Product creation guidance\n• Marketing strategies\n• Government schemes\n\nआप हिंदी या English में पूछ सकते हैं।',
        sender: 'assistant',
        timestamp: new Date(),
        metadata: {
          intent: 'info_notification',
          suggestions: [
            'व्यापार की सलाह चाहिए',
            'नया प्रोडक्ट बनाना है',
            'Need business advice',
            'Help with marketing'
          ]
        }
      };
      setMessages(prev => [...prev, infoMessage]);
    } finally {
      setGemmaLoading(false);
      setLoadingProgress(0);
      setLoadingStage('');
    }
  };

  // Load saved messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('artisan-buddy-messages');
    const savedSessionId = localStorage.getItem('artisan-buddy-session-id');

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
        console.log('✅ Restored', messagesWithDates.length, 'messages from localStorage');
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
        // Initialize with welcome message if parsing fails
        initializeWelcomeMessage();
      }
    } else {
      // Initialize with welcome message if no saved messages
      initializeWelcomeMessage();
    }

    if (savedSessionId) {
      setCurrentSessionId(savedSessionId);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('artisan-buddy-messages', JSON.stringify(messages));
      console.log('💾 Saved', messages.length, 'messages to localStorage');
    }
  }, [messages]);

  // Save session ID to localStorage whenever it changes
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('artisan-buddy-session-id', currentSessionId);
    }
  }, [currentSessionId]);

  // Initialize with welcome message
  const initializeWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `🙏 नमस्ते! मैं आपका Artisan Buddy हूँ।

मैं आपकी शिल्पकारी, व्यापार, और डिजिटल खाता प्रबंधन में सहायता कर सकता हूँ।

---

Hello! I'm your Artisan Buddy. I can help you with crafts, business, and digital ledger management.

💬 आप मुझसे किसी भी भाषा में कुछ भी पूछ सकते हैं!
You can ask me anything in any language!`,
      sender: 'assistant',
      timestamp: new Date(),
      metadata: {
        suggestions: [
          'मेरे व्यापार की जानकारी दिखाएं',
          'नया उत्पाद बनाने में मदद करें',
          'Show my business analytics',
          'Help me create a new product'
        ]
      }
    };
    setMessages([welcomeMessage]);
  };

  // Browser TTS fallback function
  const playWithBrowserTTS = (text: string, messageId?: string) => {
    if ('speechSynthesis' in window) {
      try {
        speechSynthesis.cancel(); // Clear any existing speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        utterance.onstart = () => {
          console.log('🔊 Browser TTS started');
          setIsSpeaking(true);
          setIsPaused(false);
          if (messageId) setCurrentPlayingMessageId(messageId);
        };

        utterance.onend = () => {
          console.log('🔊 Browser TTS finished');
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentPlayingMessageId(null);
        };

        utterance.onerror = (e) => {
          const errorType = e?.error || 'Unknown TTS error';

          if (errorType === 'interrupted' || errorType === 'canceled') {
            console.log('🔊 Browser TTS interrupted (normal)');
          } else {
            console.warn('🔊 Browser TTS error:', errorType);
          }

          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentPlayingMessageId(null);
        };

        setTimeout(() => {
          speechSynthesis.speak(utterance);
        }, 100);

      } catch (error) {
        console.error('🔊 Browser TTS failed:', error);
        setIsSpeaking(false);
        setIsPaused(false);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim() || (selectedImage ? 'Sent an image' : ''),
      sender: 'user',
      timestamp: new Date(),
      type: selectedImage ? 'image' : 'text',
      imageUrl: imagePreview || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Store image data for API call
    const imageToSend = selectedImage;
    const imagePreviewToSend = imagePreview;

    // Clear image state
    removeImage();

    setIsLoading(true);

    try {
      let responseText = '';
      let isOfflineResponse = false;

      if (isOnline) {
        // Online - use Gemini 2.0 Flash API (prioritize online functionality)
        console.log('🌐 Using Gemini 2.0 Flash API');

        let response;

        if (imageToSend) {
          // Send multimodal request with image
          console.log('📸 Sending image with message');
          const formData = new FormData();
          formData.append('message', content || 'What can you tell me about this image?');
          formData.append('image', imageToSend);
          formData.append('sessionId', currentSessionId || '');

          response = await fetch('/api/artisan-buddy/vision', {
            method: 'POST',
            body: formData,
          });
        } else {
          // Determine userId
          const currentUserId = user?.uid || userProfile?.uid || 'demo-user';

          // Log for debugging
          console.log('🔐 Auth Status:', {
            hasUser: !!user,
            hasProfile: !!userProfile,
            userId: currentUserId,
            userEmail: user?.email || 'N/A'
          });

          // Send text-only request
          response = await fetch('/api/artisan-buddy/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: content,
              sessionId: currentSessionId,
              userId: currentUserId,
              context: {
                previousMessages: messages.slice(-5), // Last 5 messages for context
                userPreferences: {
                  language: 'auto-detect',
                  responseStyle: 'helpful'
                }
              }
            }),
          });
        }

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();
        responseText = data.response || 'मुझे खुशी होगी आपकी सहायता करने में। कृपया अपना प्रश्न दोबारा पूछें।';
      } else if (gemmaReady && gemmaServiceRef.current) {
        // Use available AI (Gemini Nano, SimpleOfflineAI, or BrowserCompatibleOfflineAI)
        console.log('🤖 Using available AI assistant');
        try {
          let aiResponse;

          // Check if it's Gemini Nano
          if (gemmaServiceRef.current.prompt) {
            // Gemini Nano API
            console.log('🚀 Using Gemini Nano');
            const response = await gemmaServiceRef.current.prompt(content);
            aiResponse = {
              text: response,
              intent: 'general',
              confidence: 0.95,
              processingTime: 0
            };
          } else if (gemmaServiceRef.current.getResponse) {
            // SimpleOfflineAI
            console.log('💾 Using SimpleOfflineAI');
            const response = await gemmaServiceRef.current.getResponse(content, {
              name: 'Artisan',
              language: 'auto-detect'
            });
            aiResponse = {
              text: response.text,
              intent: response.intent,
              confidence: response.confidence,
              processingTime: 0,
              source: response.source
            };
          } else {
            // BrowserCompatibleOfflineAI
            console.log('🧠 Using BrowserCompatibleOfflineAI');
            aiResponse = await gemmaServiceRef.current.generateResponse(
              content,
              {
                name: 'Artisan',
                language: 'auto-detect'
              }
            );
          }

          responseText = aiResponse.text;
          isOfflineResponse = true;

          console.log('✅ AI response generated:', {
            intent: aiResponse.intent,
            confidence: aiResponse.confidence,
            source: aiResponse.source || 'offline',
            processingTime: aiResponse.processingTime ? `${Math.round(aiResponse.processingTime)}ms` : 'N/A'
          });

          // Store suggestions for later use
          if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
            (window as any).tempSuggestions = aiResponse.suggestions;
          }
        } catch (error) {
          console.error('❌ AI error:', error);
          responseText = 'मुझे खुशी होगी आपकी सहायता करने में। कृपया अपना प्रश्न दोबारा पूछें।\n\nI\'m here to help you. Please rephrase your question and I\'ll do my best to assist.';
        }
      } else {
        // No AI available - provide helpful guidance with automatic loading
        const isOffline = !isOnline;
        const noOfflineAI = !gemmaReady;
        const isLoadingAI = gemmaLoading;

        if (isOffline && isLoadingAI) {
          responseText = `🔄 **Setting up offline mode...**\n\nProgress: ${Math.round(loadingProgress)}%\n\nI'm preparing my enhanced AI system to help you without internet connection.`;
        } else if (isOffline && noOfflineAI) {
          responseText = `🔌 **You're offline** - Activating offline mode...\n\nI'm setting up my enhanced AI assistant so I can help you without internet.\n\n🌐 **Alternative:** Connect to internet for full online features.`;

          // Trigger automatic loading if not already loading
          if (!gemmaLoading) {
            setTimeout(() => initializeGemma(), 500);
          }
        } else if (isOffline) {
          responseText = 'You appear to be offline. Let me activate offline mode...';
        } else {
          responseText = 'Please ensure you have an internet connection or wait for offline mode to activate.';
        }
      }

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        sender: 'assistant',
        timestamp: new Date(),
        metadata: {
          intent: isOfflineResponse ? 'offline_ai' : 'online_gemini',
          confidence: isOfflineResponse ? 0.8 : 0.9,
          suggestions: (window as any).tempSuggestions || undefined
        }
      };

      // Clear temporary suggestions
      delete (window as any).tempSuggestions;

      setMessages(prev => [...prev, assistantMessage]);

      // SMART TTS - Use Google Cloud TTS when online, browser TTS when offline
      if (assistantMessage.content) {
        try {
          console.log('🔊 Starting smart TTS for response');
          setIsSpeaking(true);
          setIsPaused(false);
          setCurrentPlayingMessageId(assistantMessage.id);

          if (isOnline) {
            // Online: Use Google Cloud TTS for high-quality voice
            console.log('🌐 Using Google Cloud TTS (high quality)');

            // Import and use Google Cloud TTS service
            const { GoogleCloudTTSService } = await import('@/lib/services/GoogleCloudTTSService');

            // Detect language for better voice selection
            const isHindi = /[\u0900-\u097F]/.test(assistantMessage.content);
            const languageCode = isHindi ? 'hi-IN' : 'en-IN';

            const ttsResult = await GoogleCloudTTSService.synthesizeSpeech(
              assistantMessage.content,
              {
                languageCode,
                gender: 'FEMALE',
                speakingRate: 0.9,
                pitch: 0.1,
                audioEncoding: 'MP3'
              }
            );

            if (ttsResult.success && ttsResult.audio) {
              console.log('✅ Google Cloud TTS synthesis successful');

              // Create audio element and play
              const audioUrl = GoogleCloudTTSService.createAudioUrl(
                ttsResult.audio.content,
                ttsResult.audio.mimeType
              );

              const audio = new Audio(audioUrl);
              currentAudioRef.current = audio;
              audio.muted = isMuted;

              audio.onplay = () => {
                console.log('🔊 Google TTS started playing');
                setIsSpeaking(true);
                setIsPaused(false);
              };

              audio.onended = () => {
                console.log('🔊 Google TTS finished playing');
                setIsSpeaking(false);
                setIsPaused(false);
                setCurrentPlayingMessageId(null);
                currentAudioRef.current = null;
              };

              audio.onerror = (e) => {
                console.warn('🔊 Google TTS playback error:', e);
                setIsSpeaking(false);
                setIsPaused(false);

                // Fallback to browser TTS
                playWithBrowserTTS(assistantMessage.content);
              };

              await audio.play();

            } else {
              console.warn('🔊 Google Cloud TTS failed, using browser fallback');
              playWithBrowserTTS(assistantMessage.content);
            }

          } else {
            // Offline: Use browser TTS
            console.log('🔌 Using browser TTS (offline mode)');
            playWithBrowserTTS(assistantMessage.content);
          }

        } catch (error) {
          console.error('🔊 Smart TTS failed:', error);
          setIsSpeaking(false);
          setIsPaused(false);

          // Ultimate fallback to browser TTS
          playWithBrowserTTS(assistantMessage.content);
        }
      }



    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'क्षमा करें, कुछ तकनीकी समस्या हुई है। कृपया दोबारा कोशिश करें।\n\nSorry, there was a technical issue. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Handle special suggestions for Gemma AI
    if (suggestion === 'Retry Loading Offline AI') {
      // Offline AI disabled for stability - show message instead
      const message: Message = {
        id: Date.now().toString(),
        content: 'Offline AI is temporarily disabled for stability. Please use online features.',
        sender: 'assistant',
        timestamp: new Date(),
        metadata: { intent: 'system_message' }
      };
      setMessages(prev => [...prev, message]);
      return;
    }
    if (suggestion === 'Continue with Online Only') {
      // Just acknowledge and continue
      const ackMessage: Message = {
        id: Date.now().toString(),
        content: 'Continuing with online-only mode. The offline AI will load automatically when you go offline.',
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, ackMessage]);
      return;
    }

    // Regular suggestion - send as message
    sendMessage(suggestion);
  };

  const startNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      lastMessage: '',
      timestamp: new Date(),
      messageCount: 0
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);

    // Clear messages and localStorage
    localStorage.removeItem('artisan-buddy-messages');
    localStorage.removeItem('artisan-buddy-session-id');
    initializeWelcomeMessage();
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      localStorage.removeItem('artisan-buddy-messages');
      localStorage.removeItem('artisan-buddy-session-id');
      setCurrentSessionId(null);
      initializeWelcomeMessage();
      console.log('🗑️ Chat history cleared');
    }
  };

  const togglePauseSpeech = () => {
    // Handle Google Cloud TTS audio
    if (currentAudioRef.current) {
      if (isPaused) {
        currentAudioRef.current.play();
        setIsPaused(false);
        console.log('🔊 Audio resumed');
      } else {
        currentAudioRef.current.pause();
        setIsPaused(true);
        console.log('🔊 Audio paused');
      }
      return;
    }

    // Handle browser TTS
    if ('speechSynthesis' in window) {
      if (isPaused) {
        speechSynthesis.resume();
        setIsPaused(false);
        console.log('🔊 TTS resumed');
      } else {
        speechSynthesis.pause();
        setIsPaused(true);
        console.log('🔊 TTS paused');
      }
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    // Handle Google Cloud TTS audio
    if (currentAudioRef.current) {
      currentAudioRef.current.muted = newMutedState;
      console.log(`🔊 Audio ${newMutedState ? 'muted' : 'unmuted'}`);
    }

    // Handle browser TTS
    if ('speechSynthesis' in window && isSpeaking) {
      if (newMutedState) {
        speechSynthesis.pause();
        console.log('🔊 TTS muted (paused)');
      } else if (isPaused) {
        // Don't resume if it was already paused by user
        console.log('🔊 TTS unmuted but staying paused');
      } else {
        speechSynthesis.resume();
        console.log('🔊 TTS unmuted (resumed)');
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Sidebar - Improved */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden backdrop-blur-sm border-r border-orange-200 shadow-lg`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-orange-800">Chat History</h2>
            <Button
              onClick={startNewSession}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600"
            >
              New Chat
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-120px)]">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`mb-2 cursor-pointer transition-colors ${currentSessionId === session.id ? 'bg-orange-100' : 'hover:bg-gray-50'
                  }`}
                onClick={() => setCurrentSessionId(session.id)}
              >
                <CardContent className="p-3">
                  <div className="font-medium text-sm truncate">{session.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {session.messageCount} messages • {formatTime(session.timestamp)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-[100vw]">
        {/* Header - Improved */}
        <div className="backdrop-blur-sm border-b border-orange-200 shadow-sm">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              {/* Left Section */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="h-9 w-9 p-0 flex-shrink-0"
                >
                  <History className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-base sm:text-lg lg:text-xl font-bold text-orange-800 truncate">
                      Artisan Buddy
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">
                      Your AI Craft & Business Assistant
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-wrap justify-end">
                {/* Clear Chat Button */}
                {messages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="h-9 px-2 sm:px-3 text-xs"
                    title="Clear chat history"
                  >
                    <X className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                )}

                {/* AI Type and Status */}
                {isOnline ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-2 py-1 hidden sm:flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    <span>Online</span>
                  </Badge>
                ) : gemmaReady ? (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-2 py-1 flex items-center gap-1">
                    {aiType === 'gemini_nano' && '🚀 Gemini Nano'}
                    {aiType === 'simple_offline' && '💾 Smart AI'}
                    {aiType === 'browser_compatible' && '🧠 Enhanced AI'}
                    {!aiType && '🤖 AI Ready'}
                  </Badge>
                ) : gemmaLoading ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="hidden sm:inline">Loading... {Math.round(loadingProgress)}%</span>
                      <span className="sm:hidden">{Math.round(loadingProgress)}%</span>
                    </Badge>
                    {loadingStage && (
                      <span className="text-xs text-gray-600 hidden md:inline truncate max-w-[150px]">
                        {loadingStage}
                      </span>
                    )}
                  </div>
                ) : (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs px-2 py-1 flex items-center gap-1">
                    <WifiOff className="h-3 w-3" />
                    <span className="hidden sm:inline">Loading AI...</span>
                  </Badge>
                )}

                {/* Voice Input Status */}
                {isListening && (
                  <Badge variant="default" className="bg-green-500 text-white animate-pulse text-xs px-2 py-1 flex items-center gap-1">
                    <Mic className="h-3 w-3" />
                    <span className="hidden sm:inline">Recording</span>
                  </Badge>
                )}



                {gemmaReady && gemmaServiceRef.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const status = gemmaServiceRef.current.getStatus();
                      const modelInfo = gemmaServiceRef.current.getModelInfo();

                      const statusMessage: Message = {
                        id: 'ai-status-' + Date.now(),
                        content: `**Gemini Nano Status:**
- Model: ${modelInfo.modelId}
- Type: ${modelInfo.type}
- Real AI: ${modelInfo.hasRealAI ? 'Yes' : 'Fallback Mode'}
- Status: ${status.isReady ? 'Ready' : 'Not Ready'}
- Capabilities: ${modelInfo.capabilities.join(', ')}
- Loading: ${status.isLoading ? 'Yes' : 'No'}
${status.loadError ? `- Error: ${status.loadError}` : ''}
${status.capabilities ? `- Browser Support: ${status.capabilities.available}` : ''}`,
                        sender: 'assistant',
                        timestamp: new Date(),
                        metadata: {
                          intent: 'status_info'
                        }
                      };
                      setMessages(prev => [...prev, statusMessage]);
                    }}
                    title="Show AI status information"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}

                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area - Improved */}
        <ScrollArea className="flex-1 px-3 sm:px-4 py-4">
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${message.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : 'bg-gradient-to-br from-orange-500 to-red-500'
                    }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm relative ${message.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : 'bg-white border border-orange-100'
                    }`}>
                    {/* Image if present */}
                    {message.imageUrl && (
                      <div className="mb-2">
                        <img
                          src={message.imageUrl}
                          alt="Uploaded"
                          className="rounded-lg max-w-full h-auto max-h-64 object-contain"
                        />
                      </div>
                    )}
                    <div className="text-sm sm:text-base leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 gap-2">
                      <div className={`text-[10px] sm:text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                        {formatTime(message.timestamp)}
                      </div>

                      {/* TTS Controls for AI responses - Play/Pause and Mute/Unmute */}
                      {message.sender === 'assistant' && message.content && (
                        <div className="flex items-center space-x-1">
                          {/* Play/Pause Toggle Button - Only works when this message is playing */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${currentPlayingMessageId === message.id && isSpeaking ? 'opacity-100 text-blue-600' : 'opacity-60 hover:opacity-100'}`}
                            onClick={async () => {
                              // If this message is currently playing, toggle pause/resume
                              if (currentPlayingMessageId === message.id && isSpeaking) {
                                togglePauseSpeech();
                                return;
                              }

                              // Otherwise, play this message
                              try {
                                console.log('🔊 Playing message:', message.id);
                                setIsSpeaking(true);
                                setIsPaused(false);
                                setIsMuted(false);
                                setCurrentPlayingMessageId(message.id);

                                if (isOnline) {
                                  // Use Google Cloud TTS
                                  const { GoogleCloudTTSService } = await import('@/lib/services/GoogleCloudTTSService');

                                  const isHindi = /[\u0900-\u097F]/.test(message.content);
                                  const languageCode = isHindi ? 'hi-IN' : 'en-IN';

                                  const ttsResult = await GoogleCloudTTSService.synthesizeSpeech(
                                    message.content,
                                    {
                                      languageCode,
                                      gender: 'FEMALE',
                                      speakingRate: 0.9,
                                      pitch: 0.1,
                                      audioEncoding: 'MP3'
                                    }
                                  );

                                  if (ttsResult.success && ttsResult.audio) {
                                    const audioUrl = GoogleCloudTTSService.createAudioUrl(
                                      ttsResult.audio.content,
                                      ttsResult.audio.mimeType
                                    );

                                    const audio = new Audio(audioUrl);
                                    currentAudioRef.current = audio;
                                    audio.muted = isMuted;

                                    audio.onended = () => {
                                      setIsSpeaking(false);
                                      setIsPaused(false);
                                      setCurrentPlayingMessageId(null);
                                      currentAudioRef.current = null;
                                    };

                                    await audio.play();
                                  } else {
                                    // Fallback to browser TTS
                                    playWithBrowserTTS(message.content, message.id);
                                  }
                                } else {
                                  // Use browser TTS
                                  playWithBrowserTTS(message.content, message.id);
                                }
                              } catch (error) {
                                console.error('TTS error:', error);
                                setIsSpeaking(false);
                                setIsPaused(false);
                                setCurrentPlayingMessageId(null);
                              }
                            }}
                            title={
                              currentPlayingMessageId === message.id && isSpeaking
                                ? isPaused ? "Resume" : "Pause"
                                : "Play message"
                            }
                          >
                            {currentPlayingMessageId === message.id && isSpeaking ? (
                              isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>

                          {/* Mute/Unmute Button - Works independently at any time */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${isMuted ? 'opacity-100 text-red-600' : 'opacity-60 hover:opacity-100'}`}
                            onClick={toggleMute}
                            title={isMuted ? "Unmute" : "Mute"}
                          >
                            {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Suggestions */}
                    {message.metadata?.suggestions && (
                      <div className="mt-3 space-y-1">
                        {message.metadata.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs mr-1 mb-1"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-sm">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white border border-orange-100 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area - Improved */}
        <div className="bg-white/95 backdrop-blur-sm border-t border-orange-200 shadow-lg">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="max-w-4xl mx-auto">
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded-lg max-h-32 object-contain border-2 border-orange-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message in any language..."
                    className="pr-20 h-11 sm:h-12 border-orange-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {/* Image Upload Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-orange-100 rounded-lg"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload image"
                    >
                      <ImageIcon className="h-4 w-4 text-orange-600" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    {/* Voice Input Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-orange-100 rounded-lg"
                      onClick={async () => {
                        try {
                          if (isListening) {
                            setIsListening(false);
                            return;
                          }

                          // BULLETPROOF Voice Recognition - No more "aborted" errors!
                          console.log('🎤 Starting BULLETPROOF voice recognition');
                          setIsListening(true);

                          // Use audio utilities for reliable recording
                          const { requestMicrophoneAccess, createMediaRecorder, stopAllTracks } = await import('@/lib/utils/audioUtils');

                          const stream = await requestMicrophoneAccess();
                          const mediaRecorder = createMediaRecorder(stream);

                          const audioChunks: Blob[] = [];

                          mediaRecorder.ondataavailable = (event) => {
                            if (event.data.size > 0) {
                              audioChunks.push(event.data);
                            }
                          };

                          mediaRecorder.onstop = async () => {
                            console.log('🎤 Recording complete, processing...');
                            setIsListening(false);

                            try {
                              const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

                              // Use Gemini STT API for most reliable transcription
                              const formData = new FormData();
                              formData.append('audio', audioBlob, 'recording.webm');
                              formData.append('language', 'en-US');

                              const response = await fetch('/api/stt/gemini', {
                                method: 'POST',
                                body: formData
                              });

                              if (response.ok) {
                                const result = await response.json();
                                if (result.success && result.result?.text) {
                                  console.log('✅ Gemini STT success:', result.result.text);
                                  setInputMessage(result.result.text);
                                  setTimeout(() => {
                                    sendMessage(result.result.text);
                                  }, 100);
                                } else {
                                  throw new Error(result.error || 'No transcript received');
                                }
                              } else {
                                throw new Error('Gemini STT API failed');
                              }
                            } catch (error) {
                              console.error('❌ Voice processing failed:', error);
                              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                              alert(`Voice processing failed: ${errorMsg}. Please type your message.`);
                            }

                            stopAllTracks(stream);
                          };

                          mediaRecorder.onerror = (event) => {
                            console.error('❌ MediaRecorder error:', event);
                            setIsListening(false);
                            alert('Recording failed. Please try again.');
                            stopAllTracks(stream);
                          };

                          mediaRecorder.start();
                          console.log('🎤 Recording started - speak now!');

                          // Auto-stop after 10 seconds
                          setTimeout(() => {
                            if (mediaRecorder.state === 'recording') {
                              mediaRecorder.stop();
                            }
                          }, 10000);

                        } catch (error) {
                          console.error('❌ Voice setup failed:', error);
                          setIsListening(false);

                          let errorMessage = "Voice input failed.";
                          if (error instanceof Error) {
                            if (error.name === 'NotAllowedError') {
                              errorMessage = "Microphone access denied. Please allow microphone access and try again.";
                            } else if (error.name === 'NotFoundError') {
                              errorMessage = "Microphone not found. Please connect a microphone and try again.";
                            } else {
                              errorMessage = `Voice input failed: ${error.message}`;
                            }
                          }
                          alert(errorMessage);
                        }
                      }}
                      title={isListening ? "Recording... Click to stop" : "Click to start voice input"}
                    >
                      {isListening ? (
                        <div className="relative">
                          <Mic className="h-4 w-4 text-red-500 animate-pulse" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                        </div>
                      ) : (
                        <div className="relative">
                          <Mic className="h-4 w-4 text-green-600" />
                          <div className="absolute -bottom-1 -right-1 text-xs font-bold text-green-600">✓</div>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="h-11 sm:h-12 w-11 sm:w-12 p-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl shadow-md hover:shadow-lg transition-all flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>

              {/* Footer Info */}
              <div className="flex items-center justify-center mt-3 text-[10px] sm:text-xs text-gray-500 flex-wrap gap-1">
                <span className="hidden sm:inline">Powered by AI • Supports Any Language •</span>
                <span className="sm:hidden">AI Powered •</span>
                <Heart className="h-3 w-3 text-red-400 mx-0.5" />
                <span>Made for Indian Artisans</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}