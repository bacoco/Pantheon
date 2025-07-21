---
id: "api-endpoint-testing"
name: "API Endpoint Integration Testing"
description: "Comprehensive testing patterns for REST API endpoints"
category: "test"
frameworks: ["express", "nodejs", "fastapi"]
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
  - package: "mongodb-memory-server"
    version: "^9.0.0"
    dev: true
tags: ["test", "api-test", "integration-test", "rest", "supertest", "express"]
testTemplate: null
conflicts: []
mergeStrategy: "append"
targetFiles:
  - path: "src/__tests__/{{modelName}}.test.ts"
    type: "new"
  - path: "src/__tests__/setup.ts"
    type: "new"
  - path: "src/__tests__/helpers/testUtils.ts"
    type: "new"
---

## Overview

This template provides comprehensive integration testing patterns for REST API endpoints including:
- Request/response testing
- Authentication testing
- Validation testing
- Error handling
- Database integration
- Performance testing
- API versioning

## Code

### Test Setup (test/setup.ts)
```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../src/app';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean up database between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Test user for authenticated requests
export const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  token: 'test-jwt-token'
};

// Helper to get authenticated app
export const authenticatedRequest = (request: any) => {
  return request.set('Authorization', `Bearer ${testUser.token}`);
};
```

### Basic CRUD API Tests (test/api/users.test.ts)
```typescript
import request from 'supertest';
import { app } from '../../src/app';
import { User } from '../../src/models/User';
import { authenticatedRequest } from '../setup';

describe('Users API', () => {
  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Seed test data
      await User.create([
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Smith', email: 'jane@example.com' }
      ]);
    });

    it('returns all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('email', 'john@example.com');
    });

    it('supports pagination', async () => {
      // Create more users
      for (let i = 0; i < 15; i++) {
        await User.create({ 
          name: `User ${i}`, 
          email: `user${i}@example.com` 
        });
      }

      const response = await request(app)
        .get('/api/users?page=2&limit=10')
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 2,
        limit: 10,
        total: 17,
        totalPages: 2
      });
      expect(response.body.data).toHaveLength(7);
    });

    it('filters by search query', async () => {
      const response = await request(app)
        .get('/api/users?search=john')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('John Doe');
    });
  });

  describe('GET /api/users/:id', () => {
    it('returns user by id', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });

    it('returns 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('returns 400 for invalid id format', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid ID format');
    });
  });

  describe('POST /api/users', () => {
    it('creates a new user with valid data', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'securePassword123'
      };

      const response = await authenticatedRequest(
        request(app).post('/api/users')
      )
        .send(userData)
        .expect(201);

      expect(response.body.data).toMatchObject({
        name: userData.name,
        email: userData.email
      });
      expect(response.body.data).not.toHaveProperty('password');

      // Verify user was saved
      const savedUser = await User.findById(response.body.data.id);
      expect(savedUser).toBeTruthy();
    });

    it('validates required fields', async () => {
      const response = await authenticatedRequest(
        request(app).post('/api/users')
      )
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: expect.stringContaining('required')
        })
      );
    });

    it('prevents duplicate emails', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com'
      });

      const response = await authenticatedRequest(
        request(app).post('/api/users')
      )
        .send({
          name: 'New User',
          email: 'existing@example.com',
          password: 'password123'
        })
        .expect(409);

      expect(response.body.error).toMatch(/already exists/i);
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'New User',
          email: 'new@example.com'
        })
        .expect(401);

      expect(response.body.error).toBe('Please authenticate');
    });
  });

  describe('PUT /api/users/:id', () => {
    let existingUser: any;

    beforeEach(async () => {
      existingUser = await User.create({
        name: 'Original Name',
        email: 'original@example.com'
      });
    });

    it('updates user with valid data', async () => {
      const updates = {
        name: 'Updated Name',
        bio: 'New bio text'
      };

      const response = await authenticatedRequest(
        request(app).put(`/api/users/${existingUser._id}`)
      )
        .send(updates)
        .expect(200);

      expect(response.body.data).toMatchObject({
        name: updates.name,
        bio: updates.bio,
        email: existingUser.email // Email unchanged
      });
    });

    it('validates update data', async () => {
      const response = await authenticatedRequest(
        request(app).put(`/api/users/${existingUser._id}`)
      )
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: expect.stringContaining('valid email')
        })
      );
    });

    it('returns 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await authenticatedRequest(
        request(app).put(`/api/users/${fakeId}`)
      )
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('soft deletes a user', async () => {
      const user = await User.create({
        name: 'To Delete',
        email: 'delete@example.com'
      });

      const response = await authenticatedRequest(
        request(app).delete(`/api/users/${user._id}`)
      )
        .expect(200);

      expect(response.body.message).toBe('User deleted successfully');

      // Verify soft delete
      const deletedUser = await User.findById(user._id);
      expect(deletedUser?.deleted).toBe(true);
    });

    it('requires admin role', async () => {
      const user = await User.create({
        name: 'To Delete',
        email: 'delete@example.com'
      });

      // Mock non-admin user
      const response = await request(app)
        .delete(`/api/users/${user._id}`)
        .set('Authorization', 'Bearer non-admin-token')
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });
  });
});
```

