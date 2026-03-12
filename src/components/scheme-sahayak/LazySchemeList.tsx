'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LazySchemeListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemsPerPage?: number;
  loadingComponent?: React.ReactNode;
  className?: string;
}

/**
 * LazySchemeList Component
 * 
 * Implements progressive loading and lazy rendering for scheme cards
 * to optimize performance on mobile networks.
 * 
 * Features:
 * - Progressive loading: Loads items in batches
 * - Intersection Observer: Loads more when user scrolls near bottom
 * - Optimized for 2-second load time on mobile networks
 */
export function LazySchemeList({
  items,
  renderItem,
  itemsPerPage = 5,
  loadingComponent,
  className = '',
}: LazySchemeListProps) {
  const [visibleItems, setVisibleItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Calculate total pages
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const hasMore = currentPage < totalPages;

  /**
   * Load more items progressively
   */
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // Simulate network delay for progressive loading
    setTimeout(() => {
      const startIndex = 0;
      const endIndex = currentPage * itemsPerPage;
      setVisibleItems(items.slice(startIndex, endIndex));
      setCurrentPage(prev => prev + 1);
      setIsLoading(false);
    }, 100); // Small delay to prevent blocking
  }, [items, currentPage, itemsPerPage, hasMore, isLoading]);

  /**
   * Initial load - load first batch immediately
   */
  useEffect(() => {
    const initialItems = items.slice(0, itemsPerPage);
    setVisibleItems(initialItems);
    setCurrentPage(1);
  }, [items, itemsPerPage]);

  /**
   * Intersection Observer for infinite scroll
   * Loads more items when user scrolls near the bottom
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Start loading 100px before reaching the target
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Render visible items */}
      {visibleItems.map((item, index) => (
        <div key={item.scheme?.id || item.id || index}>
          {renderItem(item, index)}
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-4">
          {loadingComponent || (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-muted-foreground">Loading more schemes...</p>
            </div>
          )}
        </div>
      )}

      {/* Intersection observer target */}
      {hasMore && !isLoading && (
        <div ref={observerTarget} className="h-4" aria-hidden="true" />
      )}

      {/* End of list indicator */}
      {!hasMore && visibleItems.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          All schemes loaded ({items.length} total)
        </div>
      )}
    </div>
  );
}
