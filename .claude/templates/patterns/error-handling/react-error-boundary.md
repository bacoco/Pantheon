---
name: "React Error Boundary"
description: "Error boundary components and error handling patterns for React applications"
category: "error-handling"
frameworks: ["react", "nextjs", "typescript"]
dependencies: 
  - package: "react"
    version: "^18.0.0"
  - package: "react-error-boundary"
    version: "^4.0.11"
tags: ["error-handling", "react", "error-boundary", "user-experience", "fallback-ui"]
---

## Overview

This template provides comprehensive error handling for React applications including:
- Error boundary components
- Fallback UI components
- Error recovery mechanisms
- Error reporting
- Development vs production error displays
- Async error handling
- Error logging integration

## Code

### Basic Error Boundary (src/components/ErrorBoundary.tsx)
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../utils/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary-fallback">
          <h2>Oops! Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Enhanced Error Boundary with Recovery (src/components/ErrorBoundary/index.tsx)
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { logError } from '../../utils/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    const { errorCount } = this.state;

    // Log error with context
    logError(error, {
      level,
      errorBoundary: true,
      componentStack: errorInfo.componentStack,
      errorCount: errorCount + 1,
      props: this.props
    });

    // Call custom error handler
    onError?.(error, errorInfo);

    // Update state
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Auto-reset after multiple errors (circuit breaker pattern)
    if (errorCount >= 3) {
      this.scheduleReset(5000);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset on prop changes if enabled
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }

    // Reset when resetKeys change
    if (hasError && resetKeys) {
      let hasResetKeyChanged = false;
      
      for (let i = 0; i < resetKeys.length; i++) {
        if (resetKeys[i] !== this.previousResetKeys[i]) {
          hasResetKeyChanged = true;
          break;
        }
      }

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    this.previousResetKeys = resetKeys || [];
  }

  scheduleReset = (delay: number) => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, delay);
  };

  resetErrorBoundary = () => {
    const { onReset } = this.props;

    // Clear any scheduled resets
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    // Call custom reset handler
    onReset?.();

    // Reset state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
  };

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { fallback: Fallback = ErrorFallback, children, isolate } = this.props;

    if (hasError && error) {
      const errorProps: ErrorFallbackProps = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
        errorInfo,
        errorCount
      };

      // Isolated error boundaries don't propagate errors
      if (isolate) {
        return (
          <div className="error-boundary-isolated">
            <Fallback {...errorProps} />
          </div>
        );
      }

      return <Fallback {...errorProps} />;
    }

    return children;
  }
}
```

### Error Fallback Component (src/components/ErrorBoundary/ErrorFallback.tsx)
```typescript
import React from 'react';
import { ErrorFallbackProps } from './index';

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  errorInfo,
  errorCount
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <svg
            className="w-6 h-6 text-red-500 mr-2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">
            Something went wrong
          </h2>
        </div>

        <p className="text-gray-600 mb-4">
          We're sorry for the inconvenience. The application encountered an unexpected error.
        </p>

        {errorCount > 1 && (
          <p className="text-sm text-yellow-600 mb-4">
            This error has occurred {errorCount} times.
          </p>
        )}

        {isDevelopment && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error details (Development only)
            </summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              <pre className="whitespace-pre-wrap">{error.toString()}</pre>
              {errorInfo && (
                <pre className="whitespace-pre-wrap mt-2">
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          </details>
        )}

        <div className="flex gap-2">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Error Logger Utility (src/utils/errorLogger.ts)
```typescript
interface ErrorContext {
  [key: string]: any;
}

class ErrorLogger {
  private queue: Array<{ error: Error; context: ErrorContext }> = [];
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  log(error: Error, context: ErrorContext = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorData);
    }

    // Queue error for sending
    this.queue.push({ error, context: errorData });

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushQueue();
    }
  }

  private async flushQueue() {
    if (this.queue.length === 0) return;

    const errors = [...this.queue];
    this.queue = [];

    try {
      // Send to your error tracking service
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors })
      });
    } catch (sendError) {
      // Re-queue errors if sending fails
      this.queue.unshift(...errors);
      console.error('Failed to send errors:', sendError);
    }
  }
}

export const errorLogger = new ErrorLogger();
export const logError = (error: Error, context?: ErrorContext) => 
  errorLogger.log(error, context);
```

### React Error Boundary Hook (src/hooks/useErrorHandler.ts)
```typescript
import { useCallback } from 'react';
import { logError } from '../utils/errorLogger';

export const useErrorHandler = () => {
  return useCallback((error: Error, errorInfo?: any) => {
    logError(error, { 
      errorInfo,
      component: 'useErrorHandler'
    });

    // Optionally show user notification
    if (process.env.NODE_ENV === 'production') {
      // Show toast or notification
      console.error('An error occurred. Please try again.');
    }
  }, []);
};

// Usage in async operations
export const useAsyncError = () => {
  const errorHandler = useErrorHandler();
  
  return useCallback((error: Error) => {
    errorHandler(error, { source: 'async' });
    throw error; // Re-throw to trigger error boundary
  }, [errorHandler]);
};
```

### Using react-error-boundary Package (src/App.tsx)
```typescript
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { queryClient } from './lib/queryClient';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert" className="error-fallback">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset app state
        queryClient.clear();
        window.location.href = '/';
      }}
      resetKeys={['user']}
      onError={(error, errorInfo) => {
        // Log to error reporting service
        logError(error, { errorInfo });
      }}
    >
      <Router>
        {/* Your app routes */}
      </Router>
    </ErrorBoundary>
  );
}
```

### Async Error Handling Component (src/components/AsyncBoundary.tsx)
```typescript
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface AsyncBoundaryProps {
  children: React.ReactNode;
  errorFallback?: React.ComponentType<any>;
  loadingFallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
  children,
  errorFallback,
  loadingFallback = <div>Loading...</div>,
  onError
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={errorFallback || ErrorFallback}
      onError={onError}
    >
      <Suspense fallback={loadingFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Usage
<AsyncBoundary
  errorFallback={CustomErrorComponent}
  loadingFallback={<Spinner />}
>
  <LazyLoadedComponent />
</AsyncBoundary>
```

### Page-Level Error Boundary (src/pages/_app.tsx) - Next.js
```typescript
import type { AppProps } from 'next/app';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PageErrorFallback } from '../components/PageErrorFallback';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary
      level="page"
      fallback={PageErrorFallback}
      resetKeys={[pageProps]}
      onError={(error, errorInfo) => {
        // Log page-level errors
        console.error('Page error:', error, errorInfo);
      }}
    >
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;
```

## Usage

1. Install dependencies:
   ```bash
   npm install react-error-boundary
   ```

2. Wrap your app or components with ErrorBoundary:
   ```tsx
   <ErrorBoundary fallback={<ErrorFallback />}>
     <App />
   </ErrorBoundary>
   ```

3. Use different error boundaries for different parts:
   ```tsx
   // Page level
   <ErrorBoundary level="page">
     <PageContent />
   </ErrorBoundary>

   // Component level
   <ErrorBoundary level="component" isolate>
     <RiskyComponent />
   </ErrorBoundary>
   ```

4. Handle async errors:
   ```tsx
   const throwAsyncError = useAsyncError();
   
   try {
     await fetchData();
   } catch (error) {
     throwAsyncError(error);
   }
   ```

## Configuration

### Error Boundary Strategies

1. **Hierarchical Boundaries**
   - App-level boundary for critical errors
   - Page-level boundaries for page isolation
   - Component-level boundaries for risky features

2. **Reset Strategies**
   - Reset on route change
   - Reset on specific prop changes
   - Manual reset with retry button
   - Auto-reset after timeout

3. **Error Recovery**
   - Clear corrupted state
   - Retry failed operations
   - Fallback to cached data
   - Redirect to safe route

## Example

### Complete Error Handling Setup
```tsx
// App.tsx
import { ErrorBoundary } from './components/ErrorBoundary';
import { Suspense, lazy } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <ErrorBoundary level="app">
      <Suspense fallback={<LoadingSpinner />}>
        <ErrorBoundary level="page" resetKeys={[location.pathname]}>
          <Dashboard />
        </ErrorBoundary>
      </Suspense>
    </ErrorBoundary>
  );
}

// Inside Dashboard
function Dashboard() {
  return (
    <div>
      <ErrorBoundary level="component" isolate>
        <WidgetA />
      </ErrorBoundary>
      
      <ErrorBoundary level="component" isolate>
        <WidgetB />
      </ErrorBoundary>
    </div>
  );
}
```