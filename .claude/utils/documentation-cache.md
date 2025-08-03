# Documentation Cache Utility

Instructions for intelligent caching of documentation analysis results to improve performance and build cumulative knowledge.

## Purpose

Provide a caching layer for documentation analysis that:
1. Avoids re-fetching frequently accessed documentation
2. Builds a knowledge base of common patterns
3. Speeds up project initialization
4. Accumulates framework-specific insights over time

## Cache Architecture

### Cache Structure

```yaml
documentation_cache:
  url_cache:
    "https://fastapi.tiangolo.com/": 
      fetched_at: "timestamp"
      expires_at: "timestamp + 24 hours"
      insights:
        core_concepts: ["Type hints", "Async support", "Automatic validation"]
        patterns: ["Dependency injection", "Pydantic models", "Router organization"]
        best_practices: ["Use type hints", "Async when possible", "Proper status codes"]
        constraints: ["Python 3.7+", "Pydantic required", "ASGI server needed"]
      metadata:
        framework: "FastAPI"
        version: "0.100.0"
        category: "web_framework"
        
  pattern_knowledge:
    frameworks:
      fastapi:
        common_structure: ["app/", "routers/", "models/", "schemas/"]
        testing_approach: "pytest with TestClient"
        deployment: "Docker + Uvicorn"
        
      react:
        common_structure: ["src/components/", "src/pages/", "src/hooks/"]
        testing_approach: "Jest + React Testing Library"
        deployment: "Build + static hosting"
        
  common_patterns:
    authentication:
      jwt: 
        libraries: ["pyjwt", "jsonwebtoken", "jose"]
        patterns: ["Bearer tokens", "Refresh tokens", "Token expiry"]
        
    database:
      orm:
        libraries: ["SQLAlchemy", "Prisma", "TypeORM", "Sequelize"]
        patterns: ["Repository pattern", "Migrations", "Connection pooling"]
```

### Cache Levels

```yaml
cache_levels:
  L1_session:
    scope: "Current BACO session"
    ttl: "Until session ends"
    purpose: "Immediate reuse within conversation"
    
  L2_daily:
    scope: "24-hour persistence"
    ttl: "24 hours"
    purpose: "Common documentation across projects"
    
  L3_knowledge:
    scope: "Permanent knowledge base"
    ttl: "Never expires, only updates"
    purpose: "Accumulated patterns and insights"
```

## Intelligent Retrieval

### 1. Cache Check Strategy

```python
def get_documentation_insights(url):
    # Check L1 session cache first
    if session_cache.has(url):
        return session_cache.get(url)
    
    # Check L2 daily cache
    if daily_cache.has(url) and not daily_cache.is_expired(url):
        insights = daily_cache.get(url)
        session_cache.store(url, insights)  # Promote to L1
        return insights
    
    # Check if we have general knowledge about this framework
    framework = detect_framework_from_url(url)
    if framework and knowledge_base.has_framework(framework):
        base_insights = knowledge_base.get_framework_insights(framework)
        
        # Fetch fresh data but merge with known patterns
        fresh_insights = fetch_and_analyze(url)
        merged = merge_insights(base_insights, fresh_insights)
        
        # Update all cache levels
        update_caches(url, merged)
        return merged
    
    # No cache hit - fetch and analyze
    insights = fetch_and_analyze(url)
    update_caches(url, insights)
    update_knowledge_base(framework, insights)
    return insights
```

### 2. Smart URL Normalization

Recognize equivalent documentation URLs:

```yaml
url_patterns:
  versioned_docs:
    - pattern: "docs.example.com/v{version}/*"
      normalize_to: "docs.example.com/latest/*"
      cache_strategy: "Share insights across versions"
      
  language_variants:
    - pattern: "docs.example.com/{lang}/*"
      normalize_to: "docs.example.com/en/*"
      cache_strategy: "Share technical insights"
      
  common_aliases:
    "fastapi.tiangolo.com": ["fastapi.io", "fastapi-docs.com"]
    "reactjs.org": ["react.dev", "beta.reactjs.org"]
```

### 3. Incremental Knowledge Building

```yaml
knowledge_accumulation:
  on_new_analysis:
    - Extract patterns not in knowledge base
    - Identify new best practices
    - Update framework profiles
    - Tag with confidence scores
    
  pattern_reinforcement:
    - Count pattern occurrences
    - Increase confidence with repetition
    - Flag contradictions for review
    
  version_tracking:
    - Note framework version changes
    - Track deprecated patterns
    - Update recommendations
```

## Cache Operations

### 1. Storage Format

```yaml
cache_entry:
  url: "https://example.com/docs"
  normalized_url: "https://example.com/docs/latest"
  fetched_at: "2024-01-20T10:00:00Z"
  expires_at: "2024-01-21T10:00:00Z"
  
  insights:
    summary: "Brief description of the technology"
    
    core_concepts:
      - concept: "Dependency Injection"
        description: "How it works in this framework"
        importance: "high"
        
    patterns:
      - name: "Repository Pattern"
        description: "Recommended data access approach"
        example: "class UserRepository..."
        confidence: 0.95
        
    best_practices:
      - practice: "Use async handlers"
        reason: "Better performance under load"
        code_example: "async def handler():"
        
    constraints:
      - type: "version"
        requirement: "Python 3.8+"
        severity: "required"
        
    anti_patterns:
      - pattern: "Blocking I/O in async"
        reason: "Defeats async benefits"
        alternative: "Use async libraries"
        
  metadata:
    framework: "FastAPI"
    version: "0.100.0"
    category: "web_framework"
    sub_category: "async"
    language: "python"
    
  quality_metrics:
    completeness: 0.85  # How much we extracted
    confidence: 0.90    # How sure we are
    relevance: 0.95     # How applicable to user's context
```

