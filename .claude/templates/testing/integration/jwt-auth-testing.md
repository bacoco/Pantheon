---
id: "jwt-auth-testing"
name: "JWT Authentication Testing"
description: "Comprehensive test suite for JWT authentication endpoints"
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
  - package: "jsonwebtoken"
    version: "^9.0.0"
    dev: true
tags: ["test", "auth-test", "jwt", "security-test", "express"]
testTemplate: null
conflicts: []
mergeStrategy: "append"
targetFiles:
  - path: "src/__tests__/auth.test.ts"
    type: "new"
  - path: "src/__tests__/helpers/authTestUtils.ts"
    type: "new"
---

## Overview

This template provides comprehensive testing for JWT authentication including:
- Registration endpoint testing
- Login endpoint testing
- Token refresh testing
- Protected route testing
- Error scenarios
- Security testing

## Code

### Authentication Test Suite (src/__tests__/auth.test.ts)
```typescript
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import { User } from '../models/User';
import { 
  createTestUser, 
  generateValidToken, 
  generateExpiredToken,
  cleanupTestUsers 
} from './helpers/authTestUtils';

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    await cleanupTestUsers();
  });

  afterAll(async () => {
    await cleanupTestUsers();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User created successfully',
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          id: expect.any(String),
          email: newUser.email,
          name: newUser.name
        }
      });

      // Verify password is not returned
      expect(response.body.user.password).toBeUndefined();

      // Verify tokens are valid
      const decoded = jwt.verify(
        response.body.accessToken, 
        process.env.JWT_SECRET!
      ) as any;
      expect(decoded.userId).toBe(response.body.user.id);
    });

    it('should not register user with existing email', async () => {
      const existingUser = await createTestUser();

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: existingUser.email,
          password: 'AnotherPass123!',
          name: 'Another User'
        })
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        error: 'User already exists'
      });
    });

    it('should validate registration input', async () => {
      const invalidUsers = [
        { email: 'invalid-email', password: 'Pass123!', name: 'Test' },
        { email: 'test@example.com', password: 'short', name: 'Test' },
        { email: 'test@example.com', password: 'Pass123!', name: '' }
      ];

      for (const invalidUser of invalidUsers) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(invalidUser)
          .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(Array.isArray(response.body.errors)).toBe(true);
      }
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPass123!'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          id: testUser.id.toString(),
          email: testUser.email,
          name: testUser.name
        }
      });
    });

    it('should not login with invalid password', async () => {
      const testUser = await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid credentials'
      });
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPass123!'
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid credentials'
      });
    });

    it('should handle rate limiting', async () => {
      const testUser = await createTestUser();

      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'WrongPassword'
          });
      }

      // Next attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPass123!'
        })
        .expect(429);

      expect(response.body.error).toContain('Too many');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const testUser = await createTestUser();
      const { refreshToken } = await generateValidToken(testUser.id);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String)
      });

      // Verify new access token is different
      expect(response.body.accessToken).not.toBe(refreshToken);

      // Verify new access token is valid
      const decoded = jwt.verify(
        response.body.accessToken,
        process.env.JWT_SECRET!
      ) as any;
      expect(decoded.userId).toBe(testUser.id.toString());
    });

    it('should not refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid refresh token'
      });
    });

    it('should not refresh with expired refresh token', async () => {
      const testUser = await createTestUser();
      const expiredToken = generateExpiredToken(testUser.id, 'refresh');

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: expiredToken })
        .expect(401);

      expect(response.body.error).toContain('Invalid refresh token');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const testUser = await createTestUser();
      const { accessToken } = await generateValidToken(testUser.id);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        user: {
          id: testUser.id.toString(),
          email: testUser.email,
          name: testUser.name
        }
      });
    });

    it('should not access protected route without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Please authenticate'
      });
    });

    it('should not access with expired token', async () => {
      const testUser = await createTestUser();
      const expiredToken = generateExpiredToken(testUser.id, 'access');

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error).toContain('authenticate');
    });

    it('should not access with malformed token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer malformed.token.here')
        .expect(401);

      expect(response.body.error).toContain('authenticate');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const testUser = await createTestUser();
      const { accessToken, refreshToken } = await generateValidToken(testUser.id);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Logout successful'
      });

      // Verify refresh token is invalidated
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('Security Tests', () => {
    it('should not expose sensitive information on error', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: { $ne: null } // MongoDB injection attempt
        })
        .expect(400);

      // Should not expose database errors
      expect(response.body.error).not.toContain('MongoDB');
      expect(response.body.error).not.toContain('$ne');
    });

    it('should sanitize input to prevent XSS', async () => {
      const xssAttempt = {
        email: 'test@example.com',
        password: 'Pass123!',
        name: '<script>alert("XSS")</script>'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(xssAttempt)
        .expect(201);

      // Name should be escaped/sanitized
      expect(response.body.user.name).not.toContain('<script>');
    });

    it('should enforce strong passwords', async () => {
      const weakPasswords = [
        '12345678',      // No uppercase or special
        'Password',      // No numbers or special
        'Pass123',       // Too short
        'password123!'   // No uppercase
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test@example.com',
            password,
            name: 'Test User'
          })
          .expect(400);

        expect(response.body.errors).toBeDefined();
      }
    });
  });
});
```

