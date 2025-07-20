---
name: "Unit Function Testing"
description: "Testing patterns for utility functions, helpers, and pure functions"
category: "testing"
frameworks: ["javascript", "typescript", "nodejs"]
dependencies: 
  - package: "jest"
    version: "^29.0.0"
  - package: "@types/jest"
    version: "^29.0.0"
tags: ["testing", "unit-test", "functions", "utilities", "jest"]
---

## Overview

This template provides testing patterns for utility functions including:
- Pure function testing
- Edge case handling
- Error condition testing
- Async function testing
- Mock and stub patterns
- Performance testing
- Type safety testing

## Code

### String Utility Tests (test/utils/string.test.ts)
```typescript
import {
  capitalize,
  slugify,
  truncate,
  parseTemplate,
  sanitizeHtml
} from '../../src/utils/string';

describe('String Utilities', () => {
  describe('capitalize', () => {
    it('capitalizes first letter of a word', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('handles empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('handles single character', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('preserves rest of the string', () => {
      expect(capitalize('hELLO wORLD')).toBe('HELLO wORLD');
    });

    it('handles non-string input', () => {
      expect(capitalize(null as any)).toBe('');
      expect(capitalize(undefined as any)).toBe('');
      expect(capitalize(123 as any)).toBe('123');
    });
  });

  describe('slugify', () => {
    it('converts string to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('removes special characters', () => {
      expect(slugify('Hello! World?')).toBe('hello-world');
    });

    it('handles multiple spaces', () => {
      expect(slugify('Hello   World')).toBe('hello-world');
    });

    it('handles accented characters', () => {
      expect(slugify('Héllö Wörld')).toBe('hello-world');
    });

    it('handles edge cases', () => {
      expect(slugify('')).toBe('');
      expect(slugify('---')).toBe('');
      expect(slugify('123')).toBe('123');
    });

    it('respects max length option', () => {
      expect(slugify('This is a very long title', { maxLength: 10 }))
        .toBe('this-is-a');
    });
  });

  describe('truncate', () => {
    const longText = 'This is a very long text that needs to be truncated';

    it('truncates text to specified length', () => {
      const result = truncate(longText, 20);
      expect(result).toBe('This is a very lo...');
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('does not truncate short text', () => {
      expect(truncate('Short text', 20)).toBe('Short text');
    });

    it('uses custom ellipsis', () => {
      expect(truncate(longText, 20, '…')).toBe('This is a very lon…');
    });

    it('handles edge cases', () => {
      expect(truncate('', 10)).toBe('');
      expect(truncate(longText, 0)).toBe('...');
      expect(truncate(longText, 3)).toBe('...');
    });
  });

  describe('parseTemplate', () => {
    it('replaces template variables', () => {
      const template = 'Hello {{name}}, welcome to {{place}}!';
      const data = { name: 'John', place: 'Paris' };
      
      expect(parseTemplate(template, data))
        .toBe('Hello John, welcome to Paris!');
    });

    it('handles missing variables', () => {
      const template = 'Hello {{name}}!';
      const data = {};
      
      expect(parseTemplate(template, data)).toBe('Hello !');
    });

    it('handles nested properties', () => {
      const template = 'Hello {{user.name}}!';
      const data = { user: { name: 'John' } };
      
      expect(parseTemplate(template, data)).toBe('Hello John!');
    });

    it('escapes HTML by default', () => {
      const template = 'Hello {{name}}!';
      const data = { name: '<script>alert("xss")</script>' };
      
      expect(parseTemplate(template, data))
        .toBe('Hello &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;!');
    });
  });
});
```

### Validation Utility Tests (test/utils/validation.test.ts)
```typescript
import {
  isEmail,
  isURL,
  isPhoneNumber,
  validatePassword,
  validateCreditCard
} from '../../src/utils/validation';

describe('Validation Utilities', () => {
  describe('isEmail', () => {
    const validEmails = [
      'user@example.com',
      'test.user@example.co.uk',
      'user+tag@example.com',
      'user123@sub.example.com'
    ];

    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user @example.com',
      'user@example',
      ''
    ];

    validEmails.forEach(email => {
      it(`validates correct email: ${email}`, () => {
        expect(isEmail(email)).toBe(true);
      });
    });

    invalidEmails.forEach(email => {
      it(`rejects invalid email: ${email}`, () => {
        expect(isEmail(email)).toBe(false);
      });
    });
  });

  describe('isURL', () => {
    it('validates correct URLs', () => {
      expect(isURL('https://example.com')).toBe(true);
      expect(isURL('http://sub.example.com/path')).toBe(true);
      expect(isURL('https://example.com:8080')).toBe(true);
      expect(isURL('ftp://example.com')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(isURL('not a url')).toBe(false);
      expect(isURL('http://')).toBe(false);
      expect(isURL('example.com')).toBe(false);
      expect(isURL('')).toBe(false);
    });

    it('respects protocol requirements', () => {
      expect(isURL('example.com', { requireProtocol: false })).toBe(true);
      expect(isURL('example.com', { requireProtocol: true })).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const result = validatePassword('StrongP@ssw0rd');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
    });

    it('provides detailed validation feedback', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
      expect(result.errors).toContain('Password must contain uppercase letter');
      expect(result.errors).toContain('Password must contain number');
    });

    it('calculates password strength', () => {
      expect(validatePassword('password').strength).toBe('weak');
      expect(validatePassword('Password1').strength).toBe('medium');
      expect(validatePassword('P@ssw0rd!').strength).toBe('strong');
    });

    it('respects custom requirements', () => {
      const options = {
        minLength: 12,
        requireSpecialChar: true
      };
      
      const result = validatePassword('Password123', options);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain special character');
    });
  });
});
```

