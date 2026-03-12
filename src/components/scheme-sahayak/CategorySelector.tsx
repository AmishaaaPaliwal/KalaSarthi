'use client';

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { User, Users, Building2, Store, Globe, Check } from 'lucide-react';
import {
  CategoryType,
  CategorySelectorProps,
} from '@/types/artisan-categories';
import {
  ARTISAN_CATEGORIES,
  getCategoryColorClass,
  getCategoryIconColor,
  formatINR,
} from '@/lib/artisan-categories';
import { measurePerformance } from '@/lib/performance-utils';

/**
 * Icon mapping for categories
 */
const CATEGORY_ICONS: Record<CategoryType, React.ComponentType<{ className?: string }>> = {
  'low-income-individual': User,
  'family-based': Users,
  'cooperative-cluster': Building2,
  'sme-scale': Store,
  'export-oriented': Globe,
};

/**
 * CategorySelector Component
 * 
 * Displays the 5 artisan categories and handles category selection/filtering.
 * Supports single and multi-category selection with visual feedback.
 * Optimized for mobile with touch-friendly targets and fast load times.
 */
export function CategorySelector({
  selectedCategories,
  onCategoryChange,
  schemeCounts,
  className = '',
}: CategorySelectorProps) {
  /**
   * Performance monitoring - measure component load time
   */
  useEffect(() => {
    measurePerformance('CategorySelector');
  }, []);

  /**
   * Handle category card click
   * 
   * Implements toggle behavior for category selection:
   * - If category is already selected → remove it from selection
   * - If category is not selected → add it to selection
   * 
   * This allows users to build up a multi-category filter by clicking
   * multiple category cards.
   */
  const handleCategoryClick = (categoryId: CategoryType) => {
    if (selectedCategories.includes(categoryId)) {
      // Deselect category: remove from array
      const newSelection = selectedCategories.filter(id => id !== categoryId);
      onCategoryChange(newSelection);
    } else {
      // Select category: add to existing selection (multi-select)
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  /**
   * Check if a category is selected
   * 
   * Used to determine visual styling (ring, checkmark) for category cards
   */
  const isSelected = (categoryId: CategoryType): boolean => {
    return selectedCategories.includes(categoryId);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Browse by Category</h2>
          <p className="text-sm text-muted-foreground">
            Select categories based on your income level and digital skills
          </p>
        </div>
        
        {/* Clear filters button - Touch-friendly */}
        {selectedCategories.length > 0 && (
          <button
            onClick={() => onCategoryChange([])}
            className="text-sm text-blue-600 hover:text-blue-800 underline min-h-[44px] px-3 touch-manipulation"
            aria-label="Clear all category filters"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Category Grid - Optimized for mobile with 1-2 columns on small screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {Object.values(ARTISAN_CATEGORIES).map((category) => {
          const Icon = CATEGORY_ICONS[category.id];
          const selected = isSelected(category.id);
          const schemeCount = schemeCounts[category.id] || 0;

          return (
            <TooltipProvider key={category.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    className={`
                      cursor-pointer transition-all duration-200 hover:shadow-lg
                      ${selected ? 'ring-2 ring-offset-2 ring-blue-500 shadow-md' : 'hover:scale-105'}
                      min-h-[44px] touch-manipulation
                    `}
                    onClick={() => handleCategoryClick(category.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCategoryClick(category.id);
                      }
                    }}
                    aria-pressed={selected}
                    aria-label={`${category.name} category, ${schemeCount} schemes available`}
                  >
                    <CardContent className="p-4 sm:p-5 space-y-3 min-h-[44px]">
                      {/* Icon and Selection Indicator - Touch-friendly sizing */}
                      <div className="flex items-start justify-between">
                        <div className={`p-2 sm:p-3 rounded-lg ${getCategoryColorClass(category.id).split(' ')[0]}`}>
                          <Icon className={`h-6 w-6 sm:h-5 sm:w-5 ${getCategoryIconColor(category.id)}`} />
                        </div>
                        
                        {selected && (
                          <div className="bg-blue-500 rounded-full p-1.5 sm:p-1">
                            <Check className="h-4 w-4 sm:h-3 sm:w-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Category Name - Readable font size on mobile */}
                      <div>
                        <h3 className="font-semibold text-base sm:text-sm leading-tight">
                          {category.name}
                        </h3>
                      </div>

                      {/* Income and Digital Literacy Indicators - Mobile-friendly sizing */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={`text-xs sm:text-[10px] px-2 py-1 sm:px-1.5 sm:py-0.5 ${getCategoryColorClass(category.id)}`}
                          >
                            {category.incomeLevel.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="text-xs sm:text-[10px] text-muted-foreground">
                          {category.digitalLiteracy === 'digitally-unaware' && '📱 Basic/No Digital'}
                          {category.digitalLiteracy === 'semi-digital' && '📱 Semi-Digital'}
                          {category.digitalLiteracy === 'fully-digital' && '📱 Fully Digital'}
                        </div>
                      </div>

                      {/* Loan Range - Readable on mobile */}
                      <div className="text-sm sm:text-xs text-muted-foreground border-t pt-2">
                        <div className="font-medium">Typical Loans:</div>
                        <div className="text-xs sm:text-[11px]">
                          {formatINR(category.typicalLoanRange.min)} - {formatINR(category.typicalLoanRange.max)}
                        </div>
                      </div>

                      {/* Scheme Count Badge - Touch-friendly */}
                      <div className="flex items-center justify-between pt-1">
                        <Badge
                          variant="secondary"
                          className="text-sm sm:text-xs font-semibold px-3 py-1 sm:px-2 sm:py-0.5"
                        >
                          {schemeCount} {schemeCount === 1 ? 'Scheme' : 'Schemes'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                
                {/* Tooltip Content */}
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-xs">{category.description}</p>
                    
                    <div className="text-xs space-y-1 pt-2 border-t">
                      <div>
                        <span className="font-medium">Income Level:</span>{' '}
                        {category.incomeLevel}
                      </div>
                      <div>
                        <span className="font-medium">Digital Skills:</span>{' '}
                        {category.digitalLiteracy.replace('-', ' ')}
                      </div>
                    </div>
                    
                    <div className="text-xs pt-2 border-t">
                      <div className="font-medium mb-1">Example Schemes:</div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {category.exampleSchemes.slice(0, 3).map((scheme, idx) => (
                          <li key={idx} className="text-[11px]">{scheme}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Selection Summary - Touch-friendly badges */}
      {selectedCategories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-900">
            Showing schemes for:
          </span>
          {selectedCategories.map((catId) => {
            const category = ARTISAN_CATEGORIES[catId];
            return (
              <Badge
                key={catId}
                className={`${getCategoryColorClass(catId)} text-sm sm:text-xs px-3 py-1.5 sm:px-2 sm:py-1`}
                variant="outline"
              >
                {category.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(catId);
                  }}
                  className="ml-2 hover:text-red-600 text-lg sm:text-base min-w-[24px] min-h-[24px] inline-flex items-center justify-center touch-manipulation"
                  aria-label={`Remove ${category.name} filter`}
                >
                  ×
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
