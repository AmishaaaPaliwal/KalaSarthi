/**
 * Performance Utilities for Mobile Optimization
 * 
 * Provides utilities to ensure fast load times on mobile networks
 * Target: 2-second load time on standard mobile networks
 */

/**
 * Preload critical resources
 * Call this early in the component lifecycle to preload fonts, icons, etc.
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  
  // Note: Adjust font path based on your actual font setup
  // This is a placeholder for demonstration
}

/**
 * Debounce function for performance optimization
 * Useful for scroll handlers, resize handlers, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 * Ensures function is called at most once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if user is on a slow connection
 * Uses Network Information API when available
 */
export function isSlowConnection(): boolean {
  if (typeof window === 'undefined') return false;

  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

  if (!connection) return false;

  // Consider 2G, slow-2g, or save-data mode as slow
  return (
    connection.effectiveType === '2g' ||
    connection.effectiveType === 'slow-2g' ||
    connection.saveData === true
  );
}

/**
 * Get optimal image quality based on connection speed
 */
export function getOptimalImageQuality(): 'low' | 'medium' | 'high' {
  if (isSlowConnection()) return 'low';
  
  const connection = (navigator as any).connection;
  if (!connection) return 'medium';

  if (connection.effectiveType === '4g') return 'high';
  if (connection.effectiveType === '3g') return 'medium';
  
  return 'low';
}

/**
 * Measure and log performance metrics
 * Useful for monitoring load times
 */
export function measurePerformance(metricName: string) {
  if (typeof window === 'undefined' || !window.performance) return;

  const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (perfData) {
    const loadTime = perfData.loadEventEnd - perfData.fetchStart;
    const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
    
    console.log(`[Performance] ${metricName}:`, {
      loadTime: `${(loadTime / 1000).toFixed(2)}s`,
      domContentLoaded: `${(domContentLoaded / 1000).toFixed(2)}s`,
      target: '2.0s',
      status: loadTime < 2000 ? '✅ PASS' : '❌ SLOW'
    });
  }
}

/**
 * Request Idle Callback wrapper with fallback
 * Schedules non-critical work during browser idle time
 */
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }) {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, options);
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(callback, 1);
  }
}

/**
 * Optimize images for mobile
 * Returns optimized image parameters
 */
export function getOptimizedImageParams(width: number, height: number) {
  const quality = getOptimalImageQuality();
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  // Cap DPR at 2 for mobile to save bandwidth
  const cappedDpr = Math.min(dpr, 2);

  return {
    width: Math.round(width * cappedDpr),
    height: Math.round(height * cappedDpr),
    quality: quality === 'low' ? 60 : quality === 'medium' ? 75 : 90,
    format: 'webp', // Modern format for better compression
  };
}
