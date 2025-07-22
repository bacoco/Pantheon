# Test Generator for BACO

This library provides automatic test generation alongside code implementation in BACO projects.

## Overview

The test generator analyzes generated code and creates appropriate tests using templates from `.claude/templates/testing/`. It ensures every component, function, and API endpoint has corresponding tests.

## Test Generation Strategy

### 1. Code Analysis
When generating code, the test generator:
- Identifies testable units (components, functions, API endpoints)
- Determines the appropriate test type (unit, integration, e2e)
- Analyzes dependencies and required mocks
- Extracts test scenarios from code structure

### 2. Test Type Selection

#### Component Tests (React/Next.js)
For components, generate:
- Render tests (component displays correctly)
- Interaction tests (user events)
- Props validation tests
- State management tests
- Accessibility tests

#### API Endpoint Tests
For API routes, generate:
- Success response tests
- Error handling tests
- Validation tests
- Authentication/authorization tests
- Database interaction tests

#### Utility Function Tests
For utilities, generate:
- Input/output tests
- Edge case tests
- Error condition tests
- Performance tests (if applicable)

### 3. Test Template Matching

Based on code type, select appropriate template:
- React Component → `react-component-testing.md`
- Express API → `api-endpoint-testing.md` 
- Utility Functions → `unit-function-testing.md`
- Integration Tests → `integration-testing.md`

## Integration with BACO Commands

### During `/baco execute`

When implementing features:
```
1. Generate component code
2. Immediately generate corresponding test
3. Place test in __tests__ directory
4. Update test coverage tracking
```

Example flow:
```
Creating: src/components/UserProfile.tsx
✅ Component created (120 lines)

Generating tests...
Creating: src/components/__tests__/UserProfile.test.tsx
✅ Test file created (85 lines)
✅ Added 8 test cases
```

### Test Generation Rules

#### For React Components
```typescript
// If component has props
- Generate prop validation tests
- Test default props
- Test required props

// If component has state
- Test initial state
- Test state updates
- Test state persistence

// If component has user interaction
- Test click handlers
- Test form submissions
- Test keyboard navigation

// Always include
- Render without crashing test
- Accessibility audit test
- Snapshot test (optional)
```

#### For API Endpoints
```typescript
// For each endpoint
- Test successful response
- Test validation errors
- Test authentication requirements
- Test error handling

// For CRUD operations
- Test create with valid data
- Test create with invalid data
- Test read operations
- Test update operations
- Test delete operations
- Test pagination/filtering
```

#### For Forms
```typescript
// Form-specific tests
- Test field validation
- Test form submission
- Test error display
- Test success states
- Test loading states
- Test accessibility
```

## Test File Structure

### Naming Convention
```
src/
├── components/
│   ├── Button.tsx
│   ├── __tests__/
│   │   └── Button.test.tsx
├── api/
│   ├── users.ts
│   ├── __tests__/
│   │   └── users.test.ts
└── utils/
    ├── validation.ts
    ├── __tests__/
        └── validation.test.ts
```

### Test Organization
```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    // Render tests
  });
  
  describe('Props', () => {
    // Prop validation tests
  });
  
  describe('User Interactions', () => {
    // Interaction tests
  });
  
  describe('Accessibility', () => {
    // A11y tests
  });
});
```

## Generated Test Examples

### Component Test Generation
```typescript
// For a Button component
describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### API Test Generation
```typescript
// For a POST /api/users endpoint
describe('POST /api/users', () => {
  it('creates a new user with valid data', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(userData.email);
  });

  it('returns 400 for invalid email', async () => {
    const userData = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'securePassword123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(400);

    expect(response.body.errors).toContainEqual(
      expect.objectContaining({ field: 'email' })
    );
  });
});
```

## Configuration Options

### Test Coverage Thresholds
```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Test Generation Settings
```yaml
# .claude/config/test-generation.yaml
settings:
  generateSnapshots: false
  includeAccessibilityTests: true
  includePerformanceTests: false
  testFramework: "jest"
  testingLibrary: "@testing-library/react"
  mockStrategy: "manual" # or "auto"
```

## Smart Test Generation Features

### 1. Dependency Detection
- Automatically identifies required mocks
- Generates mock implementations
- Sets up test utilities

### 2. Scenario Extraction
- Analyzes conditional logic to generate test cases
- Creates edge case tests based on validation
- Generates error scenario tests

### 3. Coverage Optimization
- Ensures critical paths are tested
- Avoids redundant tests
- Focuses on user-facing functionality

### 4. Test Data Generation
- Creates realistic test data
- Generates edge case data
- Provides data factories for complex objects

## Integration with CI/CD

### GitHub Actions Configuration
```yaml
- name: Run Tests
  run: |
    npm test -- --coverage
    npm run test:e2e
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## Best Practices

### Do's
- ✅ Generate tests immediately after code
- ✅ Test user-facing behavior
- ✅ Include accessibility tests
- ✅ Mock external dependencies
- ✅ Use meaningful test descriptions

### Don'ts
- ❌ Test implementation details
- ❌ Create brittle tests
- ❌ Skip error scenarios
- ❌ Ignore edge cases
- ❌ Generate tests without context

## Error Recovery

When test generation fails:
1. Log the error with context
2. Create a basic test scaffold
3. Add TODO comments for manual completion
4. Continue with implementation
5. Report issues in final summary

## Future Enhancements

- Visual regression testing
- Performance testing templates
- Contract testing for APIs
- Mutation testing integration
- AI-powered test scenario generation