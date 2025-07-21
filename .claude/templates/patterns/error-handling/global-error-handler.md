---
id: "global-error-handler"
name: "Global Error Handler"
description: "Comprehensive error handling system for Express/Node.js applications"
category: "error"
frameworks: ["express", "nodejs"]
dependencies: 
  - package: "express"
    version: "^4.18.0"
  - package: "winston"
    version: "^3.11.0"
  - package: "express-async-errors"
    version: "^3.1.1"
tags: ["error-handling", "logging", "express", "middleware", "production-ready"]
testTemplate: "error-handler-testing"
conflicts: []
mergeStrategy: "merge"
targetFiles:
  - path: "src/errors/CustomErrors.ts"
    type: "new"
  - path: "src/middleware/errorHandler.ts"
    type: "new"
  - path: "src/utils/logger.ts"
    type: "new"
  - path: "src/app.ts"
    type: "modify"
    section: "error-handling"
---

## Overview

This template provides a production-ready error handling system with:
- Custom error classes for different scenarios
- Global error middleware
- Async error handling
- Error logging with Winston
- Client-friendly error responses
- Development vs production error details
- Request ID tracking
- Error monitoring integration

## Code

### Custom Error Classes (src/errors/CustomErrors.ts)
```typescript
export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract code: string;
  abstract logging: boolean;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): {
    message: string;
    code: string;
    field?: string;
  }[];
}

export class BadRequestError extends CustomError {
  statusCode = 400;
  code = 'BAD_REQUEST';
  logging = false;

  constructor(public message: string, public field?: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, code: this.code, field: this.field }];
  }
}

export class ValidationError extends CustomError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  logging = false;

  constructor(public errors: Array<{ field: string; message: string }>) {
    super('Validation failed');
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map(err => ({
      message: err.message,
      code: this.code,
      field: err.field
    }));
  }
}

export class NotFoundError extends CustomError {
  statusCode = 404;
  code = 'NOT_FOUND';
  logging = false;

  constructor(public resource: string) {
    super(`${resource} not found`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, code: this.code }];
  }
}

export class UnauthorizedError extends CustomError {
  statusCode = 401;
  code = 'UNAUTHORIZED';
  logging = true;

  constructor(message = 'Unauthorized access') {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, code: this.code }];
  }
}

export class ForbiddenError extends CustomError {
  statusCode = 403;
  code = 'FORBIDDEN';
  logging = true;

  constructor(message = 'Access forbidden') {
    super(message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, code: this.code }];
  }
}

export class ConflictError extends CustomError {
  statusCode = 409;
  code = 'CONFLICT';
  logging = false;

  constructor(public resource: string, public field?: string) {
    super(`${resource} already exists`);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, code: this.code, field: this.field }];
  }
}

export class InternalServerError extends CustomError {
  statusCode = 500;
  code = 'INTERNAL_SERVER_ERROR';
  logging = true;

  constructor(message = 'Something went wrong') {
    super(message);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, code: this.code }];
  }
}

export class ServiceUnavailableError extends CustomError {
  statusCode = 503;
  code = 'SERVICE_UNAVAILABLE';
  logging = true;

  constructor(public service: string) {
    super(`${service} is currently unavailable`);
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, code: this.code }];
  }
}

export class RateLimitError extends CustomError {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';
  logging = true;

  constructor(public retryAfter?: number) {
    super('Too many requests');
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }

  serializeErrors() {
    return [{ 
      message: this.message, 
      code: this.code,
      retryAfter: this.retryAfter 
    }];
  }
}
```

### Error Logger Setup (src/utils/logger.ts)
```typescript
import winston from 'winston';
import { Request } from 'express';

const { combine, timestamp, errors, json, printf } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: process.env.SERVICE_NAME || 'api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' 
        ? json() 
        : combine(
            winston.format.colorize(),
            consoleFormat
          )
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Log unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Helper to log errors with request context
export const logError = (error: Error, req?: Request) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...(req && {
      request: {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.id
      }
    })
  };

  logger.error('Application Error', errorInfo);
};
```

