// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <svg data-testid="x-icon" />,
  Shield: () => <svg data-testid="shield-icon" />,
  TrendingUp: () => <svg data-testid="trending-up-icon" />,
  AlertCircle: () => <svg data-testid="alert-circle-icon" />,
}))
