# Documentation Analyzer Utility

Instructions for analyzing documentation and examples during BACO init to build domain expertise and extract patterns.

## Purpose

Extract actionable insights from documentation URLs, code examples, and other resources provided during the interactive init process. Build deep understanding of the technologies and patterns the user wants to follow.

## Integration with Cache System

This analyzer works with the documentation cache (`documentation-cache.md`) to provide instant insights and avoid redundant analysis. It also leverages the framework knowledge base for immediate value.

## Analysis Workflow

### 0. Cache-First Approach

Before analyzing any documentation:

```yaml
cache_check_workflow:
  1_session_cache:
    - Check if URL was analyzed in current session
    - Return immediately if found
    - Show user: "Using cached analysis from earlier"
    
  2_daily_cache:
    - Check if URL analyzed within 24 hours
    - Validate cache isn't expired
    - Show user: "Using cached documentation insights"
    
  3_knowledge_base:
    - Detect framework from URL pattern
    - Load pre-populated knowledge if available
    - Show user: "Loading FastAPI knowledge base..."
    
  4_fresh_fetch:
    - Only fetch if no cache hit
    - Store results in all cache levels
    - Update knowledge base with new patterns
```

### 1. Documentation URL Analysis

When user provides documentation URLs (and no cache hit), use WebFetch with targeted prompts:

```yaml
analysis_targets:
  framework_docs:
    prompt: |
      Analyze this documentation and extract:
      1. Core concepts and terminology
      2. Recommended project structure
      3. Best practices and conventions
      4. Common patterns and anti-patterns
      5. Performance optimization guidelines
      6. Security recommendations
      7. Testing approaches
      Return as structured data.
      
  api_docs:
    prompt: |
      From this API documentation, identify:
      1. Authentication methods
      2. Rate limiting details
      3. Response formats
      4. Error handling patterns
      5. Versioning approach
      6. Required headers
      7. Common integration patterns
      
  tutorial_docs:
    prompt: |
      From this tutorial/guide, extract:
      1. Step-by-step patterns
      2. Code organization approach
      3. Naming conventions used
      4. Dependencies introduced
      5. Configuration patterns
      6. Deployment recommendations
```

### 2. Code Example Analysis

When user provides code examples (files or snippets):

#### Pattern Detection

```python
patterns_to_detect = {
    "naming_conventions": {
        "files": "camelCase|kebab-case|snake_case",
        "variables": "camelCase|snake_case|PascalCase",
        "functions": "camelCase|snake_case",
        "classes": "PascalCase|snake_case",
        "constants": "UPPER_SNAKE|camelCase"
    },
    
    "structure_patterns": {
        "organization": "feature-based|layer-based|domain-based",
        "module_pattern": "es6|commonjs|amd",
        "component_pattern": "functional|class-based|hooks"
    },
    
    "coding_patterns": {
        "error_handling": "try-catch|promises|async-await|result-types",
        "validation": "schema-based|manual|decorator-based",
        "testing": "unit|integration|e2e|tdd|bdd",
        "documentation": "jsdoc|docstring|markdown|inline"
    }
}
```

#### Framework-Specific Patterns

**React Patterns:**
- Component organization (atomic, feature-based)
- State management approach
- Hook usage patterns
- Testing with React Testing Library

**FastAPI Patterns:**
- Route organization
- Dependency injection usage
- Pydantic model structure
- Background task patterns

**Express Patterns:**
- Middleware organization
- Route structure
- Error handling middleware
- Validation approach

### 3. Intelligence Extraction

#### Concept Mapping

Build a concept map from documentation:

```yaml
concept_map:
  core_concepts:
    - name: "Authentication"
      related_to: ["JWT", "OAuth", "Session"]
      required_for: ["API Access", "User Features"]
      
    - name: "Caching"
      related_to: ["Redis", "Memcached", "CDN"]
      improves: ["Performance", "Scalability"]
      
  implementation_patterns:
    - pattern: "Repository Pattern"
      use_when: "Database abstraction needed"
      example: "UserRepository class"
      
    - pattern: "Factory Pattern"
      use_when: "Complex object creation"
      example: "NotificationFactory"
```

#### Best Practices Extraction

```yaml
best_practices:
  security:
    - always: ["Hash passwords", "Validate input", "Use HTTPS"]
    - never: ["Store secrets in code", "Trust user input", "Use eval()"]
    
  performance:
    - always: ["Cache expensive operations", "Use indexes", "Paginate results"]
    - consider: ["CDN for assets", "Query optimization", "Connection pooling"]
    
  code_quality:
    - always: ["Write tests", "Handle errors", "Document APIs"]
    - patterns: ["SOLID principles", "DRY", "KISS"]
```

### 4. Domain Expertise Building

#### Technology Stack Profile

Build comprehensive understanding:

```yaml
tech_profile:
  framework: "FastAPI"
  characteristics:
    - "Type hints for validation"
    - "Automatic API documentation"
    - "Async support built-in"
    - "Pydantic for data models"
    
  common_libraries:
    - "SQLAlchemy for ORM"
    - "Alembic for migrations"
    - "Celery for background tasks"
    - "pytest for testing"
    
  deployment_patterns:
    - "Docker containers"
    - "Gunicorn + Uvicorn"
    - "Nginx reverse proxy"
    
  gotchas:
    - "Dependency injection differences from Flask"
    - "Async function requirements"
    - "Pydantic v1 vs v2 differences"
```

#### Integration Patterns

Understand how technologies work together:

