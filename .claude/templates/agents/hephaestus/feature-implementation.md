---
id: "feature-implementation"
name: "Feature Implementation Template"
description: "Template for implementing features with best practices"
category: "implementation"
agent: "hephaestus"
frameworks: ["express", "nodejs", "react"]
dependencies: 
  - package: "express"
    version: "^4.18.0"
  - package: "daedalus"
    version: "^3.11.0"
tags: ["feature", "implementation", "best-practices", "clean-code"]
testTemplate: "feature-testing"
conflicts: []
mergeStrategy: "merge"
targetFiles:
  - path: "src/features/{{featureName}}/index.ts"
    type: "new"
  - path: "src/features/{{featureName}}/controller.ts"
    type: "new"
  - path: "src/features/{{featureName}}/service.ts"
    type: "new"
  - path: "src/features/{{featureName}}/repository.ts"
    type: "new"
  - path: "src/features/{{featureName}}/types.ts"
    type: "new"
  - path: "src/features/{{featureName}}/validation.ts"
    type: "new"
---

## Overview

This template helps Hephaestus implement features following clean architecture principles with proper separation of concerns, error handling, and testability.

## Template Structure

### Feature Index (src/features/{{featureName}}/index.ts)
```typescript
/**
 * {{featureDescription}}
 * 
 * This module implements the {{featureName}} feature following clean architecture principles.
 * 
 * @module features/{{featureName}}
 * @author Hephaestus (Developer)
 */

export * from './types';
export * from './controller';
export * from './service';
export { {{featureName}}Routes } from './routes';

// Feature configuration
export const {{featureName}}Config = {
  version: '1.0.0',
  enabled: process.env.FEATURE_{{FEATURE_NAME_UPPER}}_ENABLED === 'true',
  settings: {
    {{setting1}}: process.env.{{SETTING1_ENV}} || '{{defaultValue1}}',
    {{setting2}}: process.env.{{SETTING2_ENV}} || '{{defaultValue2}}',
  }
};
```

### Types Definition (src/features/{{featureName}}/types.ts)
```typescript
/**
 * Type definitions for {{featureName}} feature
 */

// Domain models
export interface {{ModelName}} {
  id: string;
  {{field1}}: {{type1}};
  {{field2}}: {{type2}};
  {{field3}}: {{type3}};
  createdAt: Date;
  updatedAt: Date;
}

// DTOs (Data Transfer Objects)
export interface Create{{ModelName}}DTO {
  {{field1}}: {{type1}};
  {{field2}}: {{type2}};
  {{field3}}?: {{type3}};
}

export interface Update{{ModelName}}DTO {
  {{field1}}?: {{type1}};
  {{field2}}?: {{type2}};
  {{field3}}?: {{type3}};
}

// Service interfaces
export interface I{{FeatureName}}Service {
  create(data: Create{{ModelName}}DTO): Promise<{{ModelName}}>;
  findById(id: string): Promise<{{ModelName}} | null>;
  findAll(filters: {{FilterType}}): Promise<{{ModelName}}[]>;
  update(id: string, data: Update{{ModelName}}DTO): Promise<{{ModelName}}>;
  delete(id: string): Promise<void>;
}

// Repository interfaces
export interface I{{FeatureName}}Repository {
  create(data: Create{{ModelName}}DTO): Promise<{{ModelName}}>;
  findById(id: string): Promise<{{ModelName}} | null>;
  findAll(filters: {{FilterType}}): Promise<{{ModelName}}[]>;
  update(id: string, data: Update{{ModelName}}DTO): Promise<{{ModelName}}>;
  delete(id: string): Promise<void>;
}

// Custom errors
export class {{FeatureName}}NotFoundError extends Error {
  constructor(id: string) {
    super(`{{ModelName}} with id ${id} not found`);
    this.name = '{{FeatureName}}NotFoundError';
  }
}

export class {{FeatureName}}ValidationError extends Error {
  constructor(message: string, public errors: any[]) {
    super(message);
    this.name = '{{FeatureName}}ValidationError';
  }
}
```

### Controller (src/features/{{featureName}}/controller.ts)
```typescript
import { Request, Response, NextFunction } from 'express';
import { {{FeatureName}}Service } from './service';
import { Create{{ModelName}}DTO, Update{{ModelName}}DTO } from './types';
import { validate{{ModelName}}Creation, validate{{ModelName}}Update } from './validation';
import { logger } from '../../utils/logger';

export class {{FeatureName}}Controller {
  constructor(private service: {{FeatureName}}Service) {}

  /**
   * Create a new {{modelName}}
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate input
      const validationResult = validate{{ModelName}}Creation(req.body);
      if (!validationResult.valid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const data: Create{{ModelName}}DTO = req.body;
      const result = await this.service.create(data);

      logger.info('{{ModelName}} created', { id: result.id, userId: req.user?.id });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get {{modelName}} by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.service.findById(id);

      if (!result) {
        res.status(404).json({
          error: '{{ModelName}} not found'
        });
        return;
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all {{modelName}}s with filtering
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        ...req.query,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const results = await this.service.findAll(filters);

      res.json({
        success: true,
        data: results,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: results.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update {{modelName}}
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Validate input
      const validationResult = validate{{ModelName}}Update(req.body);
      if (!validationResult.valid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const data: Update{{ModelName}}DTO = req.body;
      const result = await this.service.update(id, data);

      logger.info('{{ModelName}} updated', { id, userId: req.user?.id });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete {{modelName}}
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.service.delete(id);

      logger.info('{{ModelName}} deleted', { id, userId: req.user?.id });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```