### Global Error Middleware (src/middleware/errorHandler.ts)
```typescript
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/CustomErrors';
import { logError } from '../utils/logger';

interface ErrorResponse {
  success: false;
  errors: Array<{
    message: string;
    code: string;
    field?: string;
  }>;
  requestId: string;
  timestamp: string;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error if needed
  if (err instanceof CustomError && err.logging) {
    logError(err, req);
  } else if (!(err instanceof CustomError)) {
    // Always log non-custom errors
    logError(err, req);
  }

  // Prepare error response
  const response: ErrorResponse = {
    success: false,
    errors: [],
    requestId: req.id || 'no-request-id',
    timestamp: new Date().toISOString()
  };

  // Handle custom errors
  if (err instanceof CustomError) {
    response.errors = err.serializeErrors();
    
    // Add retry-after header for rate limit errors
    if (err.statusCode === 429 && 'retryAfter' in err) {
      res.set('Retry-After', String(err.retryAfter));
    }
    
    return res.status(err.statusCode).json(response);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError' && 'errors' in err) {
    response.errors = Object.values(err.errors as any).map((e: any) => ({
      message: e.message,
      code: 'VALIDATION_ERROR',
      field: e.path
    }));
    
    return res.status(400).json(response);
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError' && 'path' in err) {
    response.errors = [{
      message: 'Invalid value provided',
      code: 'INVALID_VALUE',
      field: (err as any).path
    }];
    
    return res.status(400).json(response);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    response.errors = [{
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    }];
    
    return res.status(401).json(response);
  }

  if (err.name === 'TokenExpiredError') {
    response.errors = [{
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    }];
    
    return res.status(401).json(response);
  }

  // Default error response
  response.errors = [{
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message,
    code: 'INTERNAL_ERROR'
  }];

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(500).json(response);
};

// Not found handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const response: ErrorResponse = {
    success: false,
    errors: [{
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    }],
    requestId: req.id || 'no-request-id',
    timestamp: new Date().toISOString()
  };

  res.status(404).json(response);
};
```

### Async Error Wrapper (src/middleware/asyncHandler.ts)
```typescript
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Wraps async route handlers to catch errors
export const asyncHandler = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Alternative: Use as decorator
export function CatchAsync(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const result = originalMethod.apply(this, args);
    
    if (result && typeof result.catch === 'function') {
      result.catch(args[args.length - 1]); // Pass to next()
    }
    
    return result;
  };

  return descriptor;
}
```

### Request ID Middleware (src/middleware/requestId.ts)
```typescript
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.id = req.headers['x-request-id'] as string || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};
```

### App Setup with Error Handling (src/app.ts)
```typescript
import express from 'express';
import 'express-async-errors'; // Automatically catch async errors
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// Request ID middleware (should be first)
app.use(requestIdMiddleware);

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    requestId: req.id
  });
  next();
});

// Body parsing
app.use(express.json());

// Your routes here
import routes from './routes';
app.use('/api', routes);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
```

### Usage Examples (src/controllers/userController.ts)
```typescript
import { Request, Response, NextFunction } from 'express';
import { 
  BadRequestError, 
  NotFoundError, 
  ValidationError,
  ConflictError 
} from '../errors/CustomErrors';
import { asyncHandler } from '../middleware/asyncHandler';
import { User } from '../models/User';

export const createUser = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, name } = req.body;

  // Validation
  const errors = [];
  if (!email) errors.push({ field: 'email', message: 'Email is required' });
  if (!password) errors.push({ field: 'password', message: 'Password is required' });
  
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('User', 'email');
  }

  // Create user
  const user = await User.create({ email, password, name });

  res.status(201).json({
    success: true,
    data: user
  });
});

export const getUser = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const user = await User.findById(id);
  
  if (!user) {
    throw new NotFoundError('User');
  }

  res.json({
    success: true,
    data: user
  });
});

// Example with try-catch for complex error handling
export const updateUser = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(id, req.body, { 
      new: true,
      runValidators: true 
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    // Handle specific database errors
    if (error.code === 11000) {
      throw new ConflictError('User', Object.keys(error.keyPattern)[0]);
    }
    
    // Re-throw to be handled by global error handler
    throw error;
  }
});
```

### Environment Configuration (.env)
```env
NODE_ENV=development
LOG_LEVEL=debug
SERVICE_NAME=my-api
```

## Usage

1. Install dependencies:
   ```bash
   npm install express winston express-async-errors uuid
   npm install --save-dev @types/express @types/uuid
   ```

2. Set up the error handling structure in your project

3. Use custom errors in your controllers:
   ```typescript
   throw new BadRequestError('Invalid input');
   throw new NotFoundError('User');
   throw new ValidationError([
     { field: 'email', message: 'Invalid email format' }
   ]);
   ```

4. Wrap async routes with asyncHandler or use express-async-errors

## Configuration

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Production Considerations
- Set NODE_ENV=production
- Use proper logging service (e.g., Datadog, CloudWatch)
- Implement error monitoring (e.g., Sentry)
- Add rate limiting
- Sanitize error messages
- Never expose stack traces

## Example

### API Response Examples

Success Response:
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe"
  }
}
```

Validation Error Response:
```json
{
  "success": false,
  "errors": [
    {
      "message": "Email is required",
      "code": "VALIDATION_ERROR",
      "field": "email"
    },
    {
      "message": "Password must be at least 8 characters",
      "code": "VALIDATION_ERROR",
      "field": "password"
    }
  ],
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

Server Error Response (Development):
```json
{
  "success": false,
  "errors": [
    {
      "message": "Cannot read property 'id' of undefined",
      "code": "INTERNAL_ERROR"
    }
  ],
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "stack": "TypeError: Cannot read property 'id' of undefined\n    at ..."
}
```