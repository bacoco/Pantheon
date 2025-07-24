---
id: "comprehensive-test-suite"
name: "Comprehensive Test Suite Template"
description: "Template for generating complete test coverage with unit, integration, and e2e tests"
category: "testing"
agent: "themis"
frameworks: ["jest", "cypress", "supertest"]
dependencies: 
  - package: "jest"
    version: "^29.0.0"
    dev: true
  - package: "@types/jest"
    version: "^29.0.0"
    dev: true
  - package: "supertest"
    version: "^6.3.0"
    dev: true
  - package: "cypress"
    version: "^13.0.0"
    dev: true
tags: ["testing", "qa", "test-suite", "coverage", "quality"]
testTemplate: null
conflicts: []
mergeStrategy: "new"
targetFiles:
  - path: "src/features/{{featureName}}/__tests__/unit/{{featureName}}.service.test.ts"
    type: "new"
  - path: "src/features/{{featureName}}/__tests__/integration/{{featureName}}.api.test.ts"
    type: "new"
  - path: "cypress/e2e/{{featureName}}.cy.ts"
    type: "new"
  - path: "src/features/{{featureName}}/__tests__/fixtures/{{featureName}}.fixtures.ts"
    type: "new"
  - path: "src/features/{{featureName}}/__tests__/test-plan.md"
    type: "new"
---

## Overview

This template helps Themis create comprehensive test suites that ensure quality through multiple testing layers: unit tests, integration tests, and end-to-end tests.

## Test Plan Document (src/features/{{featureName}}/__tests__/test-plan.md)

```markdown
# Test Plan: {{featureName}}

**Created by**: Themis (QA Engineer)  
**Date**: {{date}}  
**Feature Version**: {{version}}  
**Coverage Target**: {{coverageTarget}}%

## Test Strategy

### Testing Levels
1. **Unit Tests**: Test individual functions and methods in isolation
2. **Integration Tests**: Test component interactions and API endpoints
3. **E2E Tests**: Test complete user workflows
4. **Performance Tests**: Validate response times and throughput
5. **Security Tests**: Verify authentication and authorization

### Test Environment
- **Unit/Integration**: Node.js with Jest
- **E2E**: Browser automation with Cypress
- **Performance**: K6 or Artillery
- **Security**: OWASP ZAP integration

## Test Scenarios

### Unit Test Scenarios
{{unitTestScenarios}}

### Integration Test Scenarios
{{integrationTestScenarios}}

### E2E Test Scenarios
{{e2eTestScenarios}}

### Edge Cases
{{edgeCases}}

### Error Scenarios
{{errorScenarios}}

## Test Data Strategy
{{testDataStrategy}}

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| {{risk1}} | {{impact1}} | {{mitigation1}} |
| {{risk2}} | {{impact2}} | {{mitigation2}} |

## Success Criteria
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Code coverage > {{coverageTarget}}%
- [ ] No critical security vulnerabilities
- [ ] Performance within SLA
```

## Test Fixtures (src/features/{{featureName}}/__tests__/fixtures/{{featureName}}.fixtures.ts)

```typescript
/**
 * Test fixtures and factories for {{featureName}}
 * Provides consistent test data across all test suites
 */

import { {{ModelName}}, Create{{ModelName}}DTO } from '../../types';
import { faker } from '@faker-js/faker';

// Base fixtures
export const valid{{ModelName}}: {{ModelName}} = {
  id: 'test-id-123',
  {{field1}}: {{testValue1}},
  {{field2}}: {{testValue2}},
  {{field3}}: {{testValue3}},
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const create{{ModelName}}DTO: Create{{ModelName}}DTO = {
  {{field1}}: {{testValue1}},
  {{field2}}: {{testValue2}},
  {{field3}}: {{testValue3}}
};

// Factory functions
export class {{ModelName}}Factory {
  static create(overrides?: Partial<{{ModelName}}>): {{ModelName}} {
    return {
      id: faker.string.uuid(),
      {{field1}}: {{fakerValue1}},
      {{field2}}: {{fakerValue2}},
      {{field3}}: {{fakerValue3}},
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides
    };
  }

  static createMany(count: number, overrides?: Partial<{{ModelName}}>): {{ModelName}}[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createDTO(overrides?: Partial<Create{{ModelName}}DTO>): Create{{ModelName}}DTO {
    return {
      {{field1}}: {{fakerValue1}},
      {{field2}}: {{fakerValue2}},
      {{field3}}: {{fakerValue3}},
      ...overrides
    };
  }
}

// Edge case fixtures
export const edgeCases = {
  minimal: {
    {{minimalFields}}
  },
  maximal: {
    {{maximalFields}}
  },
  withSpecialCharacters: {
    {{specialCharFields}}
  },
  withBoundaryValues: {
    {{boundaryFields}}
  }
};

// Error case fixtures
export const invalidData = {
  missingRequired: {
    {{missingRequiredFields}}
  },
  invalidTypes: {
    {{invalidTypeFields}}
  },
  exceedsLimits: {
    {{exceedsLimitFields}}
  }
};
```