### 2. Cache Invalidation

```yaml
invalidation_rules:
  time_based:
    documentation: "24 hours"
    api_reference: "7 days"
    tutorials: "30 days"
    blog_posts: "Never expire"
    
  event_based:
    - "New framework version detected"
    - "Major documentation restructure"
    - "User reports outdated info"
    
  smart_refresh:
    - "Check ETag/Last-Modified headers"
    - "Compare with changelog"
    - "Partial update if possible"
```

### 3. Offline Fallback

```yaml
offline_strategy:
  when_url_unreachable:
    1. Use cached version if available
    2. Fall back to knowledge base patterns
    3. Warn user about offline status
    4. Suggest similar cached resources
    
  degraded_mode:
    - Provide general framework knowledge
    - Show confidence levels
    - Highlight what might be outdated
```

## Pre-Populated Knowledge

### Common Framework Profiles

```yaml
framework_profiles:
  react:
    category: "frontend_framework"
    core_concepts: ["Components", "State", "Props", "Hooks", "JSX"]
    ecosystem: ["React Router", "Redux", "MobX", "Context API"]
    patterns:
      - "Functional components preferred"
      - "Custom hooks for logic reuse"
      - "Composition over inheritance"
    testing: ["Jest", "React Testing Library", "Enzyme (legacy)"]
    
  django:
    category: "web_framework"
    core_concepts: ["MVT", "ORM", "Admin", "Middleware", "Apps"]
    ecosystem: ["DRF", "Celery", "Django Channels", "pytest-django"]
    patterns:
      - "Fat models, thin views"
      - "App-based organization"
      - "Class-based views for complex logic"
    testing: ["Django TestCase", "pytest-django", "Factory Boy"]
    
  express:
    category: "web_framework"
    core_concepts: ["Middleware", "Routing", "Request/Response", "Error handling"]
    ecosystem: ["Passport", "Mongoose", "Socket.io", "Joi"]
    patterns:
      - "Middleware pipeline"
      - "Router modules"
      - "Error handling middleware"
    testing: ["Mocha", "Jest", "Supertest"]
```

### Common Integration Patterns

```yaml
integration_patterns:
  frontend_backend:
    react_express:
      cors_setup: "Required for development"
      auth_flow: "JWT with httpOnly cookies"
      api_structure: "RESTful with /api prefix"
      
    vue_django:
      cors_setup: "django-cors-headers"
      auth_flow: "Django sessions or JWT"
      api_structure: "DRF with ViewSets"
      
  database_orm:
    postgres_sqlalchemy:
      connection: "Connection pooling essential"
      migrations: "Alembic for schema changes"
      patterns: "Repository pattern recommended"
      
    mongodb_mongoose:
      connection: "Connection string with options"
      schema: "Mongoose schemas for validation"
      patterns: "Embedded vs referenced documents"
```

## Cache Usage in BACO Init

### 1. Conversation Integration

```yaml
during_init_conversation:
  on_documentation_url:
    - Check all cache levels
    - Provide instant insights if cached
    - Show cache status to user
    - Offer to refresh if stale
    
  on_framework_mention:
    - Load framework profile immediately
    - Suggest common patterns
    - Pre-populate constraints
    - Recommend ecosystem tools
    
  on_pattern_discussion:
    - Reference knowledge base
    - Show confidence levels
    - Provide examples from cache
```

### 2. Batch Optimization

```yaml
batch_operations:
  multiple_urls:
    - Group by domain
    - Parallel fetch for uncached
    - Merge related insights
    
  framework_ecosystem:
    - Load main framework profile
    - Pre-fetch common library docs
    - Bundle related patterns
```

### 3. Smart Suggestions

Based on cache contents:

```yaml
suggestions:
  if_cached_react:
    suggest: ["React Router", "State management", "Testing setup"]
    
  if_cached_fastapi:
    suggest: ["Pydantic schemas", "Async patterns", "OpenAPI integration"]
    
  if_cached_postgres:
    suggest: ["ORM selection", "Migration strategy", "Connection pooling"]
```

## Quality Assurance

### 1. Cache Metrics

Track cache effectiveness:

```yaml
metrics:
  hit_rate: "Percentage of cache hits"
  freshness: "Average age of cached content"
  accuracy: "User-reported accuracy score"
  space_used: "Cache size in MB"
  
  patterns:
    most_accessed: ["React docs", "FastAPI docs", "PostgreSQL docs"]
    least_accessed: ["Rarely used framework docs"]
    update_frequency: "How often docs change"
```

### 2. Continuous Improvement

```yaml
improvement_cycle:
  weekly:
    - Analyze cache hit patterns
    - Update framework profiles
    - Prune unused entries
    
  monthly:
    - Review knowledge base accuracy
    - Update pre-populated patterns
    - Refine URL normalization rules
    
  on_feedback:
    - Mark outdated entries
    - Update confidence scores
    - Adjust TTL values
```

## Implementation Notes

1. **Cache storage**: Use session memory for L1, file system for L2/L3
2. **Concurrency**: Handle multiple requests to same URL gracefully
3. **Size limits**: Implement LRU eviction for space management
4. **Error handling**: Graceful degradation when cache corrupted
5. **Privacy**: Never cache user-specific or private documentation

The cache should significantly improve the `/baco init` experience by providing instant insights for common documentation while building a growing knowledge base of patterns and best practices.