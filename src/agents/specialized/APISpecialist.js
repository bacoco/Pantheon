import { PantheonAgent } from '../PantheonAgent.js';
import yaml from 'yaml';
import path from 'path';

/**
 * APISpecialist - Specialized agent for RESTful API development
 * Expert in API design, OpenAPI specifications, authentication, validation, and best practices
 */
export class APISpecialist extends PantheonAgent {
  constructor(config = {}) {
    super({
      name: 'api-specialist',
      description: 'RESTful API development specialist with expertise in OpenAPI, authentication, and API best practices',
      model: config.model || 'claude-sonnet',
      tools: [
        'Edit', 'Read', 'Write', 'Grep', 'Glob', 'Bash'
      ],
      collaboration_mode: 'specialist',
      specialization: 'api_development',
      code_writing: 'ALLOWED',
      validation_required: true,
      auto_validation: true,
      ...config
    });
    
    // API-specific knowledge and templates
    this.apiPatterns = {
      restful: {
        conventions: ['resource_based', 'http_verbs', 'status_codes', 'content_negotiation'],
        patterns: ['crud', 'pagination', 'filtering', 'sorting', 'searching']
      },
      authentication: {
        types: ['jwt', 'oauth2', 'api_key', 'basic_auth', 'bearer_token'],
        security: ['cors', 'csrf', 'rate_limiting', 'input_validation']
      },
      documentation: {
        specs: ['openapi_3', 'swagger', 'postman', 'insomnia'],
        formats: ['yaml', 'json', 'markdown']
      }
    };
    
    // API frameworks and technologies
    this.frameworkSupport = {
      nodejs: ['express', 'fastify', 'koa', 'nestjs', 'apollo-server'],
      python: ['fastapi', 'django-rest', 'flask', 'tornado'],
      java: ['spring-boot', 'jersey', 'dropwizard'],
      csharp: ['aspnet-core', 'webapi'],
      go: ['gin', 'echo', 'gorilla-mux'],
      rust: ['axum', 'warp', 'actix-web']
    };
    
    // Common API patterns and responses
    this.responseTemplates = this.initializeResponseTemplates();
    this.middlewarePatterns = this.initializeMiddlewarePatterns();
    this.validationSchemas = this.initializeValidationSchemas();
  }
  
  /**
   * Main task execution for API development
   */
  async performTask(task) {
    const { type, requirements, framework, language } = task;
    
    this.logger.info('API Specialist executing task', { 
      type, 
      framework: framework || 'auto-detect',
      language: language || 'auto-detect'
    });
    
    switch (type) {
      case 'create_api':
        return await this.createAPI(requirements, framework, language);
      case 'generate_openapi':
        return await this.generateOpenAPISpec(requirements);
      case 'implement_auth':
        return await this.implementAuthentication(requirements);
      case 'add_validation':
        return await this.addValidation(requirements);
      case 'create_middleware':
        return await this.createMiddleware(requirements);
      case 'setup_testing':
        return await this.setupAPITesting(requirements);
      case 'optimize_performance':
        return await this.optimizeAPIPerformance(requirements);
      case 'add_documentation':
        return await this.addAPIDocumentation(requirements);
      case 'implement_cors':
        return await this.implementCORS(requirements);
      case 'add_rate_limiting':
        return await this.addRateLimiting(requirements);
      default:
        throw new Error(`Unknown API task type: ${type}`);
    }
  }
  