## Unit Tests (src/features/{{featureName}}/__tests__/unit/{{featureName}}.service.test.ts)

```typescript
import { {{FeatureName}}Service } from '../../service';
import { {{FeatureName}}Repository } from '../../repository';
import { CacheService } from '../../../../services/cache';
import { EventEmitter } from '../../../../services/events';
import { {{ModelName}}Factory, valid{{ModelName}}, create{{ModelName}}DTO, edgeCases, invalidData } from '../fixtures/{{featureName}}.fixtures';
import { {{FeatureName}}NotFoundError, {{FeatureName}}ValidationError } from '../../types';

// Mock dependencies
jest.mock('../../repository');
jest.mock('../../../../services/cache');
jest.mock('../../../../services/events');
jest.mock('../../../../utils/logger');

describe('{{FeatureName}}Service', () => {
  let service: {{FeatureName}}Service;
  let repository: jest.Mocked<{{FeatureName}}Repository>;
  let cache: jest.Mocked<CacheService>;
  let events: jest.Mocked<EventEmitter>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mocked instances
    repository = new {{FeatureName}}Repository({} as any) as jest.Mocked<{{FeatureName}}Repository>;
    cache = new CacheService() as jest.Mocked<CacheService>;
    events = new EventEmitter() as jest.Mocked<EventEmitter>;

    // Create service instance
    service = new {{FeatureName}}Service(repository, cache, events);
  });

  describe('create', () => {
    it('should create a new {{modelName}} successfully', async () => {
      // Arrange
      const dto = create{{ModelName}}DTO;
      const expected = valid{{ModelName}};
      repository.create.mockResolvedValue(expected);
      cache.set.mockResolvedValue(undefined);
      events.emit.mockResolvedValue(undefined);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(expected);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(cache.set).toHaveBeenCalledWith(
        `{{featureName}}:${expected.id}`,
        expected,
        3600
      );
      expect(events.emit).toHaveBeenCalledWith('{{featureName}}.created', expected);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidDto = invalidData.missingRequired;

      // Act & Assert
      await expect(service.create(invalidDto as any)).rejects.toThrow({{FeatureName}}ValidationError);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      // Arrange
      const dto = create{{ModelName}}DTO;
      const error = new Error('Database error');
      repository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(error);
      expect(cache.set).not.toHaveBeenCalled();
      expect(events.emit).not.toHaveBeenCalled();
    });

    // Edge cases
    describe('edge cases', () => {
      it.each([
        ['minimal data', edgeCases.minimal],
        ['maximal data', edgeCases.maximal],
        ['special characters', edgeCases.withSpecialCharacters],
        ['boundary values', edgeCases.withBoundaryValues]
      ])('should handle %s', async (description, data) => {
        // Arrange
        repository.create.mockResolvedValue(valid{{ModelName}});

        // Act
        const result = await service.create(data as any);

        // Assert
        expect(result).toBeDefined();
        expect(repository.create).toHaveBeenCalledWith(data);
      });
    });
  });

  describe('findById', () => {
    it('should return cached {{modelName}} if available', async () => {
      // Arrange
      const id = 'test-id';
      const cached = valid{{ModelName}};
      cache.get.mockResolvedValue(cached);

      // Act
      const result = await service.findById(id);

      // Assert
      expect(result).toEqual(cached);
      expect(cache.get).toHaveBeenCalledWith(`{{featureName}}:${id}`);
      expect(repository.findById).not.toHaveBeenCalled();
    });

    it('should fetch from repository if not cached', async () => {
      // Arrange
      const id = 'test-id';
      const entity = valid{{ModelName}};
      cache.get.mockResolvedValue(null);
      repository.findById.mockResolvedValue(entity);
      cache.set.mockResolvedValue(undefined);

      // Act
      const result = await service.findById(id);

      // Assert
      expect(result).toEqual(entity);
      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(cache.set).toHaveBeenCalledWith(
        `{{featureName}}:${id}`,
        entity,
        3600
      );
    });

    it('should return null for non-existent {{modelName}}', async () => {
      // Arrange
      const id = 'non-existent';
      cache.get.mockResolvedValue(null);
      repository.findById.mockResolvedValue(null);

      // Act
      const result = await service.findById(id);

      // Assert
      expect(result).toBeNull();
      expect(cache.set).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update {{modelName}} successfully', async () => {
      // Arrange
      const id = 'test-id';
      const existing = valid{{ModelName}};
      const updates = { {{field1}}: 'updated-value' };
      const updated = { ...existing, ...updates };

      cache.get.mockResolvedValue(null);
      repository.findById.mockResolvedValue(existing);
      repository.update.mockResolvedValue(updated);
      cache.delete.mockResolvedValue(true);
      events.emit.mockResolvedValue(undefined);

      // Act
      const result = await service.update(id, updates);

      // Assert
      expect(result).toEqual(updated);
      expect(repository.update).toHaveBeenCalledWith(id, updates);
      expect(cache.delete).toHaveBeenCalledWith(`{{featureName}}:${id}`);
      expect(events.emit).toHaveBeenCalledWith('{{featureName}}.updated', {
        old: existing,
        new: updated
      });
    });

    it('should throw error if {{modelName}} not found', async () => {
      // Arrange
      const id = 'non-existent';
      cache.get.mockResolvedValue(null);
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(id, {})).rejects.toThrow({{FeatureName}}NotFoundError);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete {{modelName}} successfully', async () => {
      // Arrange
      const id = 'test-id';
      const existing = valid{{ModelName}};

      cache.get.mockResolvedValue(null);
      repository.findById.mockResolvedValue(existing);
      repository.delete.mockResolvedValue(undefined);
      cache.delete.mockResolvedValue(true);
      events.emit.mockResolvedValue(undefined);

      // Act
      await service.delete(id);

      // Assert
      expect(repository.delete).toHaveBeenCalledWith(id);
      expect(cache.delete).toHaveBeenCalledWith(`{{featureName}}:${id}`);
      expect(events.emit).toHaveBeenCalledWith('{{featureName}}.deleted', existing);
    });

    it('should throw error if {{modelName}} not found', async () => {
      // Arrange
      const id = 'non-existent';
      cache.get.mockResolvedValue(null);
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete(id)).rejects.toThrow({{FeatureName}}NotFoundError);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  // Performance tests
  describe('performance', () => {
    it('should handle batch operations efficiently', async () => {
      // Arrange
      const items = {{ModelName}}Factory.createMany(100);
      const startTime = Date.now();

      // Act
      await Promise.all(items.map(item => 
        service.create(item)
      ));
      const duration = Date.now() - startTime;

      // Assert
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
```

