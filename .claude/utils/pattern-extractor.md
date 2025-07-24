# Pattern Extractor Utility

Instructions for extracting coding patterns, conventions, and architectural decisions from code examples during BACO init.

## Purpose

Analyze provided code examples to detect patterns, conventions, and practices that should be reflected in the generated baco.md file. This ensures the guidance aligns with the user's existing code style and preferences.

## Pattern Categories

### 1. Naming Conventions

#### File Naming
```python
file_patterns = {
    "kebab-case": r"^[a-z]+(-[a-z]+)*\.(js|ts|py|go)$",    # user-service.js
    "snake_case": r"^[a-z]+(_[a-z]+)*\.(js|ts|py|go)$",    # user_service.py
    "PascalCase": r"^[A-Z][a-zA-Z]*\.(js|ts|py|go)$",      # UserService.js
    "camelCase": r"^[a-z][a-zA-Z]*\.(js|ts|py|go)$",       # userService.js
}

component_patterns = {
    "React": {
        "file": "PascalCase.tsx or PascalCase/index.tsx",
        "component": "PascalCase function/class name"
    },
    "Vue": {
        "file": "PascalCase.vue or kebab-case.vue",
        "component": "PascalCase in script"
    }
}
```

#### Variable and Function Naming
```python
naming_detection = {
    "variables": {
        "camelCase": "const userName = 'Prometheus'",
        "snake_case": "user_name = 'Prometheus'",
        "PascalCase": "UserName = 'Prometheus'"  # constants
    },
    "functions": {
        "camelCase": "function getUserById()",
        "snake_case": "def get_user_by_id():",
        "PascalCase": "func GetUserByID()"  # Go public functions
    },
    "classes": {
        "PascalCase": "class UserService:",
        "snake_case": "class user_service:"  # Python sometimes
    }
}
```

### 2. Project Structure Patterns

#### Organization Approaches
```yaml
structure_patterns:
  feature_based:
    example: |
      src/
        features/
          auth/
            components/
            services/
            tests/
          user/
            components/
            services/
            tests/
    indicators:
      - "Features grouped together"
      - "Self-contained modules"
      - "Colocated tests"
      
  layer_based:
    example: |
      src/
        controllers/
        models/
        services/
        routes/
        tests/
    indicators:
      - "Technical layers separated"
      - "MVC-style organization"
      - "Centralized tests"
      
  domain_driven:
    example: |
      src/
        domains/
          user/
            entities/
            repositories/
            use-cases/
          order/
            entities/
            repositories/
            use-cases/
    indicators:
      - "Domain boundaries"
      - "Repository pattern"
      - "Use case driven"
```

### 3. Code Style Patterns

#### Import Styles
```javascript
// ES6 Modules
import { useState } from 'react';
import UserService from './services/UserService';

// CommonJS
const express = require('express');
const { getUserById } = require('./services/user');

// Python
from fastapi import FastAPI, Depends
from .services import UserService
import os
```

#### Error Handling
```python
error_patterns = {
    "try_catch": {
        "pattern": "try/catch blocks",
        "example": "try { ... } catch (error) { ... }"
    },
    "async_await": {
        "pattern": "async/await with try/catch",
        "example": "try { await func() } catch (error) { ... }"
    },
    "result_type": {
        "pattern": "Result<T, E> or Either<L, R>",
        "example": "return Result.ok(data) or Result.error(err)"
    },
    "error_first": {
        "pattern": "Node.js callback style",
        "example": "callback(error, result)"
    }
}
```

#### Testing Patterns
```yaml
testing_patterns:
  unit_testing:
    indicators:
      - "*.test.js or *.spec.js files"
      - "describe/it blocks"
      - "Mocking dependencies"
    frameworks:
      - jest
      - mocha
      - pytest
      - go test
      
  integration_testing:
    indicators:
      - "*.integration.test.js files"
      - "Database setup/teardown"
      - "API endpoint testing"
      
  tdd_style:
    indicators:
      - "Test files alongside source"
      - "Red-green-refactor comments"
      - "Test-first examples"
      
  bdd_style:
    indicators:
      - "Given-When-Then structure"
      - "Scenario descriptions"
      - "Feature files"
```

### 4. Architectural Patterns

#### API Design
```python
api_patterns = {
    "restful": {
        "indicators": [
            "GET /users, POST /users, PUT /users/:id",
            "HTTP verbs for actions",
            "Resource-based URLs"
        ]
    },
    "rpc_style": {
        "indicators": [
            "POST /getUserById",
            "Action-based endpoints",
            "Verb in URL"
        ]
    },
    "graphql": {
        "indicators": [
            "Single /graphql endpoint",
            "Query/Mutation definitions",
            "Schema files"
        ]
    }
}
```

#### Dependency Injection
```python
di_patterns = {
    "constructor_injection": """
    class UserService {
        constructor(private db: Database) {}
    }
    """,
    
    "function_parameter": """
    def get_user(user_id: int, db: Database = Depends(get_db)):
        return db.query(User).filter(User.id == user_id).first()
    """,
    
    "decorator_based": """
    @inject
    class UserService:
        db: Database
    """
}
```

### 5. Documentation Patterns

