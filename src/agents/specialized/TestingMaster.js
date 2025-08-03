import { PantheonAgent } from '../PantheonAgent.js';
import path from 'path';

/**
 * TestingMaster - Specialized agent for comprehensive testing strategies
 * Expert in unit testing, integration testing, E2E testing, test automation, and quality assurance
 */
export class TestingMaster extends PantheonAgent {
  constructor(config = {}) {
    super({
      name: 'testing-master',
      description: 'Comprehensive testing specialist with expertise in unit, integration, E2E testing, and test automation',
      model: config.model || 'claude-sonnet',
      tools: [
        'Edit', 'Read', 'Write', 'Grep', 'Glob', 'Bash'
      ],
      collaboration_mode: 'specialist',
      specialization: 'testing_automation',
      code_writing: 'ALLOWED',
      validation_required: true,
      auto_validation: true,
      ...config
    });
    
    // Testing frameworks and tools
    this.testingFrameworks = {
      javascript: {
        unit: ['jest', 'mocha', 'vitest', 'ava'],
        integration: ['supertest', 'testcontainers'],
        e2e: ['playwright', 'cypress', 'puppeteer', 'selenium'],
        mocking: ['sinon', 'jest-mock', 'nock'],
        assertion: ['chai', 'expect', 'should']
      },
      python: {
        unit: ['pytest', 'unittest', 'nose2'],
        integration: ['pytest-django', 'factory-boy'],
        e2e: ['selenium', 'playwright-python'],
        mocking: ['unittest.mock', 'pytest-mock', 'responses'],
        assertion: ['pytest', 'assertpy']
      },
      java: {
        unit: ['junit5', 'testng', 'spock'],
        integration: ['spring-boot-test', 'testcontainers'],
        e2e: ['selenium', 'rest-assured'],
        mocking: ['mockito', 'powermock'],
        assertion: ['assertj', 'hamcrest']
      },
      csharp: {
        unit: ['xunit', 'nunit', 'mstest'],
        integration: ['testcontainers-dotnet'],
        e2e: ['selenium', 'playwright-dotnet'],
        mocking: ['moq', 'nsubstitute'],
        assertion: ['fluentassertions', 'shouldly']
      }
    };
    
    // Test patterns and strategies
    this.testPatterns = {
      unit: {
        aaa: 'Arrange-Act-Assert',
        given_when_then: 'Given-When-Then',
        four_phase: 'Setup-Exercise-Verify-Teardown'
      },
      integration: {
        contract: 'Contract Testing',
        component: 'Component Testing',
        service: 'Service Integration Testing'
      },
      e2e: {
        user_journey: 'User Journey Testing',
        smoke: 'Smoke Testing',
        regression: 'Regression Testing'
      }
    };
    
    // Coverage and quality metrics
    this.qualityMetrics = {
      coverage: {
        line: 80,
        branch: 75,
        function: 90,
        statement: 80
      },
      performance: {
        response_time: '< 200ms',
        throughput: '> 1000 req/s',
        error_rate: '< 0.1%'
      }
    };
    
    // Test data strategies
    this.testDataStrategies = [
      'fixtures',
      'factories',
      'builders',
      'object_mothers',
      'random_generation',
      'property_based'
    ];
  }
  