### Test Utilities (src/__tests__/helpers/authTestUtils.ts)
```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';

interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
}

export async function createTestUser(
  overrides?: Partial<TestUser>
): Promise<TestUser> {
  const defaultUser = {
    email: 'testuser@example.com',
    password: 'TestPass123!',
    name: 'Test User',
    ...overrides
  };

  const hashedPassword = await bcrypt.hash(
    defaultUser.password, 
    parseInt(process.env.BCRYPT_ROUNDS || '10')
  );

  const user = await User.create({
    ...defaultUser,
    password: hashedPassword
  });

  return {
    id: user.id,
    email: user.email,
    password: defaultUser.password, // Return unhashed for testing
    name: user.name
  };
}

export async function generateValidToken(userId: string) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  // Store refresh token in database if needed
  await storeRefreshToken(userId, refreshToken);

  return { accessToken, refreshToken };
}

export function generateExpiredToken(
  userId: string, 
  type: 'access' | 'refresh'
): string {
  const secret = type === 'access' 
    ? process.env.JWT_SECRET! 
    : process.env.JWT_REFRESH_SECRET!;

  return jwt.sign(
    { userId },
    secret,
    { expiresIn: '-1h' } // Already expired
  );
}

export async function cleanupTestUsers() {
  // Clean up test users from database
  await User.deleteMany({
    email: { $regex: /test.*@example\.com/ }
  });
}

export function extractTokenFromCookie(
  cookies: string[], 
  cookieName: string
): string | null {
  const cookie = cookies.find(c => c.startsWith(`${cookieName}=`));
  if (!cookie) return null;
  
  const value = cookie.split(';')[0].split('=')[1];
  return value;
}

export async function createManyTestUsers(count: number): Promise<TestUser[]> {
  const users: TestUser[] = [];
  
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      email: `testuser${i}@example.com`,
      name: `Test User ${i}`
    });
    users.push(user);
  }
  
  return users;
}

// Mock function - implement based on your database
async function storeRefreshToken(userId: string, token: string) {
  // Implementation depends on your refresh token storage strategy
  // Could be in-memory, Redis, or database
}
```

## Usage

1. Place test files in your test directory
2. Configure Jest to run TypeScript tests
3. Set up test environment variables
4. Run tests with `npm test`

## Configuration

### Jest Configuration (jest.config.js)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  globalSetup: '<rootDir>/src/__tests__/globalSetup.ts',
  globalTeardown: '<rootDir>/src/__tests__/globalTeardown.ts'
};
```

### Test Environment Variables (.env.test)
```env
NODE_ENV=test
JWT_SECRET=test-jwt-secret
JWT_REFRESH_SECRET=test-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
BCRYPT_ROUNDS=4
DATABASE_URL=mongodb://localhost:27017/test-db
```

## Best Practices

1. **Clean up test data** after each test
2. **Use test utilities** for common operations
3. **Test both success and failure scenarios**
4. **Include security testing**
5. **Mock external services** when needed
6. **Use descriptive test names**
7. **Group related tests** with describe blocks