  /**
   * Create a complete REST API
   */
  async createAPI(requirements, framework, language) {
    try {
      // Analyze requirements
      const analysis = await this.analyzeAPIRequirements(requirements);
      
      // Detect or use specified framework
      const detectedFramework = framework || await this.detectOptimalFramework(analysis, language);
      const detectedLanguage = language || await this.detectLanguage(detectedFramework);
      
      this.logger.info('Creating API', { 
        framework: detectedFramework, 
        language: detectedLanguage,
        resources: analysis.resources.length
      });
      
      // Generate project structure
      const projectStructure = await this.generateProjectStructure(detectedFramework, detectedLanguage);
      
      // Create API routes and controllers
      const routes = await this.generateRoutes(analysis.resources, detectedFramework, detectedLanguage);
      
      // Generate models/schemas
      const models = await this.generateModels(analysis.entities, detectedFramework, detectedLanguage);
      
      // Create middleware
      const middleware = await this.generateMiddleware(analysis.middleware, detectedFramework, detectedLanguage);
      
      // Generate OpenAPI specification
      const openApiSpec = await this.generateOpenAPISpec({
        ...requirements,
        framework: detectedFramework,
        language: detectedLanguage,
        resources: analysis.resources
      });
      
      // Create configuration files
      const config = await this.generateConfiguration(detectedFramework, detectedLanguage, analysis);
      
      // Generate tests
      const tests = await this.generateAPITests(analysis.resources, detectedFramework, detectedLanguage);
      
      return {
        success: true,
        framework: detectedFramework,
        language: detectedLanguage,
        files: {
          ...projectStructure,
          ...routes,
          ...models,
          ...middleware,
          ...config,
          ...tests,
          'api-spec.yaml': openApiSpec
        },
        analysis,
        recommendations: await this.generateRecommendations(analysis, detectedFramework)
      };
      
    } catch (error) {
      this.logger.error('Failed to create API', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Analyze API requirements
   */
  async analyzeAPIRequirements(requirements) {
    const analysis = {
      resources: [],
      entities: [],
      middleware: [],
      authentication: null,
      database: null,
      features: []
    };
    
    // Extract resources from requirements
    if (requirements.resources) {
      analysis.resources = requirements.resources.map(resource => ({
        name: resource.name,
        endpoints: this.generateResourceEndpoints(resource),
        methods: resource.methods || ['GET', 'POST', 'PUT', 'DELETE'],
        validation: resource.validation || {},
        authentication: resource.authentication || requirements.authentication
      }));
    }
    
    // Extract entities/models
    if (requirements.entities || requirements.models) {
      analysis.entities = (requirements.entities || requirements.models).map(entity => ({
        name: entity.name,
        fields: entity.fields || entity.properties,
        relationships: entity.relationships || [],
        validation: entity.validation || {}
      }));
    }
    
    // Determine middleware needs
    analysis.middleware = this.determineMiddlewareNeeds(requirements);
    
    // Authentication analysis
    if (requirements.authentication) {
      analysis.authentication = {
        type: requirements.authentication.type || 'jwt',
        provider: requirements.authentication.provider,
        scopes: requirements.authentication.scopes || [],
        endpoints: requirements.authentication.endpoints || ['/auth/login', '/auth/register']
      };
    }
    
    // Database analysis
    if (requirements.database) {
      analysis.database = {
        type: requirements.database.type || 'postgresql',
        orm: requirements.database.orm,
        migrations: requirements.database.migrations !== false
      };
    }
    
    // Feature analysis
    analysis.features = this.extractFeatures(requirements);
    
    return analysis;
  }
  
  /**
   * Generate resource endpoints
   */
  generateResourceEndpoints(resource) {
    const basePath = `/${resource.name.toLowerCase()}`;
    const endpoints = [];
    
    if (resource.methods.includes('GET')) {
      endpoints.push({
        path: basePath,
        method: 'GET',
        description: `Get all ${resource.name}`,
        queryParams: ['page', 'limit', 'sort', 'filter']
      });
      
      endpoints.push({
        path: `${basePath}/:id`,
        method: 'GET',
        description: `Get ${resource.name} by ID`,
        pathParams: ['id']
      });
    }
    
    if (resource.methods.includes('POST')) {
      endpoints.push({
        path: basePath,
        method: 'POST',
        description: `Create new ${resource.name}`,
        bodyRequired: true
      });
    }
    
    if (resource.methods.includes('PUT')) {
      endpoints.push({
        path: `${basePath}/:id`,
        method: 'PUT',
        description: `Update ${resource.name} by ID`,
        pathParams: ['id'],
        bodyRequired: true
      });
    }
    
    if (resource.methods.includes('PATCH')) {
      endpoints.push({
        path: `${basePath}/:id`,
        method: 'PATCH',
        description: `Partially update ${resource.name} by ID`,
        pathParams: ['id'],
        bodyRequired: true
      });
    }
    
    if (resource.methods.includes('DELETE')) {
      endpoints.push({
        path: `${basePath}/:id`,
        method: 'DELETE',
        description: `Delete ${resource.name} by ID`,
        pathParams: ['id']
      });
    }
    
    return endpoints;
  }
  
  /**
   * Detect optimal framework based on requirements
   */
  async detectOptimalFramework(analysis, language) {
    const lang = language || 'nodejs';
    
    const recommendations = {
      nodejs: {
        simple: 'express',
        performance: 'fastify',
        enterprise: 'nestjs',
        graphql: 'apollo-server'
      },
      python: {
        modern: 'fastapi',
        mature: 'django-rest',
        lightweight: 'flask'
      },
      java: {
        enterprise: 'spring-boot',
        lightweight: 'jersey'
      },
      csharp: {
        default: 'aspnet-core'
      },
      go: {
        performance: 'gin',
        features: 'echo'
      }
    };
    
    const languageRecs = recommendations[lang] || recommendations.nodejs;
    
    // Choose based on requirements complexity
    if (analysis.resources.length > 10 || analysis.authentication) {
      return languageRecs.enterprise || languageRecs.features || languageRecs.default || languageRecs.modern;
    } else if (analysis.features.includes('high_performance')) {
      return languageRecs.performance || languageRecs.default || languageRecs.modern;
    } else {
      return languageRecs.simple || languageRecs.lightweight || languageRecs.default || languageRecs.modern;
    }
  }
  
  /**
   * Generate project structure
   */
  async generateProjectStructure(framework, language) {
    const structures = {
      express: {
        'package.json': this.generatePackageJson('express'),
        'app.js': this.generateExpressApp(),
        'routes/index.js': this.generateExpressRouteIndex(),
        'middleware/index.js': this.generateExpressMiddleware(),
        'models/index.js': this.generateModelIndex(),
        'config/database.js': this.generateDatabaseConfig(),
        'config/auth.js': this.generateAuthConfig(),
        '.env.example': this.generateEnvExample(),
        'README.md': this.generateAPIReadme(framework)
      },
      fastify: {
        'package.json': this.generatePackageJson('fastify'),
        'server.js': this.generateFastifyServer(),
        'routes/index.js': this.generateFastifyRoutes(),
        'plugins/index.js': this.generateFastifyPlugins(),
        'schemas/index.js': this.generateSchemaIndex(),
        '.env.example': this.generateEnvExample(),
        'README.md': this.generateAPIReadme(framework)
      },
      nestjs: {
        'package.json': this.generatePackageJson('nestjs'),
        'src/main.ts': this.generateNestMain(),
        'src/app.module.ts': this.generateNestAppModule(),
        'src/app.controller.ts': this.generateNestController(),
        'src/app.service.ts': this.generateNestService(),
        'tsconfig.json': this.generateTsConfig(),
        '.env.example': this.generateEnvExample(),
        'README.md': this.generateAPIReadme(framework)
      },
      fastapi: {
        'requirements.txt': this.generatePythonRequirements('fastapi'),
        'main.py': this.generateFastAPIMain(),
        'routers/__init__.py': '',
        'models/__init__.py': '',
        'schemas/__init__.py': '',
        'core/config.py': this.generateFastAPIConfig(),
        'core/security.py': this.generateFastAPISecurity(),
        '.env.example': this.generateEnvExample(),
        'README.md': this.generateAPIReadme(framework)
      }
    };
    
    return structures[framework] || structures.express;
  }
  
  /**
   * Generate routes for the API
   */
  async generateRoutes(resources, framework, language) {
    const routes = {};
    
    for (const resource of resources) {
      const routeName = `routes/${resource.name.toLowerCase()}.${this.getFileExtension(framework)}`;
      routes[routeName] = this.generateResourceRoute(resource, framework);
    }
    
    return routes;
  }
  
  /**
   * Generate resource route file
   */
  generateResourceRoute(resource, framework) {
    switch (framework) {
      case 'express':
        return this.generateExpressResourceRoute(resource);
      case 'fastify':
        return this.generateFastifyResourceRoute(resource);
      case 'nestjs':
        return this.generateNestResourceRoute(resource);
      case 'fastapi':
        return this.generateFastAPIResourceRoute(resource);
      default:
        return this.generateExpressResourceRoute(resource);
    }
  }
  
  /**
   * Generate Express route
   */
  generateExpressResourceRoute(resource) {
    const resourceName = resource.name.toLowerCase();
    const ResourceName = resource.name;
    
    return `const express = require('express');
const router = express.Router();
const ${ResourceName}Service = require('../services/${resourceName}Service');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { ${resourceName}Schema, ${resourceName}UpdateSchema } = require('../schemas/${resourceName}Schema');

// Get all ${resourceName}s
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, filter } = req.query;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      filter: filter ? JSON.parse(filter) : {}
    };
    
    const result = await ${ResourceName}Service.findAll(options);
    
    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get ${resourceName} by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const ${resourceName} = await ${ResourceName}Service.findById(id);
    
    if (!${resourceName}) {
      return res.status(404).json({
        success: false,
        message: '${ResourceName} not found'
      });
    }
    
    res.json({
      success: true,
      data: ${resourceName}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new ${resourceName}
router.post('/', authenticate, validate(${resourceName}Schema), async (req, res) => {
  try {
    const ${resourceName}Data = req.body;
    const new${ResourceName} = await ${ResourceName}Service.create(${resourceName}Data);
    
    res.status(201).json({
      success: true,
      data: new${ResourceName},
      message: '${ResourceName} created successfully'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
});

// Update ${resourceName}
router.put('/:id', authenticate, validate(${resourceName}UpdateSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updated${ResourceName} = await ${ResourceName}Service.update(id, updateData);
    
    if (!updated${ResourceName}) {
      return res.status(404).json({
        success: false,
        message: '${ResourceName} not found'
      });
    }
    
    res.json({
      success: true,
      data: updated${ResourceName},
      message: '${ResourceName} updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete ${resourceName}
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ${ResourceName}Service.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '${ResourceName} not found'
      });
    }
    
    res.json({
      success: true,
      message: '${ResourceName} deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;`;
  }
  
  /**
   * Generate OpenAPI specification
   */
  async generateOpenAPISpec(requirements) {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: requirements.title || 'API',
        description: requirements.description || 'RESTful API built with Pantheon Multi-AI',
        version: requirements.version || '1.0.0',
        contact: {
          name: 'API Support',
          email: requirements.contact?.email || 'support@example.com'
        }
      },
      servers: [
        {
          url: requirements.baseUrl || 'http://localhost:3000',
          description: 'Development server'
        }
      ],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {}
      }
    };
    
    // Add authentication schemes
    if (requirements.authentication) {
      this.addAuthenticationToSpec(spec, requirements.authentication);
    }
    
    // Add resource paths
    if (requirements.resources) {
      for (const resource of requirements.resources) {
        this.addResourceToSpec(spec, resource);
      }
    }
    
    return yaml.stringify(spec);
  }
  