  /**
   * Main task execution for testing-related tasks
   */
  async performTask(task) {
    const { type, codebase, framework, language, testLevel } = task;
    
    this.logger.info('TestingMaster executing task', { 
      type, 
      framework: framework || 'auto-detect',
      language: language || 'auto-detect',
      testLevel: testLevel || 'all'
    });
    
    switch (type) {
      case 'generate_test_suite':
        return await this.generateTestSuite(codebase, framework, language, testLevel);
      case 'create_unit_tests':
        return await this.createUnitTests(codebase, framework, language);
      case 'create_integration_tests':
        return await this.createIntegrationTests(codebase, framework, language);
      case 'create_e2e_tests':
        return await this.createE2ETests(codebase, framework, language);
      case 'setup_test_infrastructure':
        return await this.setupTestInfrastructure(framework, language);
      case 'generate_test_data':
        return await this.generateTestData(task.schema, framework, language);
      case 'setup_ci_testing':
        return await this.setupCITesting(framework, language);
      case 'performance_tests':
        return await this.createPerformanceTests(task.endpoints, framework, language);
      case 'security_tests':
        return await this.createSecurityTests(task.endpoints, framework, language);
      case 'api_contract_tests':
        return await this.createAPIContractTests(task.apiSpec, framework, language);
      case 'mutation_testing':
        return await this.setupMutationTesting(codebase, framework, language);
      case 'visual_regression_tests':
        return await this.createVisualRegressionTests(task.pages, framework, language);
      default:
        throw new Error(`Unknown testing task type: ${type}`);
    }
  }
  
