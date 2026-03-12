# SchemeComparison Component

## Overview

The `SchemeComparison` component provides a side-by-side comparison table for government schemes, allowing artisans to compare financial details, eligibility criteria, and benefits across multiple schemes.

## Features

### 1. Side-by-Side Display
- Displays schemes in columns for easy comparison
- Shows scheme titles and category badges at the top
- Responsive table layout

### 2. Financial Details Comparison
- **Loan Amount**: Displays min-max range with INR formatting
- **Interest Rate**: Shows original and subsidized rates with savings calculation
- **Collateral**: Clearly indicates if collateral is required or not
- **Subsidy**: Displays subsidy percentages when applicable

### 3. Difference Highlighting
- **Best Loan Amount**: Highlights scheme with highest maximum loan amount (green background)
- **Best Interest Rate**: Highlights scheme with lowest effective interest rate (green background)
- **Worst Interest Rate**: Highlights scheme with highest interest rate (red background)
- Visual badges indicate "Highest Max", "Lowest Rate", etc.

### 4. Additional Information
- Eligibility criteria (first 3 items with "+X more" indicator)
- Key benefits (first 3 items with "+X more" indicator)
- Category badges for each scheme
- Legend explaining the highlighting system

## Usage

```tsx
import { SchemeComparison } from '@/components/scheme-sahayak/SchemeComparison';

function MyComponent() {
  const [showComparison, setShowComparison] = useState(false);
  const [selectedSchemes, setSelectedSchemes] = useState<Scheme[]>([]);

  return (
    <>
      {showComparison && (
        <SchemeComparison
          schemes={selectedSchemes}
          onClose={() => setShowComparison(false)}
          category="low-income-individual" // Optional
        />
      )}
    </>
  );
}
```

## Props

```typescript
interface SchemeComparisonProps {
  schemes: Scheme[];        // Array of schemes to compare (2-4 recommended)
  onClose: () => void;      // Callback when user closes the comparison
  category?: CategoryType;  // Optional category filter for context
}
```

## Implementation Details

### Highlighting Logic

The component automatically identifies:
- **Maximum loan amount**: `Math.max(...schemes.map(s => s.loanAmount.max))`
- **Minimum interest rate**: `Math.min(...schemes.map(s => s.interestRate.subsidized ?? s.interestRate.original))`
- **Maximum interest rate**: `Math.max(...schemes.map(s => s.interestRate.subsidized ?? s.interestRate.original))`

Cells are highlighted with:
- Green background (`bg-green-50`) for best values
- Red background (`bg-red-50`) for worst values
- Badges with icons for visual emphasis

### Responsive Design

- Uses Dialog component for modal display
- Table scrolls horizontally on small screens
- Maximum width of 6xl (1152px) for optimal readability
- Maximum height of 90vh with vertical scrolling

### Accessibility

- Proper ARIA labels on close button
- Semantic table structure with TableHeader and TableBody
- Screen reader friendly with descriptive text
- Keyboard navigation support through Dialog component

## Requirements Validation

✅ **Requirement 12.5**: Allow side-by-side comparison of financial terms
- Displays schemes in columns
- Shows all financial details (loan amounts, interest rates, subsidies)
- Highlights differences for easy comparison
- Includes eligibility and benefits comparison

## Testing

Unit tests are provided in `src/__tests__/scheme-sahayak/SchemeComparison.test.tsx`:
- Renders scheme titles correctly
- Displays financial details in columns
- Highlights best loan amounts
- Highlights best/worst interest rates
- Shows collateral status
- Displays subsidy percentages
- Shows subsidized vs original rates
- Displays eligibility and benefits
- Shows legend
- Handles empty schemes array

## Future Enhancements

Potential improvements for future iterations:
- Export comparison as PDF
- Print-friendly styling
- More than 4 schemes comparison with horizontal scroll
- Sorting by different criteria
- Filtering comparison rows
- Save comparison for later reference
