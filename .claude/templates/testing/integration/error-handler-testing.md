---
id: "error-handler-testing"
name: "Error Handler Testing"
description: "Test suite for global error handling middleware"
category: "test"
frameworks: ["express", "nodejs"]
dependencies: 
  - package: "supertest"
    version: "^6.3.0"
    dev: true
  - package: "jest"
    version: "^29.0.0"
    dev: true
  - package: "@types/supertest"
    version: "^2.0.0"
    dev: true
tags: ["test", "error-handling", "middleware", "express"]
testTemplate: null
conflicts: []
mergeStrategy: "append"
targetFiles:
  - path: "src/__tests__/errorHandler.test.ts"
    type: "new"
---

## Overview

This template provides comprehensive testing for error handling middleware including:
- Custom error classes
- Error response formatting
- Async error handling
- Production vs development error details
- Error logging verification

## Code

### Error Handler Test Suite (src/__tests__/errorHandler.test.ts)
```typescript
import request from 'supertest';
import express from 'express';
import { 
  errorHandler, 
  CustomError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ValidationError
} from '../middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Test routes that throw different errors
    app.get('/not-found', (req, res) => {
      throw new NotFoundError('Resource not found');
    });

    app.get('/bad-request', (req, res) => {
      throw new BadRequestError('Invalid request data');
    });

    app.get('/unauthorized', (req, res) => {
      throw new UnauthorizedError('Authentication required');
    });

    app.get('/validation-error', (req, res) => {
      throw new ValidationError('Validation failed', [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' }
      ]);
    });

    app.get('/generic-error', (req, res) => {
      throw new Error('Something went wrong');
    });

    app.get('/async-error', async (req, res) => {
      await Promise.reject(new Error('Async error'));
    });

    app.get('/syntax-error', (req, res) => {
      JSON.parse('invalid json');
    });

    // Add error handler at the end
    app.use(errorHandler);
  });

  describe('Custom Error Classes', () => {
    it('should handle NotFoundError correctly', async () => {
      const response = await request(app)
        .get('/not-found')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Resource not found',
        code: 'NOT_FOUND'
      });
    });

    it('should handle BadRequestError correctly', async () => {
      const response = await request(app)
        .get('/bad-request')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid request data',
        code: 'BAD_REQUEST'
      });
    });

    it('should handle UnauthorizedError correctly', async () => {
      const response = await request(app)
        .get('/unauthorized')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    });

    it('should handle ValidationError with field details', async () => {
      const response = await request(app)
        .get('/validation-error')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: [
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password too short' }
        ]
      });
    });
  });

  describe('Generic Error Handling', () => {
    it('should handle generic errors', async () => {
      const response = await request(app)
        .get('/generic-error')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.any(String)
      });

      // In production, should not expose error details
      if (process.env.NODE_ENV === 'production') {
        expect(response.body.error).toBe('Something went wrong!');
      } else {
        expect(response.body.error).toBe('Something went wrong');
      }
    });

    it('should handle async errors', async () => {
      const response = await request(app)
        .get('/async-error')
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('should handle syntax errors', async () => {
      const response = await request(app)
        .get('/syntax-error')
        .expect(500);

      expect(response.body.success).toBe(false);
      
      // Should not expose JSON parsing details in production
      if (process.env.NODE_ENV === 'production') {
        expect(response.body.error).not.toContain('JSON');
      }
    });
  });

  describe('Error Response Format', () => {
    it('should include request ID if available', async () => {
      app = express();
      app.use((req, res, next) => {
        req.id = 'test-request-id';
        next();
      });
      
      app.get('/error', (req, res) => {
        throw new Error('Test error');
      });
      
      app.use(errorHandler);

      const response = await request(app)
        .get('/error')
        .expect(500);

      expect(response.body.requestId).toBe('test-request-id');
    });

    it('should include timestamp', async () => {
      const response = await request(app)
        .get('/generic-error')
        .expect(500);

      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should include path in development', async () => {
      process.env.NODE_ENV = 'development';
      
      const response = await request(app)
        .get('/generic-error')
        .expect(500);

      if (process.env.NODE_ENV === 'development') {
        expect(response.body.path).toBe('/generic-error');
      }
    });
  });

  describe('Database Error Handling', () => {
    it('should handle MongoDB validation errors', async () => {
      app.get('/mongo-validation', (req, res) => {
        const error: any = new Error('Validation failed');
        error.name = 'ValidationError';
        error.errors = {
          email: { message: 'Email is required' },
          age: { message: 'Age must be a number' }
        };
        throw error;
      });

      const response = await request(app)
        .get('/mongo-validation')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
        errors: expect.arrayContaining([
          { field: 'email', message: 'Email is required' },
          { field: 'age', message: 'Age must be a number' }
        ])
      });
    });

    it('should handle MongoDB duplicate key errors', async () => {
      app.get('/mongo-duplicate', (req, res) => {
        const error: any = new Error('Duplicate key');
        error.code = 11000;
        error.keyPattern = { email: 1 };
        throw error;
      });

      const response = await request(app)
        .get('/mongo-duplicate')
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        error: 'email already exists'
      });
    });

    it('should handle MongoDB cast errors', async () => {
      app.get('/mongo-cast', (req, res) => {
        const error: any = new Error('Cast error');
        error.name = 'CastError';
        error.path = '_id';
        error.value = 'invalid-id';
        throw error;
      });

      const response = await request(app)
        .get('/mongo-cast')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid _id format'
      });
    });
  });

  describe('Security', () => {
    it('should not expose stack traces in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/generic-error')
        .expect(500);

      expect(response.body.stack).toBeUndefined();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should sanitize error messages', async () => {
      app.get('/sql-injection', (req, res) => {
        throw new Error("SELECT * FROM users WHERE id = '1' OR '1'='1'");
      });

      const response = await request(app)
        .get('/sql-injection')
        .expect(500);

      if (process.env.NODE_ENV === 'production') {
        expect(response.body.error).not.toContain('SELECT');
        expect(response.body.error).toBe('Something went wrong!');
      }
    });
  });

  describe('Logging', () => {
    it('should log errors with appropriate level', async () => {
      const logSpy = jest.spyOn(console, 'error').mockImplementation();

      await request(app).get('/generic-error').expect(500);

      expect(logSpy).toHaveBeenCalled();
      
      logSpy.mockRestore();
    });

    it('should not log expected errors (4xx)', async () => {
      const logSpy = jest.spyOn(console, 'error').mockImplementation();

      await request(app).get('/not-found').expect(404);

      // 404 errors should not be logged as errors
      expect(logSpy).not.toHaveBeenCalled();
      
      logSpy.mockRestore();
    });
  });
});
```

## Usage

1. Place test file in your test directory
2. Ensure error handler middleware is properly exported
3. Run tests with `npm test`

## Best Practices

1. **Test all error scenarios** including edge cases
2. **Verify error response format** is consistent
3. **Check security** - no sensitive data exposure
4. **Test logging behavior** for different error types
5. **Validate production vs development** error details
6. **Include database-specific** error handling tests