#### Comment Styles
```python
doc_patterns = {
    "jsdoc": {
        "pattern": "/** ... */",
        "example": """
        /**
         * Get user by ID
         * @param {number} id - User ID
         * @returns {User} User object
         */
        """
    },
    "python_docstring": {
        "pattern": '"""..."""',
        "example": '''
        def get_user(id: int) -> User:
            """
            Get user by ID.
            
            Args:
                id: User ID
                
            Returns:
                User object
            """
        '''
    },
    "inline_comments": {
        "pattern": "// or #",
        "usage": "Above complex logic"
    }
}
```

### 6. Configuration Patterns

#### Environment Management
```yaml
config_patterns:
  env_files:
    - ".env for local development"
    - ".env.example for documentation"
    - "config/ directory for environments"
    
  config_libraries:
    - "dotenv for Node.js"
    - "python-decouple for Python"
    - "viper for Go"
    
  patterns:
    - "Never commit secrets"
    - "Type-safe config objects"
    - "Validation on startup"
```

## Analysis Process

### 1. Multi-File Analysis

When multiple files provided:

```python
def analyze_codebase(files):
    patterns = {
        "naming": detect_naming_conventions(files),
        "structure": detect_project_structure(files),
        "testing": detect_testing_approach(files),
        "style": detect_code_style(files),
        "architecture": detect_architectural_patterns(files)
    }
    
    consistency_score = calculate_consistency(patterns)
    
    return {
        "patterns": patterns,
        "consistency": consistency_score,
        "recommendations": generate_recommendations(patterns)
    }
```

### 2. Pattern Confidence

Rate confidence in detected patterns:

```yaml
confidence_levels:
  high:
    - "Pattern appears in >80% of examples"
    - "Explicitly documented"
    - "Framework enforces it"
    
  medium:
    - "Pattern appears in 50-80% of examples"
    - "Common in ecosystem"
    - "Some variations exist"
    
  low:
    - "Pattern appears in <50% of examples"
    - "Multiple approaches used"
    - "May be transitioning"
```

### 3. Ecosystem Detection

Identify the development ecosystem:

```python
ecosystem_indicators = {
    "node_js": ["package.json", "node_modules", ".js/.ts files"],
    "python": ["requirements.txt", "setup.py", "__init__.py"],
    "go": ["go.mod", "go.sum", ".go files"],
    "java": ["pom.xml", "build.gradle", ".java files"],
    "rust": ["Cargo.toml", "Cargo.lock", ".rs files"]
}
```

## Pattern Application

### 1. Feature Description Enhancement

Apply patterns to feature descriptions:

```yaml
original: "User authentication"
enhanced: |
  User authentication following repository pattern:
  - UserRepository for data access (detected pattern)
  - JWT tokens for stateless auth (from examples)
  - Bcrypt for password hashing (security pattern observed)
  - Session management in Redis (infrastructure pattern)
```

### 2. Example Generation

Create examples matching detected style:

```python
# If camelCase detected:
example = """
const userService = new UserService(database);
const authenticatedUser = await userService.authenticateUser(email, password);
"""

# If snake_case detected:
example = """
user_service = UserService(database)
authenticated_user = await user_service.authenticate_user(email, password)
"""
```

### 3. Constraint Inference

Derive constraints from patterns:

```yaml
inferred_constraints:
  from_testing_patterns:
    - "All features must have unit tests"
    - "Minimum 80% code coverage"
    - "Integration tests for API endpoints"
    
  from_error_handling:
    - "Consistent error response format"
    - "Structured logging required"
    - "No unhandled promise rejections"
    
  from_structure:
    - "Feature-based organization mandatory"
    - "Colocate tests with source"
    - "Shared code in common/ directory"
```

## Integration with baco.md Generation

### 1. Pattern Section

Add detected patterns to generated baco.md:

```markdown
## DETECTED PATTERNS:

Based on your examples, I've identified these patterns:

### Naming Conventions
- Files: kebab-case (e.g., user-service.js)
- Functions: camelCase (e.g., getUserById)
- Classes: PascalCase (e.g., UserService)
- Constants: UPPER_SNAKE_CASE

### Project Structure
- Feature-based organization
- Tests colocated with features
- Shared utilities in common/

### Code Style
- ES6 modules for imports
- Async/await for asynchronous code
- Try/catch for error handling
- JSDoc for documentation
```

### 2. Automatic Alignment

Ensure all generated content follows patterns:

- Examples use detected naming
- Structure recommendations match existing
- Technology suggestions complement patterns
- Constraints align with observed practices

### 3. Pattern Conflicts

When conflicts detected, ask for clarification:

```
I noticed mixed patterns in your examples:
- Some files use camelCase, others use kebab-case
- Both class-based and functional components

Which pattern should I follow for the generated guidance?
1. camelCase for files (newer pattern)
2. kebab-case for files (older pattern)
3. Let me decide based on context
```

## Quality Metrics

Track pattern extraction quality:

```yaml
quality_metrics:
  coverage:
    - "% of files analyzed"
    - "Number of patterns detected"
    - "Confidence levels"
    
  consistency:
    - "Pattern uniformity score"
    - "Deviation instances"
    - "Transition indicators"
    
  completeness:
    - "All categories checked"
    - "Sufficient examples"
    - "Clear conclusions"
```

The extracted patterns should provide a clear picture of the codebase's conventions and practices, enabling generation of highly aligned and relevant guidance in the baco.md file.