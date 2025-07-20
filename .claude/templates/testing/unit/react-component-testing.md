---
name: "React Component Unit Testing"
description: "Comprehensive testing patterns for React components with Testing Library"
category: "testing"
frameworks: ["react", "nextjs", "typescript"]
dependencies: 
  - package: "@testing-library/react"
    version: "^14.0.0"
  - package: "@testing-library/jest-dom"
    version: "^6.0.0"
  - package: "@testing-library/user-event"
    version: "^14.0.0"
  - package: "jest"
    version: "^29.0.0"
  - package: "jest-environment-jsdom"
    version: "^29.0.0"
tags: ["testing", "unit-test", "react", "testing-library", "jest"]
---

## Overview

This template provides comprehensive unit testing patterns for React components including:
- Component rendering tests
- User interaction testing
- Async behavior testing
- Custom hooks testing
- Context/Provider testing
- Accessibility testing
- Snapshot testing
- Mock strategies

## Code

### Jest Configuration (jest.config.js)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### Jest Setup (jest.setup.js)
```javascript
import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
```

### Basic Component Test (__tests__/Button.test.tsx)
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeDisabled()
  })

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Click me</Button>)
    
    let button = screen.getByRole('button', { name: /click me/i })
    expect(button).toHaveClass('btn-primary')
    
    rerender(<Button variant="secondary">Click me</Button>)
    button = screen.getByRole('button', { name: /click me/i })
    expect(button).toHaveClass('btn-secondary')
  })

  it('renders loading state correctly', () => {
    render(<Button loading>Click me</Button>)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Form Component Test (__tests__/ContactForm.test.tsx)
```typescript
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from '@/components/ContactForm'
import { submitContactForm } from '@/app/actions/contact'

// Mock the server action
jest.mock('@/app/actions/contact', () => ({
  submitContactForm: jest.fn()
}))

describe('ContactForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<ContactForm />)
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    render(<ContactForm />)
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/message is required/i)).toBeInTheDocument()
    })
  })

  it('shows email validation error for invalid email', async () => {
    render(<ContactForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const mockSubmit = jest.mocked(submitContactForm)
    mockSubmit.mockResolvedValueOnce({
      success: true,
      message: 'Message sent successfully'
    })
    
    render(<ContactForm />)
    
    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'This is a test message')
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        null,
        expect.any(FormData)
      )
    })
    
    // Check success message
    expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
  })

  it('handles submission errors', async () => {
    const mockSubmit = jest.mocked(submitContactForm)
    mockSubmit.mockResolvedValueOnce({
      success: false,
      message: 'Failed to send message'
    })
    
    render(<ContactForm />)
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'This is a test message')
    
    await user.click(screen.getByRole('button', { name: /send message/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const mockSubmit = jest.mocked(submitContactForm)
    mockSubmit.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        message: 'Success'
      }), 100))
    )
    
    render(<ContactForm />)
    
    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /send message/i })
    await user.click(submitButton)
    
    // Check loading state
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send message/i })).toBeEnabled()
    })
  })
})
```

### Custom Hook Test (__tests__/hooks/useDebounce.test.ts)
```typescript
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

jest.useFakeTimers()

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    
    expect(result.current).toBe('initial')
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )
    
    // Change value
    rerender({ value: 'updated', delay: 500 })
    
    // Value should not change immediately
    expect(result.current).toBe('initial')
    
    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(500)
    })
    
    // Now value should be updated
    expect(result.current).toBe('updated')
  })

  it('cancels pending updates on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )
    
    // Make multiple rapid changes
    rerender({ value: 'update1', delay: 500 })
    
    act(() => {
      jest.advanceTimersByTime(200)
    })
    
    rerender({ value: 'update2', delay: 500 })
    
    act(() => {
      jest.advanceTimersByTime(200)
    })
    
    rerender({ value: 'final', delay: 500 })
    
    // Value should still be initial
    expect(result.current).toBe('initial')
    
    // Fast forward past debounce delay
    act(() => {
      jest.advanceTimersByTime(500)
    })
    
    // Should have final value, not intermediate ones
    expect(result.current).toBe('final')
  })
})
```

### Context/Provider Test (__tests__/providers/AuthProvider.test.tsx)
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/providers/AuthProvider'
import { signIn, signOut } from '@/lib/auth'

// Mock auth functions
jest.mock('@/lib/auth', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn()
}))

// Test component that uses the auth context
function TestComponent() {
  const { user, isLoading, login, logout } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      {user ? (
        <>
          <p>Logged in as: {user.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <p>Not logged in</p>
          <button onClick={() => login('test@example.com', 'password')}>
            Login
          </button>
        </>
      )}
    </div>
  )
}

describe('AuthProvider', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('provides authentication state to children', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText(/not logged in/i)).toBeInTheDocument()
    })
  })

  it('handles login', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    jest.mocked(signIn).mockResolvedValueOnce(mockUser)
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    const loginButton = await screen.findByRole('button', { name: /login/i })
    await user.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText(/logged in as: test@example.com/i)).toBeInTheDocument()
    })
    
    expect(signIn).toHaveBeenCalledWith('test@example.com', 'password')
  })

  it('handles logout', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    jest.mocked(signIn).mockResolvedValueOnce(mockUser)
    jest.mocked(signOut).mockResolvedValueOnce(undefined)
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Login first
    const loginButton = await screen.findByRole('button', { name: /login/i })
    await user.click(loginButton)
    
    // Then logout
    const logoutButton = await screen.findByRole('button', { name: /logout/i })
    await user.click(logoutButton)
    
    await waitFor(() => {
      expect(screen.getByText(/not logged in/i)).toBeInTheDocument()
    })
    
    expect(signOut).toHaveBeenCalled()
  })

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    spy.mockRestore()
  })
})
```

### Testing Utils (test-utils.tsx)
```typescript
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'

// Mock providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }
```

### Accessibility Testing
```typescript
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Button from '@/components/Button'

expect.extend(toHaveNoViolations)

describe('Button Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <Button onClick={() => {}}>Click me</Button>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has proper ARIA attributes when loading', async () => {
    const { container } = render(
      <Button loading>Loading...</Button>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
    
    const button = container.querySelector('button')
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })
})
```

## Usage

1. Install dependencies:
   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
   npm install --save-dev jest-axe # for accessibility testing
   ```

2. Create jest.config.js and jest.setup.js files

3. Add test script to package.json:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage"
     }
   }
   ```

4. Write tests following the patterns above

## Configuration

### VS Code Settings (.vscode/settings.json)
```json
{
  "jest.autoRun": {
    "watch": true,
    "onSave": "test-file"
  },
  "jest.showCoverageOnLoad": true
}
```

### ESLint for Tests (.eslintrc.json)
```json
{
  "overrides": [
    {
      "files": ["**/__tests__/**/*", "**/*.test.*"],
      "env": {
        "jest": true
      },
      "rules": {
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
}
```

## Example

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="handles login"
```

### Test Organization
```
src/
├── components/
│   ├── Button.tsx
│   ├── __tests__/
│   │   └── Button.test.tsx
├── hooks/
│   ├── useDebounce.ts
│   ├── __tests__/
│   │   └── useDebounce.test.ts
└── test-utils.tsx
```