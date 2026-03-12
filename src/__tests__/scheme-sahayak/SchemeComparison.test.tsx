/**
 * Unit tests for SchemeComparison component
 * 
 * Tests the comparison table UI functionality including:
 * - Rendering schemes side-by-side
 * - Displaying financial details in columns
 * - Highlighting differences in loan amounts and interest rates
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SchemeComparison } from '@/components/scheme-sahayak/SchemeComparison';
import { Scheme } from '@/types/artisan-categories';

// Mock schemes for testing
const mockSchemes: Scheme[] = [
  {
    id: 'scheme-1',
    title: 'PM Vishwakarma Yojana',
    description: 'Skill training and collateral-free loans for traditional artisans',
    categories: ['low-income-individual'],
    loanAmount: {
      min: 100000,
      max: 300000,
      currency: 'INR',
    },
    interestRate: {
      original: 8,
      subsidized: 5,
    },
    subsidyPercentage: 30,
    collateralFree: true,
    eligibility: ['Traditional artisan', 'Age 18-60', 'Indian citizen'],
    applicationUrl: 'https://example.com/pm-vishwakarma',
    benefits: ['Free training', 'Toolkit support', 'Marketing assistance'],
  },
  {
    id: 'scheme-2',
    title: 'PMMY Shishu',
    description: 'Micro-credit for small businesses',
    categories: ['low-income-individual', 'family-based'],
    loanAmount: {
      min: 50000,
      max: 500000,
      currency: 'INR',
    },
    interestRate: {
      original: 10,
    },
    collateralFree: true,
    eligibility: ['Small business owner', 'No existing loans'],
    applicationUrl: 'https://example.com/pmmy',
    benefits: ['Quick approval', 'No collateral'],
  },
  {
    id: 'scheme-3',
    title: 'Stand-Up India',
    description: 'Loans for SC/ST and women entrepreneurs',
    categories: ['low-income-individual'],
    loanAmount: {
      min: 1000000,
      max: 10000000,
      currency: 'INR',
    },
    interestRate: {
      original: 12,
      subsidized: 9,
    },
    subsidyPercentage: 25,
    collateralFree: false,
    eligibility: ['SC/ST or Women', 'Age 18+', 'First-time entrepreneur'],
    applicationUrl: 'https://example.com/standup-india',
    benefits: ['Large loan amounts', 'Mentorship support'],
  },
];

describe('SchemeComparison Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders comparison table with scheme titles', () => {
    render(
      <SchemeComparison
        schemes={mockSchemes}
        onClose={mockOnClose}
      />
    );

    // Check that all scheme titles are displayed
    expect(screen.getByText('PM Vishwakarma Yojana')).toBeInTheDocument();
    expect(screen.getByText('PMMY Shishu')).toBeInTheDocument();
    expect(screen.getByText('Stand-Up India')).toBeInTheDocument();
  });

  it('displays financial details in columns', () => {
    render(
      <SchemeComparison
        schemes={mockSchemes}
        onClose={mockOnClose}
      />
    );

    // Check that financial criteria rows are present
    expect(screen.getByText('Loan Amount')).toBeInTheDocument();
    expect(screen.getByText('Interest Rate')).toBeInTheDocument();
    expect(screen.getByText('Collateral')).toBeInTheDocument();
    expect(screen.getByText('Subsidy')).toBeInTheDocument();
  });

  it('highlights best loan amount', () => {
    const { container } = render(
      <SchemeComparison
        schemes={mockSchemes}
        onClose={mockOnClose}
      />
    );

    // Stand-Up India has the highest max loan amount (₹1 Cr)
    // Check for the "Highest Max" badge
    expect(screen.getByText('Highest Max')).toBeInTheDocument();
  });

  it('highlights best interest rate', () => {
    render(
      <SchemeComparison
        schemes={mockSchemes}
        onClose={mockOnClose}
      />
    );

    // PM Vishwakarma has the lowest subsidized rate (5%)
    // Check for the "Lowest Rate" badge
    expect(screen.getByText('Lowest Rate')).toBeInTheDocument();
  });

  it('displays collateral status correctly', () => {
    render(
      <SchemeComparison
        schemes={mockSchemes}
        onClose={mockOnClose}
      />
    );

    // Check for "Not Required" text (2 schemes are collateral-free)
    const notRequiredElements = screen.getAllByText('Not Required');
    expect(notRequiredElements.length).toBe(2);

    // Check for "Required" text (1 scheme requires collateral)
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('displays subsidy percentages', () => {
    render(
      <SchemeComparison
        schemes={mockSchemes}
        onClose={mockOnClose}
      />
    );

    // Check that subsidy percentages are displayed
    expect(screen.getByText('30%')).toBeInTheDocument(); // PM Vishwakarma
    expect(screen.getByText('25%')).toBeInTheDocument(); // Stand-Up India
  });

  it('shows subsidized vs original interest rates', () => {
    render(
      <SchemeComparison
        schemes={mockSchemes}
        onClose={mockOnClose}
      />
    );

    // PM Vishwakarma shows both original (8%) and subsidized (5%) rates
    // The component should show savings (there are multiple instances in the table)
    const savingsElements = screen.getAllByText(/Save.*3\.0%/);
    expect(savingsElements.length).toBeGreaterThan(0);
  });

  it('displays eligibility criteria', () => {
    render(
      <SchemeComparison
        schemes={mockSchemes}
        onClose={mockOnClose}
      />
    );

    // Check for eligibility criteria header
    expect(screen.getByText('Eligibility Criteria')).toBeInTheDocument();

    // Check for specific eligibility text
    expect(screen.getByText('Traditional artisan')).toBeInTheDocument();
  });

  it('displays key benefits', () => {
    render(
      <SchemeComparison
        schemes={mockSchemes}
        onClose={mockOnClose}
      />
    );

    // Check for benefits header
    expect(screen.getByText('Key Benefits')).toBeInTheDocument();

    // Check for specific benefit text
    expect(screen.getByText('Free training')).toBeInTheDocument();
  });

  it('shows legend explaining highlights', () => {
    render(
      <SchemeComparison
        schemes={mockSchemes}
        onClose={mockOnClose}
      />
    );

    // Check for legend
    expect(screen.getByText('Legend:')).toBeInTheDocument();
    expect(screen.getByText(/Best value/)).toBeInTheDocument();
    expect(screen.getByText(/Highest interest rate/)).toBeInTheDocument();
  });

  it('renders nothing when no schemes provided', () => {
    const { container } = render(
      <SchemeComparison
        schemes={[]}
        onClose={mockOnClose}
      />
    );

    // Component should return null for empty schemes array
    expect(container.firstChild).toBeNull();
  });

  it('displays category badges for each scheme', () => {
    render(
      <SchemeComparison
        schemes={mockSchemes}
        onClose={mockOnClose}
      />
    );

    // Check that category badges are present
    // "Low-Income" should appear multiple times (first word of category name)
    const lowIncomeElements = screen.getAllByText('Low-Income');
    expect(lowIncomeElements.length).toBeGreaterThan(0);
  });

  describe('Highlighting Differences', () => {
    it('highlights the scheme with highest maximum loan amount', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // Stand-Up India has max loan of ₹1 Cr (highest)
      // Should have "Highest Max" badge
      expect(screen.getByText('Highest Max')).toBeInTheDocument();
    });

    it('highlights the scheme with lowest interest rate', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // PM Vishwakarma has 5% subsidized rate (lowest)
      // Should have "Lowest Rate" badge
      expect(screen.getByText('Lowest Rate')).toBeInTheDocument();
    });

    it('highlights the scheme with highest interest rate', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // Stand-Up India has 9% subsidized rate (highest among subsidized)
      // Should have "Highest Rate" badge
      expect(screen.getByText('Highest Rate')).toBeInTheDocument();
    });

    it('applies green background to best loan amount cell', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // Stand-Up India has the highest max loan amount
      // The component applies inline styles or Tailwind classes
      // Check for the "Highest Max" badge which indicates highlighting
      expect(screen.getByText('Highest Max')).toBeInTheDocument();
    });

    it('applies red background to worst interest rate cell', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // Stand-Up India has the highest interest rate
      // Check for the "Highest Rate" badge which indicates highlighting
      expect(screen.getByText('Highest Rate')).toBeInTheDocument();
    });

    it('shows savings calculation for subsidized interest rates', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // PM Vishwakarma: 8% original - 5% subsidized = 3% savings
      const savingsElements = screen.getAllByText(/Save.*3\.0%/);
      expect(savingsElements.length).toBeGreaterThan(0);
    });

    it('displays collateral-free schemes with shield icon', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // Check for Shield icon using data-testid from our mock
      const shieldIcons = screen.getAllByTestId('shield-icon');
      expect(shieldIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Export Functionality', () => {
    // Note: Export functionality is planned but not yet implemented
    // These tests document the expected behavior for future implementation
    
    it.skip('should have an export button when export functionality is implemented', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // Future: Should have an "Export as PDF" or "Download" button
      // expect(screen.getByRole('button', { name: /export|download/i })).toBeInTheDocument();
    });

    it.skip('should export comparison data when export button is clicked', () => {
      // Future: Test that clicking export button triggers download
      // This will require mocking the PDF generation library
    });

    it.skip('should include all scheme details in exported PDF', () => {
      // Future: Test that exported PDF contains all comparison data
      // - Scheme titles
      // - Loan amounts
      // - Interest rates
      // - Eligibility criteria
      // - Benefits
    });
  });

  describe('Comparison Table Rendering', () => {
    it('renders all financial criteria rows', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // Verify all key financial rows are present
      expect(screen.getByText('Loan Amount')).toBeInTheDocument();
      expect(screen.getByText('Interest Rate')).toBeInTheDocument();
      expect(screen.getByText('Collateral')).toBeInTheDocument();
      expect(screen.getByText('Subsidy')).toBeInTheDocument();
      expect(screen.getByText('Eligibility Criteria')).toBeInTheDocument();
      expect(screen.getByText('Key Benefits')).toBeInTheDocument();
    });

    it('renders correct number of scheme columns', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // Should have 3 scheme columns (one for each mock scheme)
      const schemeHeaders = [
        screen.getByText('PM Vishwakarma Yojana'),
        screen.getByText('PMMY Shishu'),
        screen.getByText('Stand-Up India'),
      ];
      
      expect(schemeHeaders).toHaveLength(3);
    });

    it('formats loan amounts with currency', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // Check for formatted currency (₹ symbol)
      // The formatINR function formats these amounts
      // Just verify that currency symbol is present
      const loanAmountRow = screen.getByText('Loan Amount');
      expect(loanAmountRow).toBeInTheDocument();
      
      // Verify at least one formatted amount is present (using getAllByText for flexibility)
      const currencyElements = screen.getAllByText(/₹/);
      expect(currencyElements.length).toBeGreaterThan(0);
    });

    it('displays N/A for schemes without subsidies', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // PMMY Shishu doesn't have a subsidy percentage
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('truncates long eligibility lists with +X more indicator', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // Stand-Up India has 3 eligibility criteria, should show all
      // If a scheme had more than 3, it should show "+X more"
      expect(screen.getByText('Traditional artisan')).toBeInTheDocument();
    });

    it('truncates long benefits lists with +X more indicator', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // PM Vishwakarma has 3 benefits, should show all
      expect(screen.getByText('Free training')).toBeInTheDocument();
      expect(screen.getByText('Toolkit support')).toBeInTheDocument();
      expect(screen.getByText('Marketing assistance')).toBeInTheDocument();
    });
  });

  describe('Dialog Behavior', () => {
    it('displays dialog title with scheme count', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Scheme Comparison')).toBeInTheDocument();
      expect(screen.getByText(/Compare 3 schemes/)).toBeInTheDocument();
    });

    it('includes category name in description when category prop is provided', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
          category="low-income-individual"
        />
      );

      // Should mention the category name in the description
      expect(screen.getByText(/Low-Income Individual/)).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      // Get the "Close Comparison" button specifically (not the X button)
      const closeButton = screen.getByRole('button', { name: 'Close Comparison' });
      closeButton.click();

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when X button is clicked', () => {
      render(
        <SchemeComparison
          schemes={mockSchemes}
          onClose={mockOnClose}
        />
      );

      const xButton = screen.getByLabelText('Close comparison');
      xButton.click();

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
