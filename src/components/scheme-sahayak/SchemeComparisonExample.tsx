/**
 * Example usage of SchemeComparison component
 * 
 * This file demonstrates how to integrate the SchemeComparison component
 * into a scheme browsing interface.
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SchemeComparison } from './SchemeComparison';
import { Scheme } from '@/types/artisan-categories';

// Example schemes data
const exampleSchemes: Scheme[] = [
  {
    id: 'pm-vishwakarma',
    title: 'PM Vishwakarma Yojana',
    description: 'Comprehensive support for traditional artisans including skill training, toolkit support, and collateral-free loans',
    categories: ['low-income-individual'],
    loanAmount: {
      min: 100000,
      max: 300000,
      currency: 'INR',
    },
    interestRate: {
      original: 8,
      subsidized: 5,
      subventionPercentage: 3,
    },
    subsidyPercentage: 30,
    collateralFree: true,
    eligibility: [
      'Traditional artisan (18 trades covered)',
      'Age between 18-60 years',
      'Indian citizen',
      'No existing PM Vishwakarma loan',
    ],
    applicationUrl: 'https://pmvishwakarma.gov.in',
    benefits: [
      'Free skill training (5-7 days)',
      'Toolkit support up to ₹15,000',
      'Marketing assistance',
      'Digital payment incentives',
    ],
  },
  {
    id: 'pmmy-shishu',
    title: 'PMMY - Shishu Category',
    description: 'Micro-credit scheme for small businesses and artisans with loans up to ₹50,000',
    categories: ['low-income-individual', 'family-based'],
    loanAmount: {
      min: 10000,
      max: 50000,
      currency: 'INR',
    },
    interestRate: {
      original: 10,
    },
    collateralFree: true,
    eligibility: [
      'Small business owner or artisan',
      'No existing PMMY loan',
      'Business plan required',
    ],
    applicationUrl: 'https://www.mudra.org.in',
    benefits: [
      'Quick approval process',
      'No collateral required',
      'Flexible repayment terms',
    ],
  },
  {
    id: 'standup-india',
    title: 'Stand-Up India Scheme',
    description: 'Loans for SC/ST and women entrepreneurs to set up greenfield enterprises',
    categories: ['low-income-individual', 'family-based'],
    loanAmount: {
      min: 1000000,
      max: 10000000,
      currency: 'INR',
    },
    interestRate: {
      original: 12,
      subsidized: 9,
      subventionPercentage: 3,
    },
    subsidyPercentage: 25,
    collateralFree: false,
    eligibility: [
      'SC/ST or Women entrepreneur',
      'Age 18 years or above',
      'First-time entrepreneur',
      'Greenfield enterprise in manufacturing, services, or trading',
    ],
    applicationUrl: 'https://www.standupmitra.in',
    benefits: [
      'Large loan amounts (₹10 lakh - ₹1 crore)',
      'Mentorship and handholding support',
      'Credit guarantee coverage',
    ],
  },
];

/**
 * Example component showing SchemeComparison integration
 */
export function SchemeComparisonExample() {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedSchemes, setSelectedSchemes] = useState<Scheme[]>([]);

  const handleCompareSchemes = () => {
    // Select first 3 schemes for comparison
    setSelectedSchemes(exampleSchemes.slice(0, 3));
    setShowComparison(true);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Scheme Comparison Example</h2>
        <p className="text-muted-foreground">
          Click the button below to see a comparison of three government schemes
          for low-income artisans.
        </p>
      </div>

      <Button onClick={handleCompareSchemes} size="lg">
        Compare Schemes
      </Button>

      {/* Comparison Modal */}
      {showComparison && (
        <SchemeComparison
          schemes={selectedSchemes}
          onClose={() => setShowComparison(false)}
          category="low-income-individual"
        />
      )}

      {/* Scheme Cards (simplified) */}
      <div className="grid gap-4 md:grid-cols-3">
        {exampleSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="border rounded-lg p-4 space-y-2 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold">{scheme.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {scheme.description}
            </p>
            <div className="text-sm">
              <div className="font-medium">Loan: ₹{(scheme.loanAmount.min / 100000).toFixed(1)}L - ₹{(scheme.loanAmount.max / 100000).toFixed(1)}L</div>
              <div>Interest: {scheme.interestRate.subsidized ?? scheme.interestRate.original}%</div>
              <div>Collateral: {scheme.collateralFree ? 'Not Required' : 'Required'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
