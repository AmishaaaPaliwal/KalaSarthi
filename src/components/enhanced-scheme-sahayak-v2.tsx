'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOffline } from '@/hooks/use-offline';
import { notificationManager, notifySyncComplete } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';
import { CategorySelector } from '@/components/scheme-sahayak/CategorySelector';
import { SchemeComparison } from '@/components/scheme-sahayak/SchemeComparison';
import { CategoryType, Scheme } from '@/types/artisan-categories';
import { filterSchemesByCategory, calculateCategoryCounts } from '@/lib/artisan-categories';
import {
  Brain,
  FileCheck,
  Smartphone,
  Bell,
  Zap,
  Target,
  CheckCircle,
  AlertTriangle,
  Clock,
  Upload,
  Download,
  Eye,
  WifiOff,
  TrendingUp,
  Wifi,
  RefreshCw,
  GitCompare
} from 'lucide-react';

interface EnhancedSchemeSahayakV2Props {
  artisanId?: string;
  className?: string;
}

export function EnhancedSchemeSahayakV2({
  artisanId = 'demo_artisan_v2',
  className = ''
}: EnhancedSchemeSahayakV2Props) {
  const [activeTab, setActiveTab] = useState('ai-recommendations');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for different features
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [documentStatus, setDocumentStatus] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Category filtering state
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Comparison selection state
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  // Offline support
  const {
    isOnline,
    isSyncing,
    storeOffline,
    getOfflineData,
    sync,
  } = useOffline();

  // Track previous online state
  const previousOnlineState = useRef(isOnline);
  const { toast } = useToast();

  // Request notification permission on mount
  useEffect(() => {
    if (notificationManager.isSupported() && notificationManager.getPermission() === 'default') {
      setTimeout(() => {
        notificationManager.requestPermission();
      }, 3000);
    }
  }, []);

  // Detect connection restoration
  useEffect(() => {
    if (!previousOnlineState.current && isOnline) {
      if (notificationManager.getPermission() === 'granted') {
        notificationManager.notifyConnectionRestored();
      }
      toast({
        title: "Connection Restored",
        description: "You're back online! Refreshing scheme data...",
      });
      loadAIRecommendations();
      loadDocumentStatus();
      loadNotifications();
    }
    previousOnlineState.current = isOnline;
  }, [isOnline]);

  // Load AI recommendations with category filtering support
  const loadAIRecommendations = async (retryAttempt: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      setCategoryError(null);

      if (isOnline) {
        // Fetch from API when online
        const categoryParam = selectedCategories.length > 0 
          ? `&categories=${selectedCategories.join(',')}` 
          : '';
        
        const response = await fetch(
          `/api/enhanced-schemes-v2?action=ai_recommendations&artisanId=${artisanId}&riskTolerance=medium&timeHorizon=short_term&maxApplications=5${categoryParam}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();

        if (result.success) {
          setAiRecommendations(result.data.recommendations);
          setRetryCount(0); // Reset retry count on success

          // Cache recommendations for offline use
          for (const rec of result.data.recommendations) {
            await storeOffline('product', rec, rec.scheme.id, true);
          }

          // Automatically send WhatsApp notification for top 3 schemes (disabled for now)
          // if (result.data.recommendations.length > 0) {
          //   const topSchemes = result.data.recommendations.slice(0, 3);
          //   topSchemes.forEach((scheme: any, index: number) => {
          //     setTimeout(() => sendSchemeNotification(scheme), index * 2000);
          //   });
          // }
        } else {
          throw new Error(result.error || 'Failed to load schemes');
        }
      } else {
        // Load from offline storage when offline
        const offlineSchemes = await getOfflineData('product') as any[];

        if (offlineSchemes.length > 0) {
          // Apply category filtering to cached schemes using the filterSchemesByCategory function
          const filteredSchemes = filterSchemesByCategory(
            offlineSchemes.map((rec: any) => ({
              ...rec,
              id: rec.scheme?.id || rec.id,
              categories: rec.scheme?.categories || []
            })),
            selectedCategories
          );
          
          setAiRecommendations(filteredSchemes);
          toast({
            title: "Working Offline",
            description: `Showing ${filteredSchemes.length} cached scheme recommendations.`,
            duration: 5000,
          });
        } else {
          setCategoryError('No offline data available');
          toast({
            title: "No Offline Data",
            description: "Please connect to the internet to load schemes.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error('Error loading AI recommendations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      // Fallback to offline data on error
      try {
        const offlineSchemes = await getOfflineData('product') as any[];
        if (offlineSchemes.length > 0) {
          // Apply category filtering to cached schemes using the filterSchemesByCategory function
          const filteredSchemes = filterSchemesByCategory(
            offlineSchemes.map((rec: any) => ({
              ...rec,
              id: rec.scheme?.id || rec.id,
              categories: rec.scheme?.categories || []
            })),
            selectedCategories
          );
          
          setAiRecommendations(filteredSchemes);
          
          const lastSync = await getOfflineData('product').then((data: any) => {
            if (Array.isArray(data) && data.length > 0) {
              return new Date(data[0].timestamp).toLocaleString();
            }
            return 'Unknown';
          });
          
          setCategoryError(`Unable to load latest schemes. Showing cached data from ${lastSync}`);
          
          toast({
            title: "Using Cached Data",
            description: "Couldn't reach server. Showing cached schemes.",
            variant: "destructive",
          });
        } else {
          setCategoryError(errorMessage);
          setError('Failed to load schemes');
        }
      } catch (offlineError) {
        console.error('Error loading offline schemes:', offlineError);
        setCategoryError('Failed to load schemes from cache');
        setError('Failed to load schemes');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Retry loading schemes
  const retryLoadSchemes = async () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    await loadAIRecommendations(newRetryCount);
  };
  
  // Toggle scheme selection for comparison
  const toggleSchemeForComparison = (schemeId: string) => {
    setSelectedForComparison(prev => {
      const newSet = new Set(prev);
      if (newSet.has(schemeId)) {
        newSet.delete(schemeId);
      } else {
        // Limit to 4 schemes for comparison
        if (newSet.size >= 4) {
          toast({
            title: "Maximum Reached",
            description: "You can compare up to 4 schemes at a time.",
            variant: "destructive",
          });
          return prev;
        }
        newSet.add(schemeId);
      }
      return newSet;
    });
  };
  
  // Get schemes selected for comparison
  const getSchemesForComparison = (): Scheme[] => {
    return aiRecommendations
      .filter(rec => selectedForComparison.has(rec.scheme.id))
      .map(rec => rec.scheme);
  };
  
  // Open comparison modal
  const openComparison = () => {
    const schemes = getSchemesForComparison();
    if (schemes.length < 2) {
      toast({
        title: "Select More Schemes",
        description: "Please select at least 2 schemes to compare.",
        variant: "destructive",
      });
      return;
    }
    setShowComparison(true);
  };
  
  // Close comparison modal
  const closeComparison = () => {
    setShowComparison(false);
  };
  
  // Clear comparison selection
  const clearComparisonSelection = () => {
    setSelectedForComparison(new Set());
  };

  // Send WhatsApp notification for a scheme
  const sendSchemeNotification = async (recommendation: any) => {
    if (!isOnline) {
      console.log('Offline: Skipping WhatsApp notification');
      return;
    }

    try {
      const urgencyEmoji = recommendation.aiScore >= 90 ? '🔥' : recommendation.aiScore >= 85 ? '⚡' : '💡';
      const urgencyText = recommendation.aiScore >= 90
        ? '\n\n⏰ *Limited time opportunity!* Apply soon for best results.'
        : '\n\nYour profile matches perfectly with this scheme.';

      const message = `${urgencyEmoji} *New Scheme Alert!*

*${recommendation.scheme.title}* is now available for you!

✅ AI Match Score: ${recommendation.aiScore}%
📊 Success Probability: ${recommendation.actionPlan.successProbability}%
💰 ${recommendation.personalizedReason}${urgencyText}

🔗 Apply Now: ${recommendation.scheme.applicationUrl}`;

      const response = await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+918630365222',
          message,
          schemeUrl: recommendation.scheme.applicationUrl,
          notificationType: 'new_scheme'
        })
      });

      const result = await response.json();
      console.log('WhatsApp notification sent:', result);
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
    }
  };

  // Send WhatsApp notification for document upload
  const sendDocumentUploadNotification = async (fileName: string, documentType: string) => {
    if (!isOnline) {
      console.log('Offline: Skipping WhatsApp notification');
      return;
    }

    try {
      const message = `📄 *Document Uploaded Successfully!*

Your *${documentType.replace('_', ' ')}* has been uploaded and verified.

✅ File: ${fileName}
🤖 AI is now analyzing this document to improve your scheme recommendations
📊 Your eligibility scores will be updated shortly

Next Steps:
1. Upload remaining documents for better matching
2. Check AI Recommendations tab for updated schemes
3. Apply to schemes with higher success probability

🔗 View Dashboard: ${window.location.origin}/scheme-sahayak`;

      const response = await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+918630365222',
          message,
          notificationType: 'document_reminder'
        })
      });

      const result = await response.json();
      console.log('Document upload notification sent:', result);
    } catch (error) {
      console.error('Failed to send document upload notification:', error);
    }
  };

  // Load document management
  const loadDocumentStatus = async () => {
    try {
      const response = await fetch(
        `/api/enhanced-schemes-v2?action=document_management&artisanId=${artisanId}`
      );
      const result = await response.json();

      if (result.success) {
        setDocumentStatus(result.data);
      }
    } catch (err) {
      console.error('Error loading document status:', err);
    }
  };

  // Load smart notifications
  const loadNotifications = async () => {
    try {
      const response = await fetch(
        `/api/enhanced-schemes-v2?action=smart_notifications&artisanId=${artisanId}`
      );
      const result = await response.json();

      if (result.success) {
        setNotifications(result.data.notifications);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  useEffect(() => {
    loadAIRecommendations();
    loadDocumentStatus();
    loadNotifications();
  }, []);

  // Reload schemes when category selection changes
  useEffect(() => {
    if (activeTab === 'ai-recommendations') {
      loadAIRecommendations();
    }
  }, [selectedCategories]);

  // Handle document upload with OCR
  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isOnline) {
      toast({
        title: "Offline Mode",
        description: "Document upload requires an internet connection.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingDocument(true);
      setUploadProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('artisanId', artisanId);
      formData.append('documentType', 'auto-detect'); // Let OCR detect the type

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/scheme-sahayak/documents', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response. Please check your configuration.');
      }

      const result = await response.json();

      if (result.success) {
        // Reload document status to show the new document
        await loadDocumentStatus();
        setError(null);

        // Show detailed success message with next steps
        const ocrData = result.data.ocrData;
        const nextSteps = [
          '✓ Document verified and added to your profile',
          '✓ AI will now use this for better scheme matching',
          '→ Next: Upload remaining documents for higher approval rates'
        ].join('\n');

        alert(`✅ Document Uploaded Successfully!\n\n` +
          `📄 File: ${file.name}\n` +
          `📋 Type: ${ocrData.documentType}\n` +
          `🎯 Confidence: ${(ocrData.confidence * 100).toFixed(0)}%\n` +
          `✓ Status: ${result.data.verificationStatus}\n\n` +
          `Next Steps:\n${nextSteps}`);

        // Send WhatsApp notification about document upload
        sendDocumentUploadNotification(file.name, ocrData.documentType);
      } else {
        setError(result.error || 'Failed to upload document');
      }
    } catch (err: any) {
      console.error('Document upload error:', err);
      setError(err.message || 'Failed to upload document. Please ensure Google Cloud credentials are configured.');
    } finally {
      setUploadingDocument(false);
      setUploadProgress(0);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 md:space-y-6 ${className}`}>
      {/* Offline/Online Indicator and Sync */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Badge variant="outline" className="gap-1 border-green-200 text-green-700 bg-green-50">
              <Wifi className="h-3 w-3" />
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 border-red-200 text-red-700 bg-red-50">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
        </div>

        {/* Sync Button */}
        {isOnline && (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              const result = await sync();
              if (result) {
                toast({
                  title: "Sync Complete",
                  description: "All data synchronized successfully.",
                });

                if (notificationManager.getPermission() === 'granted') {
                  await notifySyncComplete(result.synced || 0);
                }
              }
            }}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <WifiOff className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You're working offline. Showing cached scheme data. Some features require an internet connection.
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Header - Mobile Responsive */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-3 md:gap-4">
              <Brain className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-600 flex-shrink-0" />
              <span className="leading-tight">AI-Powered Scheme Sahayak</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2 md:mt-3 ml-11 sm:ml-14 md:ml-16">
              Next-generation government scheme discovery with artificial intelligence
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm px-3 py-1.5">
              <Zap className="h-4 w-4" />
              AI-Enhanced
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 bg-green-50 text-green-700 text-sm px-3 py-1.5">
              <Target className="h-4 w-4" />
              95% Accuracy
            </Badge>
          </div>
        </div>
        
        {/* Karigar Helpline - Prominent Display */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900">Need Help?</p>
                <p className="text-xs text-orange-700">Karigar Helpline (Toll-Free)</p>
              </div>
            </div>
            <div className="flex-1 sm:text-right">
              <a 
                href="tel:18001800224" 
                className="inline-flex items-center gap-2 text-2xl sm:text-3xl font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                📞 1800-180-0224
              </a>
              <p className="text-xs text-orange-600 mt-1">Available 24/7 for artisan support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Enhanced Tabs - Mobile Responsive */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2 bg-slate-100">
          <TabsTrigger value="ai-recommendations" className="text-sm sm:text-base py-3 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline font-medium">AI Recommendations</span>
            <span className="sm:hidden font-medium">AI</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-sm sm:text-base py-3 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline font-medium">Smart Documents</span>
            <span className="sm:hidden font-medium">Docs</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="text-sm sm:text-base py-3 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline font-medium">Real-time Tracking</span>
            <span className="sm:hidden font-medium">Track</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-sm sm:text-base py-3 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline font-medium">Smart Alerts</span>
            <span className="sm:hidden font-medium">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="offline" className="text-sm sm:text-base py-3 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <WifiOff className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline font-medium">Offline Mode</span>
            <span className="sm:hidden font-medium">Offline</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm sm:text-base py-3 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline font-medium">Analytics</span>
            <span className="sm:hidden font-medium">Stats</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Recommendations Tab */}
        <TabsContent value="ai-recommendations" className="space-y-6">
          {/* Category Loading Error Banner */}
          {categoryError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{categoryError}</span>
                {isOnline && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={retryLoadSchemes}
                    className="ml-4"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Category Selector */}
          <CategorySelector
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            schemeCounts={calculateCategoryCounts(aiRecommendations.map(rec => ({
              categories: rec.scheme?.categories || []
            })))}
          />
          
          {/* Comparison Toolbar */}
          {selectedForComparison.size > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <GitCompare className="h-4 w-4 text-blue-600" />
              <AlertDescription className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-800">
                    {selectedForComparison.size} scheme{selectedForComparison.size !== 1 ? 's' : ''} selected for comparison
                  </span>
                  {selectedForComparison.size >= 2 && selectedForComparison.size <= 4 && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Ready to compare
                    </Badge>
                  )}
                  {selectedForComparison.size < 2 && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Select {2 - selectedForComparison.size} more
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearComparisonSelection}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={openComparison}
                    disabled={selectedForComparison.size < 2}
                    className="text-xs"
                  >
                    <GitCompare className="h-3 w-3 mr-1" />
                    Compare Now
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="border-blue-200 bg-blue-50/30 shadow-lg">
            <CardHeader className="p-5 sm:p-7">
              <CardTitle className="flex items-center gap-3 text-blue-800 text-xl sm:text-2xl">
                <Brain className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0" />
                AI-Powered Personalized Recommendations
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2">
                Advanced machine learning algorithms analyze your profile and provide
                the most suitable scheme recommendations with success probability predictions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
                  <p className="text-lg text-muted-foreground font-medium">AI is analyzing schemes for you...</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
                </div>
              ) : aiRecommendations.length === 0 ? (
                <div className="text-center py-16">
                  <AlertTriangle className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-3">No Schemes Found</h3>
                  <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto">
                    {selectedCategories.length > 0 
                      ? "No schemes available for the selected categories."
                      : "No schemes are currently available."}
                  </p>
                  {selectedCategories.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Try checking other categories or clearing your filters.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedCategories([])}
                      >
                        Clear Category Filters
                      </Button>
                    </div>
                  )}
                  {!isOnline && (
                    <Alert className="mt-4 max-w-md mx-auto">
                      <WifiOff className="h-4 w-4" />
                      <AlertDescription>
                        You're offline. Connect to the internet to load more schemes.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {aiRecommendations.map((rec, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-xl transition-all hover:scale-[1.01]">
                      <CardContent className="pt-6 p-6">
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex-1">
                            <h3 className="font-bold text-xl sm:text-2xl flex items-center gap-3 flex-wrap mb-2">
                              {rec.scheme.title}
                              <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                                AI Score: {rec.aiScore}%
                              </Badge>
                              {!isOnline && (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  Cached
                                </Badge>
                              )}
                            </h3>
                            <p className="text-base text-muted-foreground mt-2 leading-relaxed">
                              {rec.scheme.description}
                            </p>
                            <p className="text-base text-blue-700 mt-3 font-medium leading-relaxed">
                              🤖 {rec.personalizedReason}
                            </p>
                            {rec.categoryExplanation && (
                              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                  📊 Why This Matches Your Profile:
                                </h4>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                  {rec.categoryExplanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-6">
                          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl border border-green-200">
                            <div className="text-2xl sm:text-3xl font-bold text-green-600">{rec.eligibilityMatch}%</div>
                            <div className="text-xs sm:text-sm text-green-700 mt-1 font-medium">Eligibility Match</div>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <div className="text-2xl sm:text-3xl font-bold text-purple-600">{rec.benefitPotential}%</div>
                            <div className="text-xs sm:text-sm text-purple-700 mt-1 font-medium">Benefit Potential</div>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-200">
                            <div className="text-2xl sm:text-3xl font-bold text-orange-600">{rec.actionPlan.successProbability}%</div>
                            <div className="text-xs sm:text-sm text-orange-700 mt-1 font-medium">Success Probability</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-base mb-3">📋 Immediate Actions:</h4>
                            <ul className="text-sm sm:text-base space-y-2">
                              {rec.actionPlan.immediateActions.map((action: string, i: number) => (
                                <li key={i} className="flex items-start gap-3">
                                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-base">⏱️ Timeline: <span className="text-blue-600">{rec.actionPlan.timelineEstimate}</span></h4>
                          </div>

                          {rec.riskFactors.length > 0 && (
                            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                              <h4 className="font-semibold text-base mb-2 text-red-700">⚠️ Risk Factors:</h4>
                              <ul className="text-sm sm:text-base space-y-2">
                                {rec.riskFactors.map((risk: string, i: number) => (
                                  <li key={i} className="flex items-start gap-3 text-red-600">
                                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <span>{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Application URL Display */}
                        {rec.scheme.applicationUrl && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <span className="font-semibold text-blue-800 text-sm">🔗 Application Portal: </span>
                            <a
                              href={rec.scheme.applicationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline break-all text-sm"
                            >
                              {rec.scheme.applicationUrl}
                            </a>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 mt-5">
                          <Button
                            size="lg"
                            className="flex-1 text-sm sm:text-base font-semibold"
                            disabled={!isOnline}
                            onClick={async () => {
                              if (!isOnline) {
                                // Show toast explaining internet requirement
                                toast({
                                  title: "Internet Required",
                                  description: "Applying to schemes requires an internet connection. Would you like to save this scheme for later?",
                                  variant: "destructive",
                                  duration: 7000,
                                });
                                
                                // Offer to save scheme for later
                                setTimeout(() => {
                                  const shouldSave = confirm(
                                    `Save "${rec.scheme.title}" for later?\n\n` +
                                    "We'll remind you to apply when you're back online."
                                  );
                                  
                                  if (shouldSave) {
                                    storeOffline('wishlist', {
                                      ...rec,
                                      savedForApplication: true,
                                      savedAt: Date.now()
                                    }, `saved-${rec.scheme.id}`, false)
                                      .then(() => {
                                        toast({
                                          title: "Scheme Saved",
                                          description: "We'll remind you to apply when you're back online.",
                                        });
                                      })
                                      .catch((error) => {
                                        console.error('Error saving scheme:', error);
                                        toast({
                                          title: "Save Failed",
                                          description: "Couldn't save scheme. Please try again.",
                                          variant: "destructive",
                                        });
                                      });
                                  }
                                }, 500);
                                
                                return;
                              }
                              console.log('Apply Now clicked for scheme:', rec.scheme.id);
                              console.log('Application URL:', rec.scheme.applicationUrl);
                              console.log('Full scheme object:', rec.scheme);

                              // Open government portal in new tab
                              if (rec.scheme.applicationUrl) {
                                console.log('Opening URL:', rec.scheme.applicationUrl);
                                window.open(rec.scheme.applicationUrl, '_blank');
                                // Track application start
                                fetch('/api/enhanced-schemes-v2', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    action: 'track_application',
                                    artisanId,
                                    schemeId: rec.scheme.id,
                                    status: 'started'
                                  })
                                }).catch(err => console.error('Tracking error:', err));
                              } else {
                                console.error('No application URL found for scheme:', rec.scheme);
                                alert(`Application URL not available for this scheme.\n\nScheme ID: ${rec.scheme.id}\nPlease contact support.`);
                              }
                            }}
                          >
                            <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Apply Now
                          </Button>
                          <Button
                            size="lg"
                            variant={selectedForComparison.has(rec.scheme.id) ? "default" : "outline"}
                            className="flex-1 text-sm sm:text-base font-semibold"
                            onClick={() => toggleSchemeForComparison(rec.scheme.id)}
                          >
                            <GitCompare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            {selectedForComparison.has(rec.scheme.id) ? 'Selected' : 'Compare'}
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="flex-1 text-sm sm:text-base font-semibold"
                            onClick={() => setActiveTab('analytics')}
                          >
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            <span className="hidden sm:inline">View Success Prediction</span>
                            <span className="sm:hidden">View Stats</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-green-800 text-base sm:text-lg">
                <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                Smart Document Management
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                AI-powered document verification, automatic expiry tracking, and intelligent
                recommendations for missing documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentStatus ? (
                <div className="space-y-6">
                  {/* Document Status Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-green-100 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {Object.values(documentStatus.status).filter((doc: any) => doc.status === 'verified').length}
                      </div>
                      <div className="text-xs sm:text-sm text-green-700">Verified</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-yellow-100 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                        {Object.values(documentStatus.status).filter((doc: any) => doc.status === 'uploaded').length}
                      </div>
                      <div className="text-xs sm:text-sm text-yellow-700">Pending</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-red-100 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-red-600">
                        {documentStatus.missingDocuments.length}
                      </div>
                      <div className="text-xs sm:text-sm text-red-700">Missing</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-orange-100 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-orange-600">
                        {documentStatus.expiringDocuments.length}
                      </div>
                      <div className="text-xs sm:text-sm text-orange-700">Expiring Soon</div>
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                      <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                      Upload Documents with AI-Powered OCR
                    </h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={handleDocumentUpload}
                        disabled={uploadingDocument}
                      />
                      <label
                        htmlFor="document-upload"
                        className="cursor-pointer flex flex-col items-center gap-2 sm:gap-3"
                      >
                        {uploadingDocument ? (
                          <>
                            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                            <p className="text-xs sm:text-sm font-medium">Processing with OCR... {uploadProgress}%</p>
                            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
                            <div>
                              <p className="text-xs sm:text-sm font-medium">Click to upload or drag and drop</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                PDF, JPG, PNG up to 10MB • AI will auto-detect document type
                              </p>
                            </div>
                            <Button type="button" size="sm" variant="outline" className="text-xs sm:text-sm">
                              <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              Select Document
                            </Button>
                          </>
                        )}
                      </label>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                      <span>AI-powered OCR will automatically extract and verify document information</span>
                    </div>
                  </div>

                  {/* Recently Uploaded Documents */}
                  {documentStatus.documents && documentStatus.documents.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm sm:text-base font-semibold">📁 Your Documents</h3>
                      <div className="space-y-2">
                        {documentStatus.documents.map((doc: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div className="flex items-center gap-3">
                              <FileCheck className={`h-5 w-5 ${doc.status === 'verified' ? 'text-green-500' :
                                  doc.status === 'pending' ? 'text-yellow-500' :
                                    'text-gray-400'
                                }`} />
                              <div>
                                <p className="text-sm font-medium capitalize">{doc.type.replace('_', ' ')}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge className={
                              doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                                doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                            }>
                              {doc.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Recommendations */}
                  {documentStatus.recommendations.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm sm:text-base font-semibold">🤖 AI Recommendations</h3>
                      {documentStatus.recommendations.map((rec: string, index: number) => (
                        <Alert key={index} className="border-blue-200 bg-blue-50">
                          <Brain className="h-4 w-4" />
                          <AlertDescription className="text-xs sm:text-sm">{rec}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  {/* Next Steps After Upload */}
                  <div className="space-y-3">
                    <h3 className="text-sm sm:text-base font-semibold">📝 What Happens Next?</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                        <div>
                          <p className="text-sm font-medium">AI Analysis</p>
                          <p className="text-xs text-muted-foreground">Your documents are analyzed to improve scheme matching accuracy</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                        <div>
                          <p className="text-sm font-medium">Verification</p>
                          <p className="text-xs text-muted-foreground">Documents are verified against government databases (demo mode)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                        <div>
                          <p className="text-sm font-medium">Better Recommendations</p>
                          <p className="text-xs text-muted-foreground">AI updates your eligibility scores for more accurate scheme suggestions</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">4</div>
                        <div>
                          <p className="text-sm font-medium">Ready to Apply</p>
                          <p className="text-xs text-muted-foreground">Use verified documents when applying to schemes for faster approval</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading document status...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-purple-800 text-base sm:text-lg">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                Smart Notifications & Alerts
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                AI-powered notifications that deliver the most relevant updates at the right time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={`border-l-4 ${notification.priority === 'urgent' ? 'border-l-red-500 bg-red-50/50' :
                      notification.priority === 'high' ? 'border-l-orange-500 bg-orange-50/50' :
                        notification.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50/50' :
                          'border-l-green-500 bg-green-50/50'
                    }`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{notification.title}</h4>
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {notification.actionRequired && (
                              <Badge variant="outline" className="text-red-600 border-red-200">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(notification.scheduledFor).toLocaleString()}
                            </span>
                            <span>Channels: {notification.channels.join(', ')}</span>
                          </div>
                        </div>
                        {notification.actionRequired && (
                          <Button
                            size="sm"
                            onClick={() => {
                              console.log('Take Action clicked for notification:', notification.id);
                              console.log('Notification metadata:', notification.metadata);

                              // Determine the correct URL based on scheme type
                              let targetUrl = notification.actionUrl;

                              // Map scheme IDs to actual government websites
                              if (notification.metadata?.schemeId) {
                                const schemeUrls = {
                                  'mudra_plus': 'https://www.mudra.org.in/',
                                  'pmegp': 'https://www.kviconline.gov.in/pmegpeportal/jsp/pmegponline/pmegp_online_main.jsp',
                                  'digital_marketing_training': 'https://www.digitalindia.gov.in/',
                                  'pm_vishwakarma': 'https://pmvishwakarma.gov.in/',
                                  'sfurti': 'https://sfurti.msme.gov.in/',
                                  'cgtmse': 'https://www.cgtmse.in/',
                                  'stand_up_india': 'https://www.standupmitra.in/'
                                };

                                const schemeUrl = schemeUrls[notification.metadata.schemeId as keyof typeof schemeUrls];
                                if (schemeUrl) {
                                  targetUrl = schemeUrl;
                                }
                              }

                              // Handle different notification types
                              if (notification.type === 'deadline_reminder' && targetUrl) {
                                console.log('Opening scheme URL:', targetUrl);
                                window.open(targetUrl, '_blank');
                              } else if (notification.type === 'status_update' && notification.metadata?.applicationId) {
                                // For status updates, show tracking info
                                alert(`📋 Application Status Update\n\nApplication ID: ${notification.metadata.applicationId}\nStatus: ${notification.metadata.newStatus}\n\nPlease check the official portal for detailed updates.`);
                                if (targetUrl) {
                                  window.open(targetUrl, '_blank');
                                }
                              } else if (notification.actionUrl) {
                                // Fallback to actionUrl
                                console.log('Opening action URL:', notification.actionUrl);
                                window.open(notification.actionUrl, '_blank');
                              } else {
                                // No URL available
                                alert('Action URL not available for this notification. Please contact support.');
                              }
                            }}
                          >
                            Take Action
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card className="border-indigo-200 bg-indigo-50/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-indigo-800 text-base sm:text-lg">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                Real-time Application Tracking
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Track your scheme applications with live updates from government portals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sample tracking data */}
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">PM Vishwakarma Scheme</h4>
                        <p className="text-sm text-muted-foreground">Application ID: PMV2024001234</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Under Review</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Application Submitted</p>
                          <p className="text-xs text-muted-foreground">Jan 15, 2025 10:30 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Documents Verified</p>
                          <p className="text-xs text-muted-foreground">Jan 18, 2025 2:15 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full border-2 border-blue-500 animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Under Officer Review</p>
                          <p className="text-xs text-muted-foreground">In Progress</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">Final Approval</p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">🤖 AI Prediction</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Based on current progress, approval expected in 5-7 days (87% confidence)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Alert className="border-blue-200 bg-blue-50">
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    Real-time tracking syncs with government portals every 6 hours.
                    You'll receive instant notifications for any status changes.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offline Mode Tab */}
        <TabsContent value="offline" className="space-y-6">
          <Card className="border-gray-200 bg-gray-50/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-base sm:text-lg">
                <WifiOff className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                Offline Mode
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Access schemes and continue applications even without internet connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Offline Status */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-green-100 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {aiRecommendations.length}
                    </div>
                    <div className="text-xs sm:text-sm text-green-700">Schemes Cached</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-blue-100 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">7 days</div>
                    <div className="text-xs sm:text-sm text-blue-700">Cache Duration</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-purple-100 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">Auto</div>
                    <div className="text-xs sm:text-sm text-purple-700">Sync When Online</div>
                  </div>
                </div>

                {/* Offline Features */}
                <div className="space-y-3">
                  <h3 className="text-sm sm:text-base font-semibold">Available Offline:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">View cached scheme recommendations</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">Fill application forms</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">Upload documents (queued)</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">View saved applications</span>
                    </div>
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <WifiOff className="h-4 w-4" />
                  <AlertDescription>
                    All your work is automatically saved locally. When you're back online,
                    everything syncs seamlessly with the cloud.
                  </AlertDescription>
                </Alert>

                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download More Schemes for Offline Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-orange-800 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                Success Analytics & Predictions
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                AI-powered predictive analytics for your scheme applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overall Success Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-green-100 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">87%</div>
                    <div className="text-xs sm:text-sm text-green-700">Overall Success Rate</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-blue-100 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">12</div>
                    <div className="text-xs sm:text-sm text-blue-700">Applications Tracked</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-purple-100 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">₹2.5L</div>
                    <div className="text-xs sm:text-sm text-purple-700">Total Benefits</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-orange-100 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-600">18 days</div>
                    <div className="text-xs sm:text-sm text-orange-700">Avg. Processing Time</div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    AI-Powered Insights
                  </h3>

                  <Alert className="border-green-200 bg-green-50">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <strong>High Success Probability:</strong> Your profile matches 95% with PM Vishwakarma Scheme.
                      Applications similar to yours have an 89% approval rate.
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-blue-200 bg-blue-50">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      <strong>Optimal Timing:</strong> Based on historical data, applications submitted in the
                      first week of the month have 23% faster processing times.
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-orange-200 bg-orange-50">
                    <Target className="h-4 w-4 text-orange-600" />
                    <AlertDescription>
                      <strong>Improvement Suggestion:</strong> Adding a business plan document could increase
                      your approval probability by 15% for loan-based schemes.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Success Factors */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Success Factors Analysis</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Document Completeness</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Profile Match</span>
                        <span className="font-medium">88%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Application Quality</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Timing Optimization</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Scheme Comparison Modal */}
      {showComparison && (
        <SchemeComparison
          schemes={getSchemesForComparison()}
          onClose={closeComparison}
          category={selectedCategories.length === 1 ? selectedCategories[0] : undefined}
        />
      )}
    </div>
  );
}