  /**
   * Generate comprehensive test suite
   */
  async generateTestSuite(codebase, framework, language, testLevel = 'all') {
    try {
      this.logger.info('Generating comprehensive test suite', { framework, language, testLevel });
      
      // Analyze codebase structure
      const analysis = await this.analyzeCodebase(codebase);
      
      // Detect optimal testing frameworks
      const testingStack = await this.selectTestingStack(analysis, framework, language);
      
      // Generate test structure
      const testStructure = await this.generateTestStructure(analysis, testingStack);
      
      const results = {
        analysis,
        testingStack,
        files: {}
      };
      
      // Generate configuration files
      results.files = {
        ...results.files,
        ...await this.generateTestConfigs(testingStack, language)
      };
      
      // Generate unit tests
      if (testLevel === 'all' || testLevel === 'unit') {
        const unitTests = await this.generateUnitTests(analysis.modules, testingStack, language);
        results.files = { ...results.files, ...unitTests };
      }
      
      // Generate integration tests
      if (testLevel === 'all' || testLevel === 'integration') {
        const integrationTests = await this.generateIntegrationTests(analysis.apis, testingStack, language);
        results.files = { ...results.files, ...integrationTests };
      }
      
      // Generate E2E tests
      if (testLevel === 'all' || testLevel === 'e2e') {
        const e2eTests = await this.generateE2ETests(analysis.userFlows, testingStack, language);
        results.files = { ...results.files, ...e2eTests };
      }
      
      // Generate test utilities and helpers
      const utilities = await this.generateTestUtilities(testingStack, language);
      results.files = { ...results.files, ...utilities };
      
      // Generate CI/CD configuration
      const ciConfig = await this.generateCIConfig(testingStack, language);
      results.files = { ...results.files, ...ciConfig };
      
      // Generate test documentation
      results.files['tests/README.md'] = this.generateTestDocumentation(testingStack, analysis);
      
      return {
        success: true,
        testingStack,
        coverage: this.calculateExpectedCoverage(analysis),
        files: results.files,
        recommendations: await this.generateTestingRecommendations(analysis, testingStack)
      };
      
    } catch (error) {
      this.logger.error('Failed to generate test suite', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Analyze codebase for testing requirements
   */
  async analyzeCodebase(codebase) {
    const analysis = {
      language: null,
      framework: null,
      modules: [],
      apis: [],
      userFlows: [],
      complexity: 'medium',
      testableUnits: [],
      dependencies: [],
      riskAreas: []
    };
    
    // Detect language and framework
    analysis.language = await this.detectLanguage(codebase);
    analysis.framework = await this.detectFramework(codebase, analysis.language);
    
    // Analyze modules and functions
    analysis.modules = await this.extractModules(codebase, analysis.language);
    
    // Analyze API endpoints
    analysis.apis = await this.extractAPIEndpoints(codebase, analysis.framework);
    
    // Identify user flows
    analysis.userFlows = await this.identifyUserFlows(codebase, analysis.framework);
    
    // Calculate complexity
    analysis.complexity = await this.calculateComplexity(analysis.modules);
    
    // Identify testable units
    analysis.testableUnits = await this.identifyTestableUnits(analysis.modules);
    
    // Extract dependencies
    analysis.dependencies = await this.extractDependencies(codebase, analysis.language);
    
    // Identify risk areas
    analysis.riskAreas = await this.identifyRiskAreas(analysis.modules, analysis.apis);
    
    return analysis;
  }
  
  /**
   * Select optimal testing stack
   */
  async selectTestingStack(analysis, preferredFramework, language) {
    const lang = language || analysis.language || 'javascript';
    const frameworks = this.testingFrameworks[lang] || this.testingFrameworks.javascript;
    
    const stack = {
      language: lang,
      unit: preferredFramework?.unit || this.selectOptimalFramework(frameworks.unit, analysis.complexity),
      integration: preferredFramework?.integration || frameworks.integration[0],
      e2e: preferredFramework?.e2e || this.selectOptimalE2EFramework(frameworks.e2e, analysis.framework),
      mocking: preferredFramework?.mocking || frameworks.mocking[0],
      assertion: preferredFramework?.assertion || frameworks.assertion[0],
      coverage: this.selectCoverageTools(lang),
      ci: this.selectCITools(lang)
    };
    
    return stack;
  }
  
  /**
   * Generate unit tests for modules
   */
  async generateUnitTests(modules, testingStack, language) {
    const unitTests = {};
    
    for (const module of modules) {
      const testFileName = this.generateTestFileName(module.name, 'unit', language);
      unitTests[testFileName] = await this.generateModuleUnitTest(module, testingStack, language);
    }
    
    return unitTests;
  }
  
  /**
   * Generate unit test for a specific module
   */
  async generateModuleUnitTest(module, testingStack, language) {
    switch (language) {
      case 'javascript':
        return this.generateJavaScriptUnitTest(module, testingStack);
      case 'python':
        return this.generatePythonUnitTest(module, testingStack);
      case 'java':
        return this.generateJavaUnitTest(module, testingStack);
      case 'csharp':
        return this.generateCSharpUnitTest(module, testingStack);
      default:
        return this.generateJavaScriptUnitTest(module, testingStack);
    }
  }
  
  /**
   * Generate JavaScript unit test
   */
  generateJavaScriptUnitTest(module, testingStack) {
    const isJest = testingStack.unit === 'jest';
    const mockingLib = testingStack.mocking;
    
    return `${this.generateTestImports(module, testingStack, 'javascript')}

describe('${module.name}', () => {
  ${this.generateTestSetup(module, testingStack, 'javascript')}

${module.functions.map(func => this.generateFunctionTest(func, testingStack, 'javascript')).join('\n\n')}

  ${this.generateTestTeardown(module, testingStack, 'javascript')}
});

${this.generateTestHelpers(module, testingStack, 'javascript')}`;
  }
  
  /**
   * Generate function test
   */
  generateFunctionTest(func, testingStack, language) {
    const testCases = this.generateTestCases(func);
    
    const tests = testCases.map(testCase => {
      return `  test('${testCase.description}', ${testCase.async ? 'async ' : ''}() => {
    // Arrange
    ${testCase.arrange}
    
    // Act
    ${testCase.act}
    
    // Assert
    ${testCase.assert}
  });`;
    }).join('\n\n');
    
    return `  describe('${func.name}', () => {
${tests}
  });`;
  }
  
  /**
   * Generate test cases for a function
   */
  generateTestCases(func) {
    const testCases = [];
    
    // Happy path test
    testCases.push({
      description: `should ${func.description || 'work correctly'} with valid input`,
      arrange: this.generateArrangeCode(func, 'valid'),
      act: this.generateActCode(func, 'valid'),
      assert: this.generateAssertCode(func, 'valid'),
      async: func.async
    });
    
    // Error cases
    if (func.parameters) {
      func.parameters.forEach(param => {
        if (param.validation) {
          testCases.push({
            description: `should throw error when ${param.name} is invalid`,
            arrange: this.generateArrangeCode(func, 'invalid', param.name),
            act: this.generateActCode(func, 'invalid'),
            assert: this.generateAssertCode(func, 'error'),
            async: func.async
          });
        }
      });
    }
    
    // Edge cases
    testCases.push({
      description: 'should handle edge cases correctly',
      arrange: this.generateArrangeCode(func, 'edge'),
      act: this.generateActCode(func, 'edge'),
      assert: this.generateAssertCode(func, 'edge'),
      async: func.async
    });
    
    return testCases;
  }
  
  /**
   * Generate integration tests
   */
  async generateIntegrationTests(apis, testingStack, language) {
    const integrationTests = {};
    
    for (const api of apis) {
      const testFileName = this.generateTestFileName(api.name, 'integration', language);
      integrationTests[testFileName] = await this.generateAPIIntegrationTest(api, testingStack, language);
    }
    
    return integrationTests;
  }
  
  /**
   * Generate API integration test
   */
  generateAPIIntegrationTest(api, testingStack, language) {
    if (language === 'javascript') {
      return `const request = require('supertest');
const app = require('../../src/app');
const { setupTestDB, cleanupTestDB } = require('../helpers/database');
const { createTestData } = require('../helpers/fixtures');

describe('${api.name} API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await createTestData();
  });

${api.endpoints.map(endpoint => this.generateEndpointTest(endpoint, testingStack)).join('\n\n')}
});`;
    }
    
    return this.generateJavaScriptIntegrationTest(api, testingStack);
  }
  
  /**
   * Generate endpoint test
   */
  generateEndpointTest(endpoint, testingStack) {
    const method = endpoint.method.toLowerCase();
    const path = endpoint.path;
    
    return `  describe('${endpoint.method} ${path}', () => {
    test('should return successful response with valid data', async () => {
      const response = await request(app)
        .${method}('${path}')${endpoint.requiresAuth ? '\n        .set(\'Authorization\', \'Bearer \' + validToken)' : ''}${endpoint.body ? '\n        .send(validRequestBody)' : ''}
        .expect(${endpoint.successStatus || 200});

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      ${this.generateEndpointAssertions(endpoint)}
    });

    test('should return error for invalid data', async () => {
      const response = await request(app)
        .${method}('${path}')${endpoint.requiresAuth ? '\n        .set(\'Authorization\', \'Bearer \' + validToken)' : ''}
        .send(invalidRequestBody)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    ${endpoint.requiresAuth ? `test('should return 401 for unauthorized access', async () => {
      const response = await request(app)
        .${method}('${path}')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });` : ''}
  });`;
  }
  
  /**
   * Generate E2E tests
   */
  async generateE2ETests(userFlows, testingStack, language) {
    const e2eTests = {};
    
    if (testingStack.e2e === 'playwright') {
      e2eTests['e2e/playwright.config.js'] = this.generatePlaywrightConfig();
      
      for (const flow of userFlows) {
        const testFileName = `e2e/${flow.name}.spec.js`;
        e2eTests[testFileName] = this.generatePlaywrightTest(flow);
      }
    } else if (testingStack.e2e === 'cypress') {
      e2eTests['cypress.config.js'] = this.generateCypressConfig();
      
      for (const flow of userFlows) {
        const testFileName = `cypress/e2e/${flow.name}.cy.js`;
        e2eTests[testFileName] = this.generateCypressTest(flow);
      }
    }
    
    return e2eTests;
  }
  
  /**
   * Generate Playwright test
   */
  generatePlaywrightTest(flow) {
    return `const { test, expect } = require('@playwright/test');

test.describe('${flow.name}', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test data
    await page.goto('/');
  });

  test('${flow.description}', async ({ page }) => {
${flow.steps.map(step => this.generatePlaywrightStep(step)).join('\n\n')}
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test error scenarios
    ${this.generateErrorScenarios(flow)}
  });
});`;
  }
  
  /**
   * Generate test configuration files
   */
  async generateTestConfigs(testingStack, language) {
    const configs = {};
    
    if (language === 'javascript') {
      if (testingStack.unit === 'jest') {
        configs['jest.config.js'] = this.generateJestConfig(testingStack);
      }
      
      if (testingStack.e2e === 'playwright') {
        configs['playwright.config.js'] = this.generatePlaywrightConfig();
      } else if (testingStack.e2e === 'cypress') {
        configs['cypress.config.js'] = this.generateCypressConfig();
      }
    }
    
    // Add package.json test scripts
    configs['package.json.test-scripts'] = this.generateTestScripts(testingStack, language);
    
    return configs;
  }
  
  /**
   * Generate Jest configuration
   */
  generateJestConfig(testingStack) {
    return `module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 90,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  transform: {
    '^.+\\\\.js$': 'babel-jest'
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};`;
  }
  
  /**
   * Generate Playwright configuration
   */
  generatePlaywrightConfig() {
    return `const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});`;
  }
  
  /**
   * Generate test utilities and helpers
   */
  async generateTestUtilities(testingStack, language) {
    const utilities = {};
    
    utilities['tests/helpers/database.js'] = this.generateDatabaseHelpers(testingStack, language);
    utilities['tests/helpers/fixtures.js'] = this.generateFixtureHelpers(testingStack, language);
    utilities['tests/helpers/mocks.js'] = this.generateMockHelpers(testingStack, language);
    utilities['tests/setup.js'] = this.generateTestSetupFile(testingStack, language);
    utilities['tests/teardown.js'] = this.generateTestTeardownFile(testingStack, language);
    
    return utilities;
  }
  
  /**
   * Generate database helpers
   */
  generateDatabaseHelpers(testingStack, language) {
    return `const { Pool } = require('pg');
const { migrate } = require('../src/database/migrations');

let testDB;

async function setupTestDB() {
  testDB = new Pool({
    connectionString: process.env.TEST_DATABASE_URL,
    max: 1
  });
  
  await migrate(testDB);
  return testDB;
}

async function cleanupTestDB() {
  if (testDB) {
    await testDB.query('TRUNCATE TABLE users, posts, comments RESTART IDENTITY CASCADE');
    await testDB.end();
  }
}

async function createTestData() {
  // Create test users
  const users = await testDB.query(\`
    INSERT INTO users (name, email, password) VALUES
    ('Test User 1', 'test1@example.com', 'hashedpassword1'),
    ('Test User 2', 'test2@example.com', 'hashedpassword2')
    RETURNING *
  \`);
  
  // Create test posts
  const posts = await testDB.query(\`
    INSERT INTO posts (title, content, user_id) VALUES
    ('Test Post 1', 'Content 1', $1),
    ('Test Post 2', 'Content 2', $2)
    RETURNING *
  \`, [users.rows[0].id, users.rows[1].id]);
  
  return { users: users.rows, posts: posts.rows };
}

module.exports = {
  setupTestDB,
  cleanupTestDB,
  createTestData,
  getTestDB: () => testDB
};`;
  }
  
  /**
   * Generate CI configuration
   */
  async generateCIConfig(testingStack, language) {
    const configs = {};
    
    configs['.github/workflows/test.yml'] = this.generateGitHubActionsConfig(testingStack, language);
    configs['.gitlab-ci.yml'] = this.generateGitLabCIConfig(testingStack, language);
    
    return configs;
  }
  
  /**
   * Generate GitHub Actions configuration
   */
  generateGitHubActionsConfig(testingStack, language) {
    return `name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run unit tests
      run: npm run test:unit
      env:
        TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
    
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Upload Playwright report
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30`;
  }
  
  /**
   * Generate test documentation
   */
  generateTestDocumentation(testingStack, analysis) {
    return `# Test Suite Documentation

This project uses a comprehensive testing strategy with multiple levels of testing.

## Testing Stack

- **Unit Testing**: ${testingStack.unit}
- **Integration Testing**: ${testingStack.integration}
- **E2E Testing**: ${testingStack.e2e}
- **Mocking**: ${testingStack.mocking}
- **Coverage**: ${testingStack.coverage}

## Test Structure

\`\`\`
tests/
├── unit/                 # Unit tests
├── integration/          # Integration tests
├── e2e/                  # End-to-end tests
├── helpers/              # Test utilities
│   ├── database.js
│   ├── fixtures.js
│   └── mocks.js
└── setup.js             # Global test setup
\`\`\`

## Running Tests

\`\`\`bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
\`\`\`

## Test Patterns

### Unit Tests
- Follow the AAA pattern (Arrange-Act-Assert)
- Test each function in isolation
- Mock external dependencies
- Achieve >90% code coverage

### Integration Tests
- Test API endpoints end-to-end
- Use real database with test data
- Verify request/response contracts
- Test authentication and authorization

### E2E Tests
- Test complete user workflows
- Use real browser automation
- Test critical user journeys
- Verify UI interactions

## Coverage Requirements

- **Lines**: 80%
- **Branches**: 75%
- **Functions**: 90%
- **Statements**: 80%

## Test Data Management

- Use factories for generating test data
- Clean database between tests
- Use fixtures for complex scenarios
- Implement test data builders

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Pushes to main/develop branches
- Scheduled nightly runs

## Best Practices

1. **Write tests first** (TDD approach)
2. **Keep tests independent**
3. **Use descriptive test names**
4. **Test edge cases and error conditions**
5. **Mock external services**
6. **Keep tests fast and reliable**
7. **Update tests when code changes**

Generated by Pantheon Testing Master`;
  }
  
  // Helper methods
  generateTestFileName(moduleName, testType, language) {
    const ext = language === 'python' ? 'py' : 'js';
    return `tests/${testType}/${moduleName}.test.${ext}`;
  }
  
  selectOptimalFramework(frameworks, complexity) {
    if (complexity === 'high') {
      return frameworks.includes('jest') ? 'jest' : frameworks[0];
    }
    return frameworks[0];
  }
  
  selectOptimalE2EFramework(frameworks, webFramework) {
    if (webFramework === 'react' || webFramework === 'vue') {
      return frameworks.includes('playwright') ? 'playwright' : 'cypress';
    }
    return frameworks[0];
  }
  
  selectCoverageTools(language) {
    const tools = {
      javascript: 'nyc',
      python: 'coverage.py',
      java: 'jacoco',
      csharp: 'coverlet'
    };
    return tools[language] || tools.javascript;
  }
  
  selectCITools(language) {
    return ['github-actions', 'gitlab-ci', 'jenkins'];
  }
  
  async detectLanguage(codebase) {
    // Implementation would analyze file extensions and content
    return 'javascript'; // Default for now
  }
  
  async detectFramework(codebase, language) {
    // Implementation would analyze package.json, imports, etc.
    return 'express'; // Default for now
  }
  
  async extractModules(codebase, language) {
    // Implementation would parse code and extract modules/classes/functions
    return []; // Placeholder
  }
  
  async extractAPIEndpoints(codebase, framework) {
    // Implementation would extract REST endpoints
    return []; // Placeholder
  }
  
  async identifyUserFlows(codebase, framework) {
    // Implementation would identify common user workflows
    return []; // Placeholder
  }
  
  async calculateComplexity(modules) {
    // Implementation would calculate cyclomatic complexity
    return 'medium'; // Placeholder
  }
  
  generateTestImports(module, testingStack, language) {
    if (language === 'javascript') {
      return `const ${module.name} = require('../../src/${module.path}');
const { expect } = require('@jest/globals');`;
    }
    return '';
  }
  
  generateTestSetup(module, testingStack, language) {
    return `beforeEach(() => {
    // Setup test environment
  });`;
  }
  
  generateTestTeardown(module, testingStack, language) {
    return `afterEach(() => {
    // Cleanup test environment
  });`;
  }
  
  generateTestHelpers(module, testingStack, language) {
    return `// Test helper functions for ${module.name}
function createMock${module.name}() {
  return {
    // Mock implementation
  };
}`;
  }
}

export default TestingMaster;