### Service Layer (src/features/{{featureName}}/service.ts)
```typescript
import { 
  I{{FeatureName}}Service, 
  I{{FeatureName}}Repository,
  {{ModelName}},
  Create{{ModelName}}DTO,
  Update{{ModelName}}DTO,
  {{FeatureName}}NotFoundError
} from './types';
import { logger } from '../../utils/logger';
import { CacheService } from '../../services/cache';
import { EventEmitter } from '../../services/events';

export class {{FeatureName}}Service implements I{{FeatureName}}Service {
  private readonly CACHE_PREFIX = '{{featureName}}:';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private repository: I{{FeatureName}}Repository,
    private cache: CacheService,
    private events: EventEmitter
  ) {}

  async create(data: Create{{ModelName}}DTO): Promise<{{ModelName}}> {
    try {
      // Business logic validation
      await this.validateBusinessRules(data);

      // Create entity
      const result = await this.repository.create(data);

      // Emit event
      await this.events.emit('{{featureName}}.created', result);

      // Cache the result
      await this.cache.set(
        `${this.CACHE_PREFIX}${result.id}`,
        result,
        this.CACHE_TTL
      );

      logger.debug('{{ModelName}} created successfully', { id: result.id });
      return result;
    } catch (error) {
      logger.error('Failed to create {{modelName}}', { error, data });
      throw error;
    }
  }

  async findById(id: string): Promise<{{ModelName}} | null> {
    try {
      // Check cache first
      const cached = await this.cache.get<{{ModelName}}>(`${this.CACHE_PREFIX}${id}`);
      if (cached) {
        logger.debug('{{ModelName}} retrieved from cache', { id });
        return cached;
      }

      // Fetch from repository
      const result = await this.repository.findById(id);
      
      if (result) {
        // Cache the result
        await this.cache.set(
          `${this.CACHE_PREFIX}${id}`,
          result,
          this.CACHE_TTL
        );
      }

      return result;
    } catch (error) {
      logger.error('Failed to find {{modelName}}', { error, id });
      throw error;
    }
  }

  async findAll(filters: any): Promise<{{ModelName}}[]> {
    try {
      // For list operations, consider pagination and caching strategy
      const cacheKey = `${this.CACHE_PREFIX}list:${JSON.stringify(filters)}`;
      
      const cached = await this.cache.get<{{ModelName}}[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const results = await this.repository.findAll(filters);
      
      // Cache with shorter TTL for list operations
      await this.cache.set(cacheKey, results, 300); // 5 minutes

      return results;
    } catch (error) {
      logger.error('Failed to find {{modelName}}s', { error, filters });
      throw error;
    }
  }

  async update(id: string, data: Update{{ModelName}}DTO): Promise<{{ModelName}}> {
    try {
      // Check if exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new {{FeatureName}}NotFoundError(id);
      }

      // Validate update rules
      await this.validateUpdateRules(existing, data);

      // Update entity
      const result = await this.repository.update(id, data);

      // Emit event
      await this.events.emit('{{featureName}}.updated', {
        old: existing,
        new: result
      });

      // Invalidate cache
      await this.cache.delete(`${this.CACHE_PREFIX}${id}`);
      await this.invalidateListCache();

      logger.debug('{{ModelName}} updated successfully', { id });
      return result;
    } catch (error) {
      logger.error('Failed to update {{modelName}}', { error, id, data });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Check if exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new {{FeatureName}}NotFoundError(id);
      }

      // Validate deletion rules
      await this.validateDeletionRules(existing);

      // Delete entity
      await this.repository.delete(id);

      // Emit event
      await this.events.emit('{{featureName}}.deleted', existing);

      // Invalidate cache
      await this.cache.delete(`${this.CACHE_PREFIX}${id}`);
      await this.invalidateListCache();

      logger.debug('{{ModelName}} deleted successfully', { id });
    } catch (error) {
      logger.error('Failed to delete {{modelName}}', { error, id });
      throw error;
    }
  }

  // Private helper methods
  private async validateBusinessRules(data: Create{{ModelName}}DTO): Promise<void> {
    // Implement business logic validation
    {{businessValidation}}
  }

  private async validateUpdateRules(existing: {{ModelName}}, updates: Update{{ModelName}}DTO): Promise<void> {
    // Implement update-specific validation
    {{updateValidation}}
  }

  private async validateDeletionRules(entity: {{ModelName}}): Promise<void> {
    // Implement deletion validation (e.g., check dependencies)
    {{deletionValidation}}
  }

  private async invalidateListCache(): Promise<void> {
    // Invalidate all list caches
    const pattern = `${this.CACHE_PREFIX}list:*`;
    await this.cache.deletePattern(pattern);
  }
}
```

