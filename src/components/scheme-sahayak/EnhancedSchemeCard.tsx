'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  WifiOff,
  Shield,
  Percent,
  Clock,
} from 'lucide-react';
import {
  CategoryType,
  EnhancedSchemeCardProps,
} from '@/types/artisan-categories';
import {
  ARTISAN_CATEGORIES,
  getCategoryColorClass,
  formatINR,
} from '@/lib/artisan-categories';

/**
 * EnhancedSchemeCard Component
 * 
 * Displays individual scheme information with:
 * - Category badges
 * - Financial details (loan amounts, interest rates, subsidies)
 * - "Apply Now" button with offline handling
 * - AI match score
 * - Offline cache indicator
 */
export function EnhancedSchemeCard({
  scheme,
  categories,
  aiScore,
  onApply,
  onCompare,
  isOffline = false,
  showApplyButton = true,
}: EnhancedSchemeCardProps) {
  /**
   * Handle Apply button click
   */
  const handleApplyClick = () => {
    if (isOffline) {
      return; // Button should be disabled, but extra safety
    }
    onApply();
  };

  /**
   * Calculate interest savings if subsidized rate exists
   */
  const interestSavings = scheme.interestRate.subsidized
    ? scheme.interestRate.original - scheme.interestRate.subsidized
    : 0;

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
      <CardContent className="pt-6 space-y-4">
        {/* Header: Title, AI Score, and Offline Badge - Mobile optimized */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg sm:text-xl flex items-center gap-2 flex-wrap">
              {scheme.title}
              
              {/* AI Match Score - Readable on mobile */}
              {aiScore && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm sm:text-xs px-2 py-1 sm:px-1.5 sm:py-0.5">
                  AI Score: {aiScore}%
                </Badge>
              )}
              
              {/* Offline Cache Indicator */}
              {isOffline && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-sm sm:text-xs px-2 py-1 sm:px-1.5 sm:py-0.5">
                        <WifiOff className="h-4 w-4 sm:h-3 sm:w-3 mr-1" />
                        Cached
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Viewing offline cached data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </h3>
            
            {/* Description - Readable font size (min 14px) */}
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {scheme.description}
            </p>
          </div>
        </div>

        {/* Category Badges - Mobile friendly sizing */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm sm:text-xs text-muted-foreground">Categories:</span>
          {categories.map((categoryId) => {
            const category = ARTISAN_CATEGORIES[categoryId];
            return (
              <Badge
                key={categoryId}
                variant="outline"
                className={`text-sm sm:text-xs px-2 py-1 sm:px-1.5 sm:py-0.5 ${getCategoryColorClass(categoryId)}`}
              >
                {category.name}
              </Badge>
            );
          })}
        </div>

        {/* Financial Details Grid - Stacks vertically on mobile, 2 cols on tablet, 4 cols on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Loan Amount - Readable font sizes (min 14px) */}
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
            <div className="text-sm sm:text-xs text-green-700 font-medium mb-1">Loan Amount</div>
            <div className="text-base sm:text-sm font-bold text-green-900 break-words">
              {formatINR(scheme.loanAmount.min)} - {formatINR(scheme.loanAmount.max)}
            </div>
          </div>

          {/* Interest Rate - Readable font sizes */}
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
            <div className="text-sm sm:text-xs text-purple-700 font-medium mb-1">Interest Rate</div>
            <div className="text-base sm:text-sm font-bold text-purple-900">
              {scheme.interestRate.subsidized ? (
                <div className="space-y-0.5">
                  <div className="line-through text-sm sm:text-xs text-purple-600">
                    {scheme.interestRate.original}%
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {scheme.interestRate.subsidized}%
                    <span className="text-xs sm:text-[10px] text-green-600">
                      (Save {interestSavings}%)
                    </span>
                  </div>
                </div>
              ) : (
                <div>{scheme.interestRate.original}%</div>
              )}
            </div>
          </div>

          {/* Collateral Status - Readable font sizes */}
          <div className={`p-3 sm:p-4 rounded-lg border ${
            scheme.collateralFree
              ? 'bg-blue-50 border-blue-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`text-sm sm:text-xs font-medium mb-1 ${
              scheme.collateralFree ? 'text-blue-700' : 'text-gray-700'
            }`}>
              Collateral
            </div>
            <div className="flex items-center gap-1">
              {scheme.collateralFree ? (
                <>
                  <Shield className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600" />
                  <span className="text-base sm:text-sm font-bold text-blue-900">Not Required</span>
                </>
              ) : (
                <span className="text-base sm:text-sm font-bold text-gray-900">Required</span>
              )}
            </div>
          </div>

          {/* Subsidy - Readable font sizes */}
          {scheme.subsidyPercentage && (
            <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
              <div className="text-sm sm:text-xs text-orange-700 font-medium mb-1">Subsidy</div>
              <div className="flex items-center gap-1">
                <Percent className="h-5 w-5 sm:h-4 sm:w-4 text-orange-600" />
                <span className="text-base sm:text-sm font-bold text-orange-900">
                  {scheme.subsidyPercentage}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Collateral-Free Badge (Prominent) - Mobile friendly */}
        {scheme.collateralFree && (
          <div className="flex items-center gap-2 p-3 sm:p-2 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="h-6 w-6 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold text-blue-900">
              No Collateral Required - Easy Access to Funds
            </span>
          </div>
        )}

        {/* Eligibility Criteria - Readable on mobile */}
        {scheme.eligibility && scheme.eligibility.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-base sm:text-sm font-semibold flex items-center gap-1">
              <CheckCircle className="h-5 w-5 sm:h-4 sm:w-4 text-green-600" />
              Eligibility Criteria
            </h4>
            <ul className="text-sm sm:text-base space-y-1 pl-5">
              {scheme.eligibility.slice(0, 3).map((criteria, idx) => (
                <li key={idx} className="list-disc text-muted-foreground">
                  {criteria}
                </li>
              ))}
              {scheme.eligibility.length > 3 && (
                <li className="text-sm sm:text-xs text-blue-600">
                  +{scheme.eligibility.length - 3} more criteria
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Benefits - Readable on mobile */}
        {scheme.benefits && scheme.benefits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-base sm:text-sm font-semibold flex items-center gap-1">
              <TrendingUp className="h-5 w-5 sm:h-4 sm:w-4 text-green-600" />
              Key Benefits
            </h4>
            <ul className="text-sm sm:text-base space-y-1 pl-5">
              {scheme.benefits.slice(0, 3).map((benefit, idx) => (
                <li key={idx} className="list-disc text-muted-foreground">
                  {benefit}
                </li>
              ))}
              {scheme.benefits.length > 3 && (
                <li className="text-sm sm:text-xs text-blue-600">
                  +{scheme.benefits.length - 3} more benefits
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Application URL Display - Readable on mobile */}
        {scheme.applicationUrl && (
          <div className="p-3 sm:p-2 bg-blue-50 rounded text-sm sm:text-xs border border-blue-200">
            <span className="font-medium text-blue-800">🔗 Application Portal: </span>
            <a
              href={scheme.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {scheme.applicationUrl}
            </a>
          </div>
        )}

        {/* Action Buttons - Touch-friendly with min 44px height */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {/* Apply Now Button - Touch-friendly */}
          {showApplyButton && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    <Button
                      size="lg"
                      className="w-full min-h-[44px] text-base sm:text-sm touch-manipulation"
                      disabled={isOffline}
                      onClick={handleApplyClick}
                      aria-label={isOffline ? 'Cannot apply offline - internet required' : 'Apply for this scheme'}
                    >
                      <Target className="h-5 w-5 sm:h-4 sm:w-4 mr-2 sm:mr-1" />
                      {isOffline ? 'Offline - Cannot Apply' : 'Apply Now'}
                      {!isOffline && <ExternalLink className="h-4 w-4 sm:h-3 sm:w-3 ml-2 sm:ml-1" />}
                    </Button>
                  </div>
                </TooltipTrigger>
                {isOffline && (
                  <TooltipContent>
                    <p className="text-xs">
                      Internet connection required to apply for schemes
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Compare Button - Touch-friendly */}
          <Button
            size="lg"
            variant="outline"
            className="flex-1 min-h-[44px] text-base sm:text-sm touch-manipulation"
            onClick={onCompare}
            aria-label="Compare this scheme with others"
          >
            <TrendingUp className="h-5 w-5 sm:h-4 sm:w-4 mr-2 sm:mr-1" />
            <span className="hidden sm:inline">Compare Schemes</span>
            <span className="sm:hidden">Compare</span>
          </Button>
        </div>

        {/* Offline Warning - Readable on mobile */}
        {isOffline && (
          <div className="flex items-start gap-2 p-3 sm:p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="h-5 w-5 sm:h-4 sm:w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm sm:text-xs text-yellow-800">
              You're viewing cached data. Connect to internet for latest updates and to apply.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
