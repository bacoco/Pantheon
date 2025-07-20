# Example Analyzer Instructions

This document provides instructions for analyzing code examples to infer conventions, patterns, and best practices.

## ACTIVATION
When BACO needs to analyze examples from baco.md or discover patterns in provided code.

## ANALYSIS INSTRUCTIONS

### 1. Convention Detection

When analyzing code examples, look for:

#### Coding Style
- **Indentation**: Spaces vs tabs, number of spaces (2, 4, etc.)
- **Naming conventions**:
  - Functions: camelCase, snake_case, PascalCase
  - Variables: camelCase, snake_case, SCREAMING_SNAKE_CASE
  - Classes: PascalCase, snake_case
  - Files: kebab-case, snake_case, camelCase
- **Quote style**: Single quotes, double quotes, backticks
- **Semicolons**: Used or omitted (in JavaScript/TypeScript)
- **Line length**: Typical maximum characters per line
- **Import style**: 
  - ES6 imports vs CommonJS requires
  - Grouped imports vs individual
  - Absolute vs relative paths

#### Language-Specific Patterns
For **Python**:
- Use of type hints
- Docstring format (Google, NumPy, Sphinx)
- Use of f-strings vs format() vs %
- Class method decorators (@property, @staticmethod)

For **JavaScript/TypeScript**:
- Arrow functions vs function declarations
- Async/await vs promises
- Destructuring usage
- Module system (ES6, CommonJS)

For **React/Vue**:
- Component style (functional vs class)
- State management approach
- Props validation method
- File organization

### 2. Pattern Recognition

Identify common patterns:

#### Architecture Patterns
- **MVC/MVP/MVVM**: Look for controllers, models, views
- **Microservices**: Service boundaries, API definitions
- **Event-driven**: Event emitters, pub/sub patterns
- **Layered**: Clear separation of concerns

#### API Patterns
- **RESTful**: HTTP verbs, resource-based URLs
- **GraphQL**: Schema definitions, resolvers
- **RPC**: Procedure-based calls

#### Error Handling
- Try-catch blocks vs error callbacks
- Custom error classes
- Error logging approaches
- Validation patterns

#### Testing Patterns
- Unit test structure
- Mocking approaches
- Test naming conventions
- Assertion libraries used

### 3. Dependency Analysis

From examples, identify:
- **Core dependencies**: Main frameworks/libraries
- **Development tools**: Testing, linting, building
- **Architecture choices**: Database, cache, message queue
- **External services**: APIs, cloud services

### 4. Auto-Discovery Process

When examples are not provided:

1. **Suggest common locations**:
   - `examples/`, `samples/`, `demo/`
   - `tests/`, `__tests__/`, `spec/`
   - `src/examples/`, `docs/examples/`

2. **Relevance criteria for discovery**:
   - Filename matches feature keywords
   - Content contains relevant patterns
   - File size (prefer 100-500 lines)
   - Recent modification date

3. **Ranking discovered examples**:
   - Direct keyword matches: High relevance
   - Technology stack matches: Medium relevance
   - General patterns: Low relevance

### 5. Synthesis and Recommendations

After analyzing examples:

#### Style Consensus
Report the most common patterns:
- "Detected: 4 spaces for indentation"
- "Detected: camelCase for functions"
- "Detected: ES6 imports with destructuring"

#### Pattern Summary
- "Using Express.js with middleware pattern"
- "RESTful API with JWT authentication"
- "React functional components with hooks"

#### Recommendations
Based on analysis, suggest:
- "Use 4 spaces for indentation (found in 80% of examples)"
- "Follow RESTful naming: GET /users, POST /users"
- "Use async/await for asynchronous operations"

### 6. Reporting Format

When presenting analysis results:

```
📐 Detected Coding Conventions:
   • Indentation: 4 spaces
   • Functions: camelCase
   • Classes: PascalCase
   • Quotes: Single quotes preferred

🔍 Common Patterns:
   • Framework: Express.js with middleware
   • Architecture: RESTful API design
   • Authentication: JWT with refresh tokens
   • Error handling: Centralized error middleware

📦 Key Dependencies:
   • express (web framework)
   • jsonwebtoken (authentication)
   • mongoose (database ORM)

💡 Recommendations:
   • Follow Express middleware pattern for new endpoints
   • Use centralized error handling as shown in auth.js
   • Maintain consistent async/await usage
```

## INTEGRATION WITH BACO PLAN

Use the analysis to enhance development plans:

1. **Apply detected conventions** to all generated code
2. **Follow identified patterns** in implementation steps
3. **Use same dependencies** for consistency
4. **Maintain architectural style** throughout

## IMPORTANT NOTES

- This is inference based on described patterns, not code execution
- When in doubt, ask the user for clarification
- Prioritize consistency over "best practices"
- Adapt to the project's existing style
- The goal is to generate code that fits seamlessly with examples