### Date Utility Tests (test/utils/date.test.ts)
```typescript
import {
  formatDate,
  parseDate,
  addDays,
  diffInDays,
  isWeekend,
  getBusinessDays
} from '../../src/utils/date';

describe('Date Utilities', () => {
  // Fixed date for consistent testing
  const testDate = new Date('2024-01-15T10:30:00Z');

  beforeEach(() => {
    // Mock current date
    jest.useFakeTimers();
    jest.setSystemTime(testDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatDate', () => {
    it('formats date with default format', () => {
      expect(formatDate(testDate)).toBe('01/15/2024');
    });

    it('formats date with custom format', () => {
      expect(formatDate(testDate, 'YYYY-MM-DD')).toBe('2024-01-15');
      expect(formatDate(testDate, 'MMM DD, YYYY')).toBe('Jan 15, 2024');
    });

    it('handles invalid dates', () => {
      expect(formatDate(null as any)).toBe('');
      expect(formatDate('invalid' as any)).toBe('Invalid Date');
    });

    it('formats relative time', () => {
      const yesterday = addDays(testDate, -1);
      expect(formatDate(yesterday, 'relative')).toBe('1 day ago');
      
      const tomorrow = addDays(testDate, 1);
      expect(formatDate(tomorrow, 'relative')).toBe('in 1 day');
    });
  });

  describe('addDays', () => {
    it('adds positive days', () => {
      const result = addDays(testDate, 5);
      expect(result.getDate()).toBe(20);
    });

    it('adds negative days', () => {
      const result = addDays(testDate, -5);
      expect(result.getDate()).toBe(10);
    });

    it('handles month boundaries', () => {
      const endOfMonth = new Date('2024-01-31');
      const result = addDays(endOfMonth, 1);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(1);
    });

    it('preserves time', () => {
      const result = addDays(testDate, 1);
      expect(result.getHours()).toBe(testDate.getHours());
      expect(result.getMinutes()).toBe(testDate.getMinutes());
    });
  });

  describe('getBusinessDays', () => {
    it('calculates business days between dates', () => {
      const start = new Date('2024-01-01'); // Monday
      const end = new Date('2024-01-05');   // Friday
      
      expect(getBusinessDays(start, end)).toBe(5);
    });

    it('excludes weekends', () => {
      const start = new Date('2024-01-05'); // Friday
      const end = new Date('2024-01-08');   // Monday
      
      expect(getBusinessDays(start, end)).toBe(2);
    });

    it('handles holidays', () => {
      const holidays = [new Date('2024-01-01')];
      const start = new Date('2023-12-29'); // Friday
      const end = new Date('2024-01-02');   // Tuesday
      
      expect(getBusinessDays(start, end, holidays)).toBe(1);
    });

    it('handles same day', () => {
      const monday = new Date('2024-01-01');
      expect(getBusinessDays(monday, monday)).toBe(1);
      
      const saturday = new Date('2024-01-06');
      expect(getBusinessDays(saturday, saturday)).toBe(0);
    });
  });
});
```