  /**
   * Add authentication to OpenAPI spec
   */
  addAuthenticationToSpec(spec, auth) {
    switch (auth.type) {
      case 'jwt':
      case 'bearer':
        spec.components.securitySchemes.bearerAuth = {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        };
        break;
      case 'api_key':
        spec.components.securitySchemes.apiKey = {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        };
        break;
      case 'oauth2':
        spec.components.securitySchemes.oauth2 = {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: auth.authorizationUrl || '/oauth/authorize',
              tokenUrl: auth.tokenUrl || '/oauth/token',
              scopes: auth.scopes || {}
            }
          }
        };
        break;
    }
  }
  
  /**
   * Add resource to OpenAPI spec
   */
  addResourceToSpec(spec, resource) {
    const basePath = `/${resource.name.toLowerCase()}`;
    const resourceSchema = this.generateResourceSchema(resource);
    
    // Add schema to components
    spec.components.schemas[resource.name] = resourceSchema;
    
    // Add paths
    spec.paths[basePath] = {};
    spec.paths[`${basePath}/{id}`] = {};
    
    for (const endpoint of resource.endpoints) {
      const method = endpoint.method.toLowerCase();
      const path = endpoint.path;
      
      spec.paths[path] = spec.paths[path] || {};
      spec.paths[path][method] = {
        summary: endpoint.description,
        tags: [resource.name],
        parameters: this.generateEndpointParameters(endpoint),
        responses: this.generateEndpointResponses(resource, endpoint),
        ...(endpoint.bodyRequired && {
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${resource.name}` }
              }
            }
          }
        })
      };
      
      // Add security if required
      if (resource.authentication) {
        spec.paths[path][method].security = [{ bearerAuth: [] }];
      }
    }
  }
  
  /**
   * Initialize response templates
   */
  initializeResponseTemplates() {
    return {
      success: {
        200: { description: 'Success', schema: { type: 'object' } },
        201: { description: 'Created', schema: { type: 'object' } },
        204: { description: 'No Content' }
      },
      error: {
        400: { description: 'Bad Request', schema: { type: 'object', properties: { message: { type: 'string' } } } },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
        404: { description: 'Not Found' },
        422: { description: 'Validation Error' },
        500: { description: 'Internal Server Error' }
      }
    };
  }
  
  /**
   * Initialize middleware patterns
   */
  initializeMiddlewarePatterns() {
    return {
      cors: {
        purpose: 'Cross-Origin Resource Sharing',
        implementation: 'cors',
        options: { origin: true, credentials: true }
      },
      rateLimit: {
        purpose: 'Rate limiting',
        implementation: 'express-rate-limit',
        options: { windowMs: 15 * 60 * 1000, max: 100 }
      },
      helmet: {
        purpose: 'Security headers',
        implementation: 'helmet',
        options: { contentSecurityPolicy: false }
      },
      compression: {
        purpose: 'Response compression',
        implementation: 'compression',
        options: { threshold: 1024 }
      }
    };
  }
  
  /**
   * Initialize validation schemas
   */
  initializeValidationSchemas() {
    return {
      joi: 'const Joi = require("joi");',
      yup: 'const yup = require("yup");',
      ajv: 'const Ajv = require("ajv");'
    };
  }
  
  /**
   * Helper methods for file generation
   */
  getFileExtension(framework) {
    const extensions = {
      nestjs: 'ts',
      fastapi: 'py',
      express: 'js',
      fastify: 'js'
    };
    return extensions[framework] || 'js';
  }
  
  generatePackageJson(framework) {
    const dependencies = {
      express: {
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "helmet": "^7.0.0",
        "express-rate-limit": "^6.7.0",
        "joi": "^17.9.2",
        "jsonwebtoken": "^9.0.0",
        "bcryptjs": "^2.4.3",
        "dotenv": "^16.0.3"
      },
      fastify: {
        "@fastify/cors": "^8.3.0",
        "@fastify/helmet": "^11.0.0",
        "@fastify/rate-limit": "^8.0.0",
        "fastify": "^4.21.0",
        "ajv": "^8.12.0"
      },
      nestjs: {
        "@nestjs/common": "^10.0.0",
        "@nestjs/core": "^10.0.0",
        "@nestjs/platform-express": "^10.0.0",
        "@nestjs/swagger": "^7.0.0",
        "class-validator": "^0.14.0",
        "class-transformer": "^0.5.1"
      }
    };
    
    return JSON.stringify({
      name: "api-server",
      version: "1.0.0",
      description: "RESTful API built with Pantheon Multi-AI",
      main: framework === 'nestjs' ? 'dist/main.js' : 'app.js',
      scripts: {
        start: "node app.js",
        dev: "nodemon app.js",
        test: "jest",
        "test:watch": "jest --watch"
      },
      dependencies: dependencies[framework] || dependencies.express,
      devDependencies: {
        "nodemon": "^3.0.1",
        "jest": "^29.5.0",
        "supertest": "^6.3.3"
      }
    }, null, 2);
  }
  
  generateExpressApp() {
    return `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`;
  }
  
  generateEnvExample() {
    return `# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# API Keys (if using external services)
EXTERNAL_API_KEY=your-external-api-key
`;
  }
  
  generateAPIReadme(framework) {
    return `# API Server

RESTful API built with ${framework} using Pantheon Multi-AI.

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Update \`.env\` with your configuration

4. Start the server:
   \`\`\`bash
   npm run dev
   \`\`\`

## API Documentation

The API follows RESTful conventions and includes:

- **Authentication**: JWT-based authentication
- **Validation**: Request/response validation
- **Rate Limiting**: Protection against abuse
- **CORS**: Cross-origin request support
- **Security**: Helmet.js security headers

### Endpoints

- \`GET /health\` - Health check
- \`POST /api/auth/login\` - User authentication
- \`GET /api/{resource}\` - List resources
- \`GET /api/{resource}/:id\` - Get resource by ID
- \`POST /api/{resource}\` - Create resource
- \`PUT /api/{resource}/:id\` - Update resource
- \`DELETE /api/{resource}/:id\` - Delete resource

### Response Format

\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
\`\`\`

## Testing

Run tests with:
\`\`\`bash
npm test
\`\`\`

## Deployment

This API is ready for deployment to platforms like:
- Heroku
- Railway
- Vercel
- AWS
- Docker

Generated by Pantheon Multi-AI System
`;
  }
  
  /**
   * Helper methods for requirement analysis
   */
  determineMiddlewareNeeds(requirements) {
    const middleware = ['cors', 'helmet', 'compression'];
    
    if (requirements.authentication) {
      middleware.push('authentication');
    }
    
    if (requirements.rateLimit !== false) {
      middleware.push('rateLimit');
    }
    
    if (requirements.validation !== false) {
      middleware.push('validation');
    }
    
    if (requirements.logging !== false) {
      middleware.push('logging');
    }
    
    return middleware;
  }
  
  extractFeatures(requirements) {
    const features = [];
    
    if (requirements.realtime || requirements.websockets) {
      features.push('websockets');
    }
    
    if (requirements.caching) {
      features.push('caching');
    }
    
    if (requirements.performance === 'high') {
      features.push('high_performance');
    }
    
    if (requirements.search) {
      features.push('search');
    }
    
    if (requirements.uploads) {
      features.push('file_uploads');
    }
    
    return features;
  }
  
  detectLanguage(framework) {
    const languageMap = {
      express: 'nodejs',
      fastify: 'nodejs',
      nestjs: 'nodejs',
      fastapi: 'python',
      'django-rest': 'python',
      flask: 'python',
      'spring-boot': 'java',
      'aspnet-core': 'csharp',
      gin: 'go',
      echo: 'go'
    };
    
    return languageMap[framework] || 'nodejs';
  }
  
  generateResourceSchema(resource) {
    const schema = {
      type: 'object',
      properties: {},
      required: []
    };
    
    if (resource.fields) {
      for (const [fieldName, fieldConfig] of Object.entries(resource.fields)) {
        schema.properties[fieldName] = {
          type: fieldConfig.type || 'string',
          description: fieldConfig.description
        };
        
        if (fieldConfig.required) {
          schema.required.push(fieldName);
        }
      }
    }
    
    return schema;
  }
  
  generateEndpointParameters(endpoint) {
    const parameters = [];
    
    if (endpoint.pathParams) {
      endpoint.pathParams.forEach(param => {
        parameters.push({
          name: param,
          in: 'path',
          required: true,
          schema: { type: 'string' }
        });
      });
    }
    
    if (endpoint.queryParams) {
      endpoint.queryParams.forEach(param => {
        parameters.push({
          name: param,
          in: 'query',
          required: false,
          schema: { type: 'string' }
        });
      });
    }
    
    return parameters;
  }
  
  generateEndpointResponses(resource, endpoint) {
    const responses = {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { $ref: `#/components/schemas/${resource.name}` }
              }
            }
          }
        }
      },
      '400': {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      '500': {
        description: 'Internal server error'
      }
    };
    
    if (endpoint.method === 'POST') {
      responses['201'] = {
        description: 'Resource created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { $ref: `#/components/schemas/${resource.name}` }
              }
            }
          }
        }
      };
    }
    
    return responses;
  }
}

export default APISpecialist;