## Integration Tests (src/features/{{featureName}}/__tests__/integration/{{featureName}}.api.test.ts)

```typescript
import request from 'supertest';
import { app } from '../../../../app';
import { Database } from '../../../../database';
import { {{ModelName}}Factory, create{{ModelName}}DTO, edgeCases } from '../fixtures/{{featureName}}.fixtures';
import { generateAuthToken } from '../../../auth/test-utils';

describe('{{FeatureName}} API Integration Tests', () => {
  let db: Database;
  let authToken: string;
  
  beforeAll(async () => {
    // Setup test database
    db = new Database(process.env.TEST_DATABASE_URL);
    await db.migrate();
    
    // Create test user and get auth token
    authToken = await generateAuthToken({ id: 'test-user', role: 'admin' });
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await db.query('DELETE FROM {{tableName}}');
  });

  describe('POST /api/{{featureName}}', () => {
    it('should create a new {{modelName}}', async () => {
      // Arrange
      const dto = create{{ModelName}}DTO;

      // Act
      const response = await request(app)
        .post('/api/{{featureName}}')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(String),
          ...dto
        })
      });

      // Verify in database
      const dbResult = await db.query('SELECT * FROM {{tableName}} WHERE id = $1', [response.body.data.id]);
      expect(dbResult.rows).toHaveLength(1);
    });

    it('should validate required fields', async () => {
      // Act
      const response = await request(app)
        .post('/api/{{featureName}}')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String)
          })
        ])
      });
    });

    it('should require authentication', async () => {
      // Act
      const response = await request(app)
        .post('/api/{{featureName}}')
        .send(create{{ModelName}}DTO)
        .expect(401);

      // Assert
      expect(response.body.error).toContain('authenticate');
    });

    // Test rate limiting
    it('should enforce rate limiting', async () => {
      // Make multiple requests
      const requests = Array(11).fill(null).map(() =>
        request(app)
          .post('/api/{{featureName}}')
          .set('Authorization', `Bearer ${authToken}`)
          .send(create{{ModelName}}DTO)
      );

      const responses = await Promise.all(requests);
      
      // First 10 should succeed, 11th should be rate limited
      const statusCodes = responses.map(r => r.status);
      expect(statusCodes.filter(code => code === 201)).toHaveLength(10);
      expect(statusCodes.filter(code => code === 429)).toHaveLength(1);
    });
  });

  describe('GET /api/{{featureName}}/:id', () => {
    it('should retrieve existing {{modelName}}', async () => {
      // Arrange
      const created = await createTest{{ModelName}}(db);

      // Act
      const response = await request(app)
        .get(`/api/{{featureName}}/${created.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: created.id
        })
      });
    });

    it('should return 404 for non-existent {{modelName}}', async () => {
      // Act
      const response = await request(app)
        .get('/api/{{featureName}}/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Assert
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /api/{{featureName}}', () => {
    it('should list {{modelName}}s with pagination', async () => {
      // Arrange
      await createTest{{ModelName}}s(db, 25);

      // Act
      const response = await request(app)
        .get('/api/{{featureName}}')
        .query({ page: 2, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        pagination: {
          page: 2,
          limit: 10,
          total: expect.any(Number)
        }
      });
      expect(response.body.data).toHaveLength(10);
    });

    it('should filter results', async () => {
      // Arrange
      await createTest{{ModelName}}sWithCategories(db);

      // Act
      const response = await request(app)
        .get('/api/{{featureName}}')
        .query({ {{filterParam}}: '{{filterValue}}' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(expect.any(Number));
      expect(response.body.data.every(item => 
        item.{{filterParam}} === '{{filterValue}}'
      )).toBe(true);
    });
  });

  describe('PUT /api/{{featureName}}/:id', () => {
    it('should update existing {{modelName}}', async () => {
      // Arrange
      const existing = await createTest{{ModelName}}(db);
      const updates = { {{field1}}: 'updated-value' };

      // Act
      const response = await request(app)
        .put(`/api/{{featureName}}/${existing.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      // Assert
      expect(response.body.data).toMatchObject(updates);
      
      // Verify in database
      const dbResult = await db.query('SELECT * FROM {{tableName}} WHERE id = $1', [existing.id]);
      expect(dbResult.rows[0].{{field1}}).toBe('updated-value');
    });

    it('should validate update data', async () => {
      // Arrange
      const existing = await createTest{{ModelName}}(db);

      // Act
      const response = await request(app)
        .put(`/api/{{featureName}}/${existing.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ {{field1}}: null }) // Invalid update
        .expect(400);

      // Assert
      expect(response.body.error).toContain('Validation failed');
    });
  });

  describe('DELETE /api/{{featureName}}/:id', () => {
    it('should soft delete {{modelName}}', async () => {
      // Arrange
      const existing = await createTest{{ModelName}}(db);

      // Act
      await request(app)
        .delete(`/api/{{featureName}}/${existing.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Assert - verify soft delete
      const dbResult = await db.query(
        'SELECT * FROM {{tableName}} WHERE id = $1', 
        [existing.id]
      );
      expect(dbResult.rows[0].deleted_at).not.toBeNull();
    });

    it('should require proper authorization', async () => {
      // Arrange
      const existing = await createTest{{ModelName}}(db);
      const userToken = await generateAuthToken({ id: 'user', role: 'user' });

      // Act
      await request(app)
        .delete(`/api/{{featureName}}/${existing.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  // Performance tests
  describe('Performance', () => {
    it('should handle concurrent requests', async () => {
      // Create 50 concurrent requests
      const requests = Array(50).fill(null).map(() =>
        request(app)
          .post('/api/{{featureName}}')
          .set('Authorization', `Bearer ${authToken}`)
          .send({{ModelName}}Factory.createDTO())
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      // All should succeed
      expect(responses.every(r => r.status === 201)).toBe(true);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds for 50 requests
    });
  });
});

// Helper functions
async function createTest{{ModelName}}(db: Database) {
  const data = {{ModelName}}Factory.create();
  const result = await db.query(
    'INSERT INTO {{tableName}} ({{fields}}) VALUES ({{placeholders}}) RETURNING *',
    [{{values}}]
  );
  return result.rows[0];
}

async function createTest{{ModelName}}s(db: Database, count: number) {
  const items = {{ModelName}}Factory.createMany(count);
  // Bulk insert implementation
}
```

## E2E Tests (cypress/e2e/{{featureName}}.cy.ts)

```typescript
import { {{ModelName}}Factory } from '../../src/features/{{featureName}}/__tests__/fixtures/{{featureName}}.fixtures';

describe('{{FeatureName}} E2E Tests', () => {
  beforeEach(() => {
    // Reset database
    cy.task('db:reset');
    
    // Create test user and login
    cy.task('db:seed:user', { role: 'admin' });
    cy.login('admin@test.com', 'password123');
    
    // Visit {{featureName}} page
    cy.visit('/{{featureName}}');
  });

  describe('{{ModelName}} CRUD Operations', () => {
    it('should create a new {{modelName}}', () => {
      // Click create button
      cy.get('[data-cy=create-{{modelName}}-btn]').click();
      
      // Fill form
      cy.get('[data-cy={{field1}}-input]').type('{{testValue1}}');
      cy.get('[data-cy={{field2}}-input]').type('{{testValue2}}');
      cy.get('[data-cy={{field3}}-input]').type('{{testValue3}}');
      
      // Submit
      cy.get('[data-cy=submit-btn]').click();
      
      // Verify success message
      cy.get('[data-cy=success-message]')
        .should('be.visible')
        .and('contain', '{{ModelName}} created successfully');
      
      // Verify in list
      cy.get('[data-cy={{modelName}}-list]')
        .should('contain', '{{testValue1}}');
    });

    it('should display {{modelName}} list with pagination', () => {
      // Seed data
      cy.task('db:seed:{{modelName}}s', { count: 25 });
      cy.reload();
      
      // Verify first page
      cy.get('[data-cy={{modelName}}-item]').should('have.length', 10);
      
      // Navigate to second page
      cy.get('[data-cy=pagination-next]').click();
      
      // Verify second page
      cy.get('[data-cy={{modelName}}-item]').should('have.length', 10);
      cy.get('[data-cy=pagination-current]').should('contain', '2');
    });

    it('should search and filter {{modelName}}s', () => {
      // Seed data with different categories
      cy.task('db:seed:{{modelName}}s', { 
        items: [
          { {{field1}}: 'Alpha', category: 'A' },
          { {{field1}}: 'Beta', category: 'B' },
          { {{field1}}: 'Gamma', category: 'A' }
        ]
      });
      cy.reload();
      
      // Search by name
      cy.get('[data-cy=search-input]').type('Beta');
      cy.get('[data-cy={{modelName}}-item]').should('have.length', 1);
      cy.get('[data-cy={{modelName}}-item]').should('contain', 'Beta');
      
      // Clear search
      cy.get('[data-cy=search-clear]').click();
      
      // Filter by category
      cy.get('[data-cy=category-filter]').select('A');
      cy.get('[data-cy={{modelName}}-item]').should('have.length', 2);
    });

    it('should edit existing {{modelName}}', () => {
      // Seed data
      const item = {{ModelName}}Factory.create();
      cy.task('db:seed:{{modelName}}', item);
      cy.reload();
      
      // Click edit button
      cy.get(`[data-cy=edit-${item.id}]`).click();
      
      // Update form
      cy.get('[data-cy={{field1}}-input]').clear().type('Updated Value');
      
      // Submit
      cy.get('[data-cy=submit-btn]').click();
      
      // Verify success
      cy.get('[data-cy=success-message]')
        .should('contain', 'Updated successfully');
      
      // Verify in list
      cy.get(`[data-cy={{modelName}}-${item.id}]`)
        .should('contain', 'Updated Value');
    });

    it('should delete {{modelName}} with confirmation', () => {
      // Seed data
      const item = {{ModelName}}Factory.create();
      cy.task('db:seed:{{modelName}}', item);
      cy.reload();
      
      // Click delete button
      cy.get(`[data-cy=delete-${item.id}]`).click();
      
      // Confirm deletion
      cy.get('[data-cy=confirm-dialog]').should('be.visible');
      cy.get('[data-cy=confirm-delete-btn]').click();
      
      // Verify success
      cy.get('[data-cy=success-message]')
        .should('contain', 'Deleted successfully');
      
      // Verify removed from list
      cy.get(`[data-cy={{modelName}}-${item.id}]`).should('not.exist');
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors', () => {
      cy.get('[data-cy=create-{{modelName}}-btn]').click();
      
      // Submit empty form
      cy.get('[data-cy=submit-btn]').click();
      
      // Verify error messages
      cy.get('[data-cy={{field1}}-error]')
        .should('be.visible')
        .and('contain', 'required');
      
      // Fill one field
      cy.get('[data-cy={{field1}}-input]').type('Value');
      
      // Error should disappear
      cy.get('[data-cy={{field1}}-error]').should('not.exist');
    });

    it('should validate field formats', () => {
      cy.get('[data-cy=create-{{modelName}}-btn]').click();
      
      // Enter invalid email
      cy.get('[data-cy=email-input]').type('invalid-email');
      cy.get('[data-cy=submit-btn]').click();
      
      cy.get('[data-cy=email-error]')
        .should('contain', 'valid email');
      
      // Enter invalid phone
      cy.get('[data-cy=phone-input]').type('123');
      cy.get('[data-cy=submit-btn]').click();
      
      cy.get('[data-cy=phone-error]')
        .should('contain', 'valid phone');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Simulate network error
      cy.intercept('POST', '/api/{{featureName}}', { 
        forceNetworkError: true 
      }).as('networkError');
      
      cy.get('[data-cy=create-{{modelName}}-btn]').click();
      cy.get('[data-cy={{field1}}-input]').type('Test');
      cy.get('[data-cy=submit-btn]').click();
      
      cy.wait('@networkError');
      
      // Should show error message
      cy.get('[data-cy=error-message]')
        .should('be.visible')
        .and('contain', 'Network error');
      
      // Should allow retry
      cy.get('[data-cy=retry-btn]').should('be.visible');
    });

    it('should handle server errors', () => {
      // Simulate server error
      cy.intercept('POST', '/api/{{featureName}}', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');
      
      cy.get('[data-cy=create-{{modelName}}-btn]').click();
      cy.get('[data-cy={{field1}}-input]').type('Test');
      cy.get('[data-cy=submit-btn]').click();
      
      cy.wait('@serverError');
      
      cy.get('[data-cy=error-message]')
        .should('contain', 'server error');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      // Tab through form
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'create-{{modelName}}-btn');
      
      // Open form with Enter
      cy.focused().type('{enter}');
      
      // Tab through form fields
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', '{{field1}}-input');
      
      // Fill and submit with keyboard
      cy.focused().type('Test Value').tab();
      cy.focused().type('Another Value').tab();
      cy.focused().type('{enter}'); // Submit
    });

    it('should announce form errors to screen readers', () => {
      cy.get('[data-cy=create-{{modelName}}-btn]').click();
      cy.get('[data-cy=submit-btn]').click();
      
      // Check ARIA attributes
      cy.get('[data-cy={{field1}}-input]')
        .should('have.attr', 'aria-invalid', 'true')
        .and('have.attr', 'aria-describedby', '{{field1}}-error');
      
      cy.get('[data-cy={{field1}}-error]')
        .should('have.attr', 'role', 'alert');
    });
  });

  describe('Performance', () => {
    it('should load page quickly', () => {
      cy.visit('/{{featureName}}', {
        onBeforeLoad: (win) => {
          win.performance.mark('start');
        },
        onLoad: (win) => {
          win.performance.mark('end');
          win.performance.measure('pageLoad', 'start', 'end');
          
          const measure = win.performance.getEntriesByName('pageLoad')[0];
          expect(measure.duration).to.be.lessThan(3000); // 3 seconds
        }
      });
    });

    it('should handle large datasets efficiently', () => {
      // Seed 1000 items
      cy.task('db:seed:{{modelName}}s', { count: 1000 });
      
      const start = Date.now();
      cy.visit('/{{featureName}}');
      cy.get('[data-cy={{modelName}}-list]').should('be.visible');
      const duration = Date.now() - start;
      
      expect(duration).to.be.lessThan(5000); // 5 seconds
      
      // Verify pagination is working
      cy.get('[data-cy={{modelName}}-item]').should('have.length', 10);
      cy.get('[data-cy=total-count]').should('contain', '1000');
    });
  });
});
```

## Themis's Testing Best Practices

1. **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
2. **Test Isolation**: Each test should be independent and repeatable
3. **Test Data**: Use factories and fixtures for consistent test data
4. **Coverage Goals**: Aim for 80%+ coverage, but focus on critical paths
5. **Performance Testing**: Include performance tests for critical operations
6. **Accessibility Testing**: Ensure features are accessible to all users
7. **Error Scenarios**: Test both happy paths and error conditions
8. **Continuous Testing**: Run tests on every commit and deployment