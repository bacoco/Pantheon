# Dependency Management Example

## Scenario: Task Management API with Multiple Templates

### Templates Used:
1. **express-typescript** (scaffolding)
2. **jwt-auth-express** (authentication)
3. **rest-api-crud** (task CRUD)
4. **global-error-handler** (error handling)
5. **api-endpoint-testing** (tests)

### Step 1: Collect Template Dependencies

#### From express-typescript:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0",
    "express-async-errors": "^3.1.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2",
    "jest": "^29.7.0",
    "rimraf": "^5.0.5"
  }
}
```

#### From jwt-auth-express:
```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "express-validator": "^7.0.0"
  }
}
```

#### From rest-api-crud:
```json
{
  "dependencies": {
    "mongoose": "^7.0.0"
  }
}
```

### Step 2: Parse Imports from Generated Code

#### From generated taskController.ts:
```typescript
import express from 'express';
import { Task } from '../models/Task';
import { validationResult } from 'express-validator';
import { NotFoundError, BadRequestError } from '../errors/CustomErrors';
import { asyncHandler } from '../middleware/asyncHandler';
```

#### From generated auth middleware:
```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
```

### Step 3: Detect Additional Packages

Parsed imports reveal these packages are used but not in template deps:
- ❌ None missing (all imports are from installed packages or local files)

### Step 4: Version Conflict Resolution

#### Conflict Found:
- Template A wants: `express-validator@^7.0.0`
- Template B wants: `express-validator@^7.0.1`
- **Resolution**: Use `^7.0.1` (newer patch version)

### Step 5: Generate package.json

```json
{
  "name": "task-api",
  "version": "1.0.0",
  "description": "Task Management REST API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon",
    "build": "rimraf dist && tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0",
    "express-async-errors": "^3.1.1",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "express-validator": "^7.0.1",
    "mongoose": "^7.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.3.0",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.10",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.16",
    "eslint": "^8.55.0",
    "@typescript-eslint/parser": "^6.13.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "rimraf": "^5.0.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 6: Installation Process

```bash
# Detected: npm (found package-lock.json)

# Check existing dependencies
📦 Checking installed packages...
📦 Missing dependencies: 12
📦 Missing dev dependencies: 8

# Install production dependencies
npm install express@^4.18.2 cors@^2.8.5 helmet@^7.1.0 compression@^1.7.4 express-rate-limit@^7.1.5 dotenv@^16.3.1 winston@^3.11.0 express-async-errors@^3.1.1 jsonwebtoken@^9.0.0 bcryptjs@^2.4.3 express-validator@^7.0.1 mongoose@^7.0.0

# Install dev dependencies
npm install -D @types/express@^4.17.21 @types/node@^20.10.0 @types/cors@^2.8.17 @types/compression@^1.7.5 @types/jsonwebtoken@^9.0.5 @types/bcryptjs@^2.4.6 typescript@^5.3.0 nodemon@^3.0.2 ts-node@^10.9.2 jest@^29.7.0 ts-jest@^29.1.1 @types/jest@^29.5.10 supertest@^6.3.3 @types/supertest@^2.0.16 eslint@^8.55.0 @typescript-eslint/parser@^6.13.0 @typescript-eslint/eslint-plugin@^6.13.0 rimraf@^5.0.5
```

### Step 7: Handle Edge Cases

#### Case 1: Package Manager Detection
```
If pnpm-lock.yaml exists → use pnpm
If yarn.lock exists → use yarn  
If bun.lockb exists → use bun
Otherwise → use npm
```

#### Case 2: Version Conflict
```
Template A: "lodash": "^4.17.21"
Template B: "lodash": "4.17.20" (exact)
Resolution: Use exact version (more restrictive)
```

#### Case 3: Import Without Template
```typescript
import { v4 as uuidv4 } from 'uuid';  // Not in any template
```
Action: Add `uuid@latest` to dependencies

#### Case 4: Installation Failure
```
❌ Failed to install: bcryptjs
Reason: Network timeout

Manual installation required:
npm install bcryptjs@^2.4.3

Or try with different registry:
npm install bcryptjs@^2.4.3 --registry https://registry.npmjs.org
```

## Benefits

1. **Automatic Detection**: No manual tracking of dependencies
2. **Version Resolution**: Handles conflicts intelligently
3. **Type Safety**: Includes TypeScript types automatically
4. **Package Manager Agnostic**: Works with npm, yarn, pnpm, bun
5. **Graceful Failures**: Provides manual commands when auto-install fails
6. **Import Analysis**: Catches dependencies used but not declared