### Async Utility Tests (test/utils/async.test.ts)
```typescript
import {
  retry,
  timeout,
  debounce,
  throttle,
  queue,
  batch
} from '../../src/utils/async';

describe('Async Utilities', () => {
  describe('retry', () => {
    it('retries failed operations', async () => {
      let attempts = 0;
      const operation = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Failed');
        }
        return 'Success';
      });

      const result = await retry(operation, { maxAttempts: 3 });
      
      expect(result).toBe('Success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('respects max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(retry(operation, { maxAttempts: 2 }))
        .rejects.toThrow('Always fails');
      
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('uses exponential backoff', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Fail'));
      const startTime = Date.now();

      try {
        await retry(operation, {
          maxAttempts: 3,
          delay: 100,
          backoff: 'exponential'
        });
      } catch {}

      const duration = Date.now() - startTime;
      expect(duration).toBeGreaterThan(300); // 100 + 200
    });

    it('allows custom retry condition', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Retry this'))
        .mockRejectedValueOnce(new Error('Do not retry'))
        .mockResolvedValue('Success');

      const shouldRetry = (error: Error) => error.message === 'Retry this';

      await expect(retry(operation, { maxAttempts: 3, shouldRetry }))
        .rejects.toThrow('Do not retry');
      
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('timeout', () => {
    it('resolves before timeout', async () => {
      const operation = () => new Promise(resolve => 
        setTimeout(() => resolve('Success'), 50)
      );

      const result = await timeout(operation(), 100);
      expect(result).toBe('Success');
    });

    it('rejects after timeout', async () => {
      const operation = () => new Promise(resolve => 
        setTimeout(() => resolve('Too late'), 200)
      );

      await expect(timeout(operation(), 100))
        .rejects.toThrow('Operation timed out');
    });

    it('cleans up on timeout', async () => {
      const cleanup = jest.fn();
      const operation = () => new Promise((resolve) => {
        const timer = setTimeout(() => resolve('Success'), 200);
        cleanup.mockImplementation(() => clearTimeout(timer));
      });

      try {
        await timeout(operation(), 100, cleanup);
      } catch {}

      expect(cleanup).toHaveBeenCalled();
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('debounces function calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced('a');
      debounced('b');
      debounced('c');

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('c');
    });

    it('cancels pending calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced('a');
      debounced.cancel();

      jest.advanceTimersByTime(100);

      expect(fn).not.toHaveBeenCalled();
    });

    it('returns promise for async functions', async () => {
      const fn = jest.fn().mockResolvedValue('result');
      const debounced = debounce(fn, 100);

      const promise = debounced();
      jest.advanceTimersByTime(100);

      const result = await promise;
      expect(result).toBe('result');
    });
  });

  describe('queue', () => {
    it('processes items in order', async () => {
      const q = queue({ concurrency: 1 });
      const results: number[] = [];

      const task = (n: number) => new Promise(resolve => {
        setTimeout(() => {
          results.push(n);
          resolve(n);
        }, 10);
      });

      q.add(() => task(1));
      q.add(() => task(2));
      q.add(() => task(3));

      await q.onIdle();

      expect(results).toEqual([1, 2, 3]);
    });

    it('respects concurrency limit', async () => {
      const q = queue({ concurrency: 2 });
      let running = 0;
      let maxRunning = 0;

      const task = () => new Promise(resolve => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        setTimeout(() => {
          running--;
          resolve(null);
        }, 50);
      });

      // Add 5 tasks
      for (let i = 0; i < 5; i++) {
        q.add(task);
      }

      await q.onIdle();

      expect(maxRunning).toBe(2);
    });
  });
});
```

### Performance Testing (test/utils/performance.test.ts)
```typescript
import { measurePerformance } from '../../src/utils/performance';
import { sortLargeArray, processDataSet } from '../../src/utils/data';

describe('Performance Tests', () => {
  describe('sortLargeArray', () => {
    it('sorts within performance budget', () => {
      const size = 10000;
      const data = Array.from({ length: size }, () => 
        Math.floor(Math.random() * size)
      );

      const { duration, result } = measurePerformance(() => 
        sortLargeArray(data)
      );

      expect(result).toHaveLength(size);
      expect(result[0]).toBeLessThanOrEqual(result[result.length - 1]);
      expect(duration).toBeLessThan(100); // 100ms budget
    });

    it('scales linearly with size', () => {
      const sizes = [1000, 2000, 4000];
      const durations = sizes.map(size => {
        const data = Array.from({ length: size }, () => 
          Math.random()
        );
        
        const { duration } = measurePerformance(() => 
          sortLargeArray(data)
        );
        
        return duration;
      });

      // Check that doubling size roughly doubles time
      const ratio1 = durations[1] / durations[0];
      const ratio2 = durations[2] / durations[1];
      
      expect(ratio1).toBeGreaterThan(1.5);
      expect(ratio1).toBeLessThan(2.5);
      expect(ratio2).toBeGreaterThan(1.5);
      expect(ratio2).toBeLessThan(2.5);
    });
  });

  describe('Memory Usage', () => {
    it('does not leak memory', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Run operation multiple times
      for (let i = 0; i < 100; i++) {
        processDataSet(new Array(1000).fill({ data: 'test' }));
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Should not increase by more than 10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});
```

## Usage

1. Install dependencies:
   ```bash
   npm install --save-dev jest @types/jest
   npm install --save-dev @faker-js/faker  # For test data
   ```

2. Create test files following the patterns above

3. Add test scripts to package.json:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage"
     }
   }
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Configuration

### Jest Configuration for Functions
```javascript
module.exports = {
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverageFrom: [
    'src/utils/**/*.ts',
    'src/helpers/**/*.ts',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "types": ["jest", "node"],
    "esModuleInterop": true,
    "strict": true
  }
}
```

## Example

### Test-Driven Development Flow
```bash
# 1. Write failing test
# test/utils/calculator.test.ts
describe('add', () => {
  it('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});

# 2. Run test (fails)
npm test calculator.test.ts

# 3. Implement function
# src/utils/calculator.ts
export const add = (a: number, b: number) => a + b;

# 4. Run test (passes)
npm test calculator.test.ts

# 5. Refactor if needed
```