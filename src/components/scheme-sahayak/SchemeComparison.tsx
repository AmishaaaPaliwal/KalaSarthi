'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Shield, TrendingUp, AlertCircle } from 'lucide-react';
import { SchemeComparisonProps } from '@/types/artisan-categories';
import { formatINR, getCategoryColorClass, ARTISAN_CATEGORIES } from '@/lib/artisan-categories';

/**
 * SchemeComparison Component
 * 
 * Displays schemes side-by-side in a comparison table with:
 * - Financial details in columns
 * - Highlighted differences in loan amounts and interest rates
 * - Category badges
 * - Eligibility and benefits comparison
 * 
 * Requirement 12.5: Allow side-by-side comparison of financial terms
 */
export function SchemeComparison({
  schemes,
  onClose,
  category,
}: SchemeComparisonProps) {
  // Don't render if no schemes to compare
  if (schemes.length === 0) {
    return null;
  }

  /**
   * Find the minimum and maximum values for highlighting differences
   */
  const loanAmountMins = schemes.map(s => s.loanAmount.min);
  const loanAmountMaxs = schemes.map(s => s.loanAmount.max);
  const interestRates = schemes.map(s => 
    s.interestRate.subsidized ?? s.interestRate.original
  );

  const minLoanMin = Math.min(...loanAmountMins);
  const maxLoanMax = Math.max(...loanAmountMaxs);
  const minInterestRate = Math.min(...interestRates);
  const maxInterestRate = Math.max(...interestRates);

  /**
   * Check if a value is the best (lowest for interest, highest for loan max)
   */
  const isBestLoanAmount = (max: number) => max === maxLoanMax;
  const isBestInterestRate = (rate: number) => rate === minInterestRate;
  const isWorstInterestRate = (rate: number) => rate === maxInterestRate;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl sm:text-2xl">
                Scheme Comparison
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base mt-1">
                Compare {schemes.length} schemes side-by-side
                {category && ` in ${ARTISAN_CATEGORIES[category].name}`}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              aria-label="Close comparison"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Comparison Table */}
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] font-semibold">
                  Criteria
                </TableHead>
                {schemes.map((scheme) => (
                  <TableHead key={scheme.id} className="font-semibold">
                    <div className="space-y-2">
                      <div className="text-sm">{scheme.title}</div>
                      {/* Category badges */}
                      <div className="flex flex-wrap gap-1">
                        {scheme.categories.map((cat) => (
                          <Badge
                            key={cat}
                            variant="outline"
                            className={`text-xs ${getCategoryColorClass(cat)}`}
                          >
                            {ARTISAN_CATEGORIES[cat].name.split(' ')[0]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Loan Amount Row - Highlight differences */}
              <TableRow>
                <TableCell className="font-medium">Loan Amount</TableCell>
                {schemes.map((scheme) => {
                  const isBest = isBestLoanAmount(scheme.loanAmount.max);
                  return (
                    <TableCell
                      key={scheme.id}
                      className={isBest ? 'bg-green-50 font-semibold' : ''}
                    >
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatINR(scheme.loanAmount.min)} - {formatINR(scheme.loanAmount.max)}
                        </div>
                        {isBest && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Highest Max
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Interest Rate Row - Highlight differences */}
              <TableRow>
                <TableCell className="font-medium">Interest Rate</TableCell>
                {schemes.map((scheme) => {
                  const effectiveRate = scheme.interestRate.subsidized ?? scheme.interestRate.original;
                  const isBest = isBestInterestRate(effectiveRate);
                  const isWorst = isWorstInterestRate(effectiveRate);
                  
                  return (
                    <TableCell
                      key={scheme.id}
                      className={
                        isBest ? 'bg-green-50 font-semibold' : 
                        isWorst ? 'bg-red-50' : ''
                      }
                    >
                      <div className="space-y-1">
                        {scheme.interestRate.subsidized ? (
                          <div>
                            <div className="text-xs line-through text-muted-foreground">
                              {scheme.interestRate.original}%
                            </div>
                            <div className="text-sm font-semibold text-green-700">
                              {scheme.interestRate.subsidized}%
                            </div>
                            <div className="text-xs text-green-600">
                              Save {(scheme.interestRate.original - scheme.interestRate.subsidized).toFixed(1)}%
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">{scheme.interestRate.original}%</div>
                        )}
                        {isBest && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Lowest Rate
                          </Badge>
                        )}
                        {isWorst && schemes.length > 1 && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Highest Rate
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Collateral Requirement Row */}
              <TableRow>
                <TableCell className="font-medium">Collateral</TableCell>
                {schemes.map((scheme) => (
                  <TableCell key={scheme.id}>
                    {scheme.collateralFree ? (
                      <div className="flex items-center gap-1 text-green-700">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-semibold">Not Required</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Required</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>

              {/* Subsidy Row */}
              <TableRow>
                <TableCell className="font-medium">Subsidy</TableCell>
                {schemes.map((scheme) => (
                  <TableCell key={scheme.id}>
                    {scheme.subsidyPercentage ? (
                      <div className="text-sm font-semibold text-orange-700">
                        {scheme.subsidyPercentage}%
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>

              {/* Eligibility Row */}
              <TableRow>
                <TableCell className="font-medium align-top">
                  Eligibility Criteria
                </TableCell>
                {schemes.map((scheme) => (
                  <TableCell key={scheme.id} className="align-top">
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      {scheme.eligibility.slice(0, 3).map((criteria, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          {criteria}
                        </li>
                      ))}
                      {scheme.eligibility.length > 3 && (
                        <li className="text-blue-600">
                          +{scheme.eligibility.length - 3} more
                        </li>
                      )}
                    </ul>
                  </TableCell>
                ))}
              </TableRow>

              {/* Benefits Row */}
              <TableRow>
                <TableCell className="font-medium align-top">
                  Key Benefits
                </TableCell>
                {schemes.map((scheme) => (
                  <TableCell key={scheme.id} className="align-top">
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      {scheme.benefits.slice(0, 3).map((benefit, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          {benefit}
                        </li>
                      ))}
                      {scheme.benefits.length > 3 && (
                        <li className="text-blue-600">
                          +{scheme.benefits.length - 3} more
                        </li>
                      )}
                    </ul>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-800 space-y-1">
            <div className="font-semibold">Legend:</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span>Best value (highest loan amount or lowest interest rate)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span>Highest interest rate</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close Comparison
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