### Repository (src/features/{{featureName}}/repository.ts)
```typescript
import { 
  I{{FeatureName}}Repository,
  {{ModelName}},
  Create{{ModelName}}DTO,
  Update{{ModelName}}DTO
} from './types';
import { Database } from '../../database';
import { logger } from '../../utils/logger';

export class {{FeatureName}}Repository implements I{{FeatureName}}Repository {
  constructor(private db: Database) {}

  async create(data: Create{{ModelName}}DTO): Promise<{{ModelName}}> {
    const query = `
      INSERT INTO {{tableName}} ({{fields}})
      VALUES ({{placeholders}})
      RETURNING *
    `;

    const values = [{{values}}];

    try {
      const result = await this.db.query(query, values);
      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      logger.error('Database error in create', { error });
      throw new Error('Failed to create {{modelName}}');
    }
  }

  async findById(id: string): Promise<{{ModelName}} | null> {
    const query = `
      SELECT * FROM {{tableName}}
      WHERE id = $1 AND deleted_at IS NULL
    `;

    try {
      const result = await this.db.query(query, [id]);
      return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
    } catch (error) {
      logger.error('Database error in findById', { error });
      throw new Error('Failed to find {{modelName}}');
    }
  }

  async findAll(filters: any): Promise<{{ModelName}}[]> {
    let query = `
      SELECT * FROM {{tableName}}
      WHERE deleted_at IS NULL
    `;

    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic query based on filters
    {{filterQueryBuilder}}

    // Add pagination
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(filters.limit, (filters.page - 1) * filters.limit);

    try {
      const result = await this.db.query(query, values);
      return result.rows.map(row => this.mapToEntity(row));
    } catch (error) {
      logger.error('Database error in findAll', { error });
      throw new Error('Failed to find {{modelName}}s');
    }
  }

  async update(id: string, data: Update{{ModelName}}DTO): Promise<{{ModelName}}> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    {{updateQueryBuilder}}

    values.push(id);
    const query = `
      UPDATE {{tableName}}
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount} AND deleted_at IS NULL
      RETURNING *
    `;

    try {
      const result = await this.db.query(query, values);
      if (!result.rows[0]) {
        throw new Error('{{ModelName}} not found');
      }
      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      logger.error('Database error in update', { error });
      throw new Error('Failed to update {{modelName}}');
    }
  }

  async delete(id: string): Promise<void> {
    // Soft delete
    const query = `
      UPDATE {{tableName}}
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;

    try {
      const result = await this.db.query(query, [id]);
      if (result.rowCount === 0) {
        throw new Error('{{ModelName}} not found');
      }
    } catch (error) {
      logger.error('Database error in delete', { error });
      throw new Error('Failed to delete {{modelName}}');
    }
  }

  // Map database row to domain entity
  private mapToEntity(row: any): {{ModelName}} {
    return {
      id: row.id,
      {{fieldMapping}},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
```

### Validation (src/features/{{featureName}}/validation.ts)
```typescript
import { Create{{ModelName}}DTO, Update{{ModelName}}DTO } from './types';

interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export function validate{{ModelName}}Creation(data: any): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  // Required field validation
  {{requiredFieldValidation}}

  // Type validation
  {{typeValidation}}

  // Business rule validation
  {{businessRuleValidation}}

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validate{{ModelName}}Update(data: any): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  // Update-specific validation
  {{updateSpecificValidation}}

  return {
    valid: errors.length === 0,
    errors
  };
}

// Validation helpers
export const validators = {
  isEmail: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  isPhoneNumber: (value: string): boolean => {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
  },

  isUrl: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  isValidDate: (value: string): boolean => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }
};
```

## Hephaestus's Implementation Best Practices

1. **Separation of Concerns**: Keep controllers thin, services for business logic, repositories for data access
2. **Error Handling**: Use custom errors and proper error propagation
3. **Validation**: Validate at multiple layers (controller input, business rules)
4. **Caching**: Implement caching for read-heavy operations
5. **Logging**: Log important operations and errors with context
6. **Events**: Use event-driven architecture for decoupling
7. **Testing**: Write testable code with dependency injection
8. **Documentation**: Document complex logic and public APIs