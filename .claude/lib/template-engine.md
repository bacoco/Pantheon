# Template Engine for BACO

This library provides the template selection and integration engine for BACO's code generation.

## Overview

The template engine analyzes project requirements and automatically selects, customizes, and integrates appropriate templates from the `.claude/templates/` directory.

## Template Selection Process

### 1. Requirement Analysis
When processing a baco.md file or interactive input, the engine:
- Identifies project type (Web App, API, CLI, etc.)
- Detects frameworks and technologies
- Analyzes feature requirements
- Notes constraints and patterns

### 2. Template Matching
The engine matches requirements to templates by:
- Framework compatibility
- Feature tags
- Category alignment
- Dependency availability

### 3. Template Customization
Selected templates are customized by:
- Adapting to project naming conventions
- Adjusting for specified constraints
- Integrating with existing code patterns
- Applying project-specific configurations

## Template Integration Patterns

### Authentication Feature Example
```yaml
# From baco.md
FEATURE: User Authentication
- JWT-based authentication
- Social login (Google, GitHub)
- Password reset functionality
```

The engine would:
1. Select `jwt-auth-express.md` template
2. Add OAuth integration patterns
3. Include password reset template
4. Adapt to project structure

### CRUD Feature Example
```yaml
# From baco.md
FEATURE: Product Management
- Create, read, update, delete products
- Image upload
- Category filtering
- Search functionality
```

The engine would:
1. Select `rest-api-crud.md` template
2. Add image upload middleware
3. Enhance with search patterns
4. Customize model for products

## Template Registry

### Available Templates by Category

#### Authentication (`patterns/auth/`)
- `jwt-auth-express.md` - JWT with refresh tokens
- `oauth2-integration.md` - OAuth2 providers
- `session-auth.md` - Session-based auth
- `magic-link.md` - Passwordless auth

#### CRUD Operations (`patterns/crud/`)
- `rest-api-crud.md` - REST CRUD with pagination
- `graphql-crud.md` - GraphQL mutations/queries
- `repository-pattern.md` - Database abstraction

#### API Patterns (`patterns/api/`)
- `rest-structure.md` - RESTful API structure
- `graphql-schema.md` - GraphQL setup
- `websocket-server.md` - Real-time connections
- `rate-limiting.md` - API rate limits

#### Database (`patterns/database/`)
- `connection-pool.md` - Database pooling
- `migrations.md` - Schema migrations
- `orm-setup.md` - ORM configuration

#### Framework-Specific (`frameworks/`)
- **Next.js**: Forms, layouts, API routes
- **Express**: Middleware, routing, error handling
- **FastAPI**: Schemas, dependencies, async
- **React**: Components, hooks, context

#### Testing (`testing/`)
- `unit/react-component-testing.md` - React Testing Library
- `integration/api-testing.md` - API integration tests
- `e2e/cypress-setup.md` - End-to-end testing

## Usage in Commands

### In `/baco init`
```markdown
When user specifies:
"I'm building a REST API with user authentication"

Engine identifies:
- Type: REST API
- Features: Authentication
- Suggests: Express + JWT template
- Optional: Add CRUD, database patterns
```

### In `/baco plan`
```markdown
Analyzing baco.md features:
- Detected: E-commerce features
- Selected templates:
  - Authentication (JWT + OAuth)
  - Product CRUD
  - Payment integration
  - Order management
- Customizations needed:
  - Multi-currency support
  - Inventory tracking
```

### In `/baco execute`
```markdown
Implementing with templates:
1. Setting up authentication...
   - Using: jwt-auth-express template
   - Customizing: Added role-based access
   - Generated: 5 files

2. Creating product management...
   - Using: rest-api-crud template
   - Customizing: Added image fields
   - Generated: 3 files
```

## Template Combination Rules

### Compatible Combinations
- JWT Auth + REST CRUD ✓
- Session Auth + Server-side rendering ✓
- GraphQL + Repository Pattern ✓
- WebSockets + JWT Auth ✓

### Incompatible Combinations
- Session Auth + Stateless API ✗
- Multiple ORM systems ✗
- Conflicting auth strategies ✗

## Template Variables

Templates use variables that are replaced during generation:

- `{{projectName}}` - The project name
- `{{modelName}}` - Entity/model name
- `{{fieldList}}` - Model fields
- `{{apiPrefix}}` - API route prefix
- `{{dbConnection}}` - Database connection string