```yaml
integration_patterns:
  frontend_backend:
    - pattern: "REST API + React"
      considerations: ["CORS setup", "API client generation", "Type sharing"]
      
    - pattern: "GraphQL + Any Frontend"
      considerations: ["Schema design", "Resolver patterns", "Caching strategy"]
      
  database_patterns:
    - pattern: "PostgreSQL + Redis"
      use_case: "Relational data + Caching/Sessions"
      
    - pattern: "MongoDB + Elasticsearch"
      use_case: "Document storage + Full-text search"
```

### 5. Constraint Discovery

Extract implicit constraints from documentation:

```yaml
discovered_constraints:
  performance:
    - "Framework expects < 100ms response time"
    - "Default connection pool size is 10"
    - "Rate limiting at 100 requests/minute"
    
  compatibility:
    - "Requires Python 3.8+"
    - "Not compatible with Windows deployment"
    - "Needs PostgreSQL 12+ for features used"
    
  architectural:
    - "Designed for microservices"
    - "Expects stateless services"
    - "Built for horizontal scaling"
```

### 6. Example-to-Feature Mapping

Connect examples to potential features:

```python
example_features = {
    "auth_middleware.py": [
        "User Authentication",
        "JWT Token Management",
        "Role-based Access Control"
    ],
    
    "payment_service.py": [
        "Payment Processing",
        "Invoice Generation",
        "Subscription Management"
    ],
    
    "websocket_handler.js": [
        "Real-time Updates",
        "Live Notifications",
        "Chat Functionality"
    ]
}
```

### 7. Documentation Gaps

Identify what's missing and note for constraints:

```yaml
documentation_gaps:
  missing_topics:
    - "Deployment guidelines not found"
    - "Security best practices minimal"
    - "Scaling strategies not covered"
    
  unclear_areas:
    - "Database migration strategy"
    - "Error handling patterns"
    - "Testing approach"
    
  assumptions_needed:
    - "Assume standard REST conventions"
    - "Assume common security practices"
    - "Assume typical scaling patterns"
```

## Output Format

Structure analysis results for baco.md generation:

```yaml
analysis_results:
  documentation_sources:
    - url: "https://example.com/docs"
      type: "framework"
      key_insights: ["insight1", "insight2"]
      
  detected_patterns:
    naming: "camelCase for functions"
    structure: "feature-based organization"
    testing: "jest with testing-library"
    
  recommended_practices:
    - "Use TypeScript for type safety"
    - "Implement error boundaries"
    - "Add request validation middleware"
    
  constraints_discovered:
    - "Requires Node 16+"
    - "PostgreSQL for JSON support"
    - "Redis for session storage"
    
  suggested_features:
    based_on_examples:
      - "Health check endpoint"
      - "Request logging middleware"
      - "API versioning support"
```

## Knowledge Base Integration

### Instant Framework Insights

When user mentions a framework, immediately access knowledge base:

```yaml
framework_detection:
  triggers:
    - "I'm using React" → Load React knowledge
    - "FastAPI backend" → Load FastAPI patterns
    - "PostgreSQL database" → Load PostgreSQL best practices
    
  instant_response:
    "I see you're using {framework}. Based on my knowledge base:
    - Common structure: {structure_pattern}
    - Best practices: {top_practices}
    - Popular libraries: {ecosystem}
    
    Would you like me to analyze the official docs for the latest patterns?"
    
  benefits:
    - Immediate value without waiting
    - Shows expertise from the start
    - Guides toward best practices
    - Reduces documentation fetching
```

### Pre-Populated Suggestions

Based on framework combination:

```yaml
stack_suggestions:
  react_express:
    automatic_includes:
      - "CORS setup will be needed"
      - "JWT authentication pattern"
      - "Proxy configuration for development"
      
  fastapi_postgres:
    automatic_includes:
      - "SQLAlchemy + Alembic for ORM/migrations"
      - "Connection pooling configuration"
      - "Async database drivers (asyncpg)"
      
  django_react:
    automatic_includes:
      - "Django REST Framework for API"
      - "django-cors-headers for CORS"
      - "Token authentication setup"
```

## Integration with Conversation

### Contextual Questions

Based on analysis AND knowledge base, ask informed questions:

```
"I see the FastAPI docs emphasize async handlers. 
Will your application need to handle concurrent requests efficiently?
This would affect our database connection strategy."
```

### Pattern Confirmation

Verify detected patterns:

```
"From your examples, I notice you're using:
- Repository pattern for data access
- Dependency injection for services
- Async/await throughout

Should I assume these patterns for the generated guidance?"
```

### Gap Filling

Address missing information:

```
"The documentation doesn't specify deployment approaches.
Are you planning to deploy to:
- Cloud platforms (AWS, GCP, Azure)
- Kubernetes
- Traditional VPS
- Serverless
This will affect our architecture recommendations."
```

## Caching Strategy

Cache analyzed documentation for session:

```yaml
cache_structure:
  urls_analyzed:
    "https://example.com/docs":
      analyzed_at: "timestamp"
      insights: ["cached insights"]
      expires: "timestamp + 1 hour"
      
  patterns_detected:
    source: "file_or_url"
    patterns: {}
    confidence: "high|medium|low"
```

This prevents re-analysis if same URL mentioned multiple times and speeds up related questions.

## Quality Assurance

Ensure analysis provides value:

1. **Relevance Check**: Insights relate to user's project type
2. **Actionability**: Each insight can influence baco.md content
3. **Specificity**: Avoid generic advice, be specific to their stack
4. **Completeness**: Cover security, performance, and maintainability

The analysis should demonstrate deep understanding of their chosen technologies and how they integrate with their specific use case.