### Advanced Testing Patterns (test/api/advanced.test.ts)
```typescript
import request from 'supertest';
import { app } from '../../src/app';
import nock from 'nock';

describe('Advanced API Testing', () => {
  describe('Performance', () => {
    it('responds within acceptable time', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/users')
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // 100ms threshold
    });

    it('handles concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/api/users')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('External API Integration', () => {
    beforeEach(() => {
      // Mock external API
      nock('https://api.external.com')
        .get('/data')
        .reply(200, { result: 'success' });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('integrates with external service', async () => {
      const response = await request(app)
        .post('/api/sync')
        .expect(200);

      expect(response.body).toHaveProperty('synced', true);
    });

    it('handles external API errors', async () => {
      nock.cleanAll();
      nock('https://api.external.com')
        .get('/data')
        .reply(500);

      const response = await request(app)
        .post('/api/sync')
        .expect(503);

      expect(response.body.error).toBe('External service unavailable');
    });
  });

  describe('File Upload', () => {
    it('handles file uploads', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('test content'), 'test.txt')
        .expect(200);

      expect(response.body).toHaveProperty('filename');
      expect(response.body).toHaveProperty('size');
    });

    it('validates file type', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('test'), 'test.exe')
        .expect(400);

      expect(response.body.error).toMatch(/file type not allowed/i);
    });
  });

  describe('Rate Limiting', () => {
    it('enforces rate limits', async () => {
      // Make requests up to limit
      for (let i = 0; i < 10; i++) {
        await request(app)
          .get('/api/users')
          .expect(200);
      }

      // Next request should be rate limited
      const response = await request(app)
        .get('/api/users')
        .expect(429);

      expect(response.body.error).toMatch(/too many requests/i);
    });
  });

  describe('API Versioning', () => {
    it('supports v1 endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(response.body).toHaveProperty('version', 'v1');
    });

    it('supports v2 endpoints with different response', async () => {
      const response = await request(app)
        .get('/api/v2/users')
        .expect(200);

      expect(response.body).toHaveProperty('version', 'v2');
      expect(response.body).toHaveProperty('meta'); // v2 includes meta
    });
  });
});
```

### Test Utilities (test/utils/helpers.ts)
```typescript
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';

// Generate test data
export const generateUser = (overrides = {}) => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: 'TestPassword123!',
  ...overrides
});

export const generateUsers = (count: number) => 
  Array.from({ length: count }, () => generateUser());

// Generate test tokens
export const generateToken = (userId: string, role = 'user') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// Database seeding
export const seedDatabase = async (models: any) => {
  const users = await models.User.insertMany(generateUsers(10));
  const posts = await models.Post.insertMany(
    users.map(user => ({
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(),
      author: user._id
    }))
  );
  
  return { users, posts };
};

// Request helpers
export const apiRequest = (app: any) => ({
  get: (url: string, token?: string) => {
    const req = request(app).get(url);
    if (token) req.set('Authorization', `Bearer ${token}`);
    return req;
  },
  post: (url: string, data: any, token?: string) => {
    const req = request(app).post(url).send(data);
    if (token) req.set('Authorization', `Bearer ${token}`);
    return req;
  },
  // ... other methods
});
```

## Usage

1. Install dependencies:
   ```bash
   npm install --save-dev supertest @types/supertest mongodb-memory-server
   npm install --save-dev @faker-js/faker nock
   ```

2. Set up test configuration in jest.config.js

3. Create test directory structure:
   ```
   test/
   ├── setup.ts
   ├── api/
   │   ├── users.test.ts
   │   ├── auth.test.ts
   │   └── advanced.test.ts
   └── utils/
       └── helpers.ts
   ```

4. Run tests:
   ```bash
   npm test                    # Run all tests
   npm test -- --coverage      # With coverage
   npm test users.test.ts      # Specific file
   ```

## Configuration

### Jest Configuration (jest.config.js)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/'
  ]
};
```

### Environment Variables (.env.test)
```env
NODE_ENV=test
DATABASE_URL=mongodb://localhost/test
JWT_SECRET=test-secret
API_KEY=test-api-key
```

## Example

### Running specific test suites:
```bash
# Run only user tests
npm test -- users.test.ts

# Run with specific test name pattern
npm test -- --testNamePattern="creates a new user"

# Run in watch mode
npm test -- --watch

# Run with coverage for specific directory
npm test -- --coverage --collectCoverageFrom='src/api/**'
```