## Quality Assurance

### Template Validation
Each template is validated for:
- Syntax correctness
- Dependency accuracy
- Security best practices
- Performance considerations

### Generated Code Validation
After applying templates:
- Run syntax validation
- Check imports/dependencies
- Verify type safety (TypeScript)
- Test basic functionality

## Extending Templates

### Adding Custom Templates
1. Create file in appropriate category
2. Follow template format (YAML frontmatter + content)
3. Include working examples
4. Document dependencies

### Template Inheritance
Templates can extend others:
```yaml
---
name: "JWT Auth with Rate Limiting"
extends: "jwt-auth-express"
additions:
  - rate-limiting
  - brute-force-protection
---
```

## Performance Optimization

### Template Caching
- Frequently used templates are cached
- Parsed metadata stored in memory
- Quick lookup by tags/categories

### Lazy Loading
- Templates loaded only when needed
- Metadata indexed for fast search
- Content parsed on-demand

## Error Handling

### Missing Templates
If a required template is missing:
1. Suggest similar alternatives
2. Offer to create basic implementation
3. Link to documentation

### Template Conflicts
When templates conflict:
1. Identify incompatibility
2. Suggest resolution
3. Let user choose approach

## Template Composition Integration

### Overview
The template engine now integrates with the Template Composer (`.claude/lib/template-composer.md`) to handle:
- Multiple templates working together seamlessly
- Import path resolution across templates
- Automatic test template pairing
- Dependency conflict resolution

### Composition Workflow

1. **Template Selection Phase**
   ```typescript
   // Collect all required templates based on features
   const selectedTemplates = [
     'jwt-auth-express',      // Authentication
     'rest-api-crud',        // CRUD operations
     'global-error-handler', // Error handling
     'validation-error-handling' // Input validation
   ];
   ```

2. **Metadata Loading**
   ```typescript
   // Load template metadata for composition
   const templateMetadata = selectedTemplates.map(id => 
     loadTemplateMetadata(id)
   );
   ```

3. **Composition Context Creation**
   ```typescript
   const context: CompositionContext = {
     projectPath: projectDirectory,
     framework: detectedFramework,
     models: extractedModels,
     features: parsedFeatures,
     conventions: {
       fileNaming: 'camelCase',
       importStyle: 'named',
       testFilePattern: '__tests__/*.test.ts',
       componentPattern: 'PascalCase'
     }
   };
   ```

4. **Template Composition**
   ```typescript
   const composer = new TemplateComposer();
   const compositionResult = await composer.composeTemplates(
     selectedTemplates,
     context
   );
   ```

5. **File Generation**
   ```typescript
   // Generate all files including tests
   for (const [path, composition] of compositionResult.files) {
     await generateFile(path, composition.content);
   }
   ```

### Handling Template Conflicts

When templates conflict (e.g., two auth templates):
1. Check `conflicts` field in metadata
2. Notify user of incompatibility
3. Suggest alternatives or let user choose

### Import Path Resolution

The composer automatically fixes import paths:
```javascript
// Before composition (in auth template)
import { User } from '../models/User';

// After composition (adjusted for actual structure)
import { User } from '../../models/User';
```

### Test Template Pairing

Automatic test generation based on code templates:
```yaml
Code Template: jwt-auth-express
Test Template: jwt-auth-testing (auto-selected)

Code Template: rest-api-crud
Test Template: api-endpoint-testing (auto-selected)

Code Template: react-error-boundary
Test Template: react-component-testing (auto-selected)
```

### Section-Based Merging

For files modified by multiple templates:
```javascript
// app.js sections
// Middleware section - modified by auth template
app.use(authMiddleware);

// Routes section - modified by CRUD template  
app.use('/api/tasks', taskRoutes);

// Error handling section - modified by error handler
app.use(errorHandler);
```

## Integration with Agents

Different agents use templates differently:

- **Daedalus (Architect)**: Selects overall template strategy
- **Hephaestus (Developer)**: Implements and customizes templates
- **Themis (QA)**: Adds testing templates
- **Aegis (Security)**: Enhances with security patterns

## Future Enhancements

### Planned Features
- Template versioning
- Community template repository
- AI-powered template creation
- Template performance metrics
- Cross-framework adapters

### Template Marketplace
- Share custom templates
- Rate and review templates
- Automatic updates
- Organization-specific templates