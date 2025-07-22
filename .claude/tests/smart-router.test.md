# Smart Router Unit Tests

This file contains unit test specifications for the Smart Router functionality.

## ACTIVATION

When running these tests, simulate the execution and validate that the smart router behaves correctly.

## Test Suites

### 1. Task Analysis Tests

```javascript
describe('TaskAnalysis', () => {
  test('should identify architecture domain correctly', () => {
    const request = "Design a scalable microservices architecture for e-commerce";
    const analysis = analyzeTask(request);
    
    expect(analysis.domains).toContain('architecture');
    expect(analysis.taskType).toBe('design');
    expect(analysis.complexity).toBeGreaterThanOrEqual(7);
  });

  test('should identify multiple domains', () => {
    const request = "Implement secure API endpoints with comprehensive testing";
    const analysis = analyzeTask(request);
    
    expect(analysis.domains).toContain('implementation');
    expect(analysis.domains).toContain('security');
    expect(analysis.domains).toContain('testing');
  });

  test('should detect technologies accurately', () => {
    const request = "Build React components with AWS Lambda backend";
    const analysis = analyzeTask(request);
    
    expect(analysis.technologies).toContain('react');
    expect(analysis.technologies).toContain('aws');
  });

  test('should calculate complexity for simple tasks', () => {
    const request = "Fix a typo in the README file";
    const analysis = analyzeTask(request);
    
    expect(analysis.complexity).toBeLessThanOrEqual(3);
    expect(analysis.estimatedDuration).toBe('minutes');
  });

  test('should extract capabilities from complex tasks', () => {
    const request = "Architect a fault-tolerant distributed system with real-time data processing";
    const analysis = analyzeTask(request);
    
    expect(analysis.requiredCapabilities).toContain('system-design');
    expect(analysis.requiredCapabilities).toContain('scalability');
    expect(analysis.complexity).toBeGreaterThanOrEqual(8);
  });
});
```

### 2. Agent Matching Tests

```javascript
describe('Agent Matching', () => {
  test('should route architecture tasks to Winston', () => {
    const analysis = {
      domains: ['architecture'],
      technologies: ['aws'],
      complexity: 8,
      requiredCapabilities: ['system-design', 'scalability'],
      taskType: 'design',
      estimatedDuration: 'weeks',
      originalRequest: 'Design cloud architecture'
    };
    
    const decision = matchAgents(analysis);
    
    expect(decision.primaryAgent.name).toBe('winston');
    expect(decision.confidence).toBeGreaterThan(0.7);
  });

  test('should route implementation tasks to James', () => {
    const analysis = {
      domains: ['implementation'],
      technologies: ['react', 'nodejs'],
      complexity: 5,
      requiredCapabilities: ['coding', 'frontend-development'],
      taskType: 'implementation',
      estimatedDuration: 'days',
      originalRequest: 'Build user dashboard'
    };
    
    const decision = matchAgents(analysis);
    
    expect(decision.primaryAgent.name).toBe('james');
  });

  test('should suggest supporting agents for complex tasks', () => {
    const analysis = {
      domains: ['architecture', 'security', 'implementation'],
      technologies: ['aws', 'nodejs'],
      complexity: 9,
      requiredCapabilities: ['system-design', 'security-audit', 'coding'],
      taskType: 'design',
      estimatedDuration: 'weeks',
      originalRequest: 'Design secure financial platform'
    };
    
    const decision = matchAgents(analysis);
    
    expect(decision.supportingAgents.length).toBeGreaterThan(0);
    expect(decision.supportingAgents.map(a => a.name)).toContain('marcus');
  });

  test('should handle unknown domains gracefully', () => {
    const analysis = {
      domains: [],
      technologies: [],
      complexity: 5,
      requiredCapabilities: [],
      taskType: 'implementation',
      estimatedDuration: 'hours',
      originalRequest: 'Do something vague'
    };
    
    const decision = matchAgents(analysis);
    
    expect(decision.primaryAgent.name).toBeDefined();
    expect(decision.confidence).toBeLessThan(0.7);
  });
});
```

### 3. Helper Function Tests

```javascript
describe('Helper Functions', () => {
  test('calculateComplexity should scale with factors', () => {
    const simpleRequest = "Add a button";
    const complexRequest = "Design enterprise-scale microservices architecture with distributed caching, real-time processing, and fault tolerance";
    
    const simpleComplexity = calculateComplexity(simpleRequest, { domains: ['ui'], technologies: [] });
    const highComplexity = calculateComplexity(complexRequest, { domains: ['architecture', 'devops'], technologies: ['aws', 'docker', 'redis'] });
    
    expect(highComplexity).toBeGreaterThan(simpleComplexity);
    expect(simpleComplexity).toBeLessThanOrEqual(5);
    expect(highComplexity).toBeGreaterThanOrEqual(7);
  });

  test('classifyTaskType should identify correct types', () => {
    expect(classifyTaskType("Design the system architecture")).toBe('design');
    expect(classifyTaskType("Implement the login feature")).toBe('implementation');
    expect(classifyTaskType("Test the payment flow")).toBe('testing');
    expect(classifyTaskType("Review the code quality")).toBe('review');
    expect(classifyTaskType("Plan the sprint roadmap")).toBe('planning');
    expect(classifyTaskType("Analyze performance metrics")).toBe('analysis');
  });

  test('estimateDuration should scale with complexity', () => {
    expect(estimateDuration(1, 'implementation')).toBe('hours');
    expect(estimateDuration(5, 'implementation')).toBe('days');
    expect(estimateDuration(9, 'implementation')).toBe('weeks');
  });

  test('getAgentTopCapabilities should return correct capabilities', () => {
    expect(getAgentTopCapabilities('winston')).toContain('architecture-design');
    expect(getAgentTopCapabilities('james')).toContain('implementation');
    expect(getAgentTopCapabilities('elena')).toContain('testing-strategy');
    expect(getAgentTopCapabilities('unknown')).toContain('general-support');
  });

  test('calculateConfidence should handle edge cases', () => {
    expect(calculateConfidence(0.95, 2)).toBeLessThanOrEqual(0.95);
    expect(calculateConfidence(0.2, 0)).toBeGreaterThanOrEqual(0.25);
    expect(calculateConfidence(0.7, 1)).toBeGreaterThan(0.7);
  });
});
```

### 4. Routing Decision Tests

```javascript
describe('Routing Decisions', () => {
  test('should generate clear reasoning', () => {
    const analysis = {
      domains: ['architecture', 'security'],
      technologies: ['aws'],
      complexity: 8,
      taskType: 'design'
    };
    
    const reasoning = generateReasoning('winston', analysis, 0.85);
    
    expect(reasoning).toContain('highly confident');
    expect(reasoning).toContain('architecture');
    expect(reasoning).toContain('aws');
  });

  test('should provide alternative routes', () => {
    const scores = new Map([
      ['winston', 0.9],
      ['james', 0.7],
      ['marcus', 0.6]
    ]);
    
    const decision = generateRoutingDecision(scores, {
      domains: ['architecture'],
      complexity: 7,
      taskType: 'design'
    });
    
    expect(decision.alternativeRoutes.length).toBeGreaterThan(0);
    expect(decision.alternativeRoutes[0].agent).toBe('james');
  });

  test('should set auto-route flag based on confidence', () => {
    const highConfidenceScores = new Map([['winston', 0.85]]);
    const lowConfidenceScores = new Map([['james', 0.5]]);
    
    const highConfDecision = generateRoutingDecision(highConfidenceScores, { complexity: 5 });
    const lowConfDecision = generateRoutingDecision(lowConfidenceScores, { complexity: 5 });
    
    expect(highConfDecision.flags.autoRoute).toBe(true);
    expect(lowConfDecision.flags.autoRoute).toBe(false);
  });
});
```

### 5. Feature Flag Tests

```javascript
describe('Feature Flags', () => {
  test('should respect ENABLE_SMART_ROUTING flag', () => {
    const originalFlag = ROUTING_FLAGS.ENABLE_SMART_ROUTING;
    
    ROUTING_FLAGS.ENABLE_SMART_ROUTING = false;
    const decision = safeRoute("Build a feature");
    expect(decision.primaryAgent.name).toBe('bmad-master'); // default
    
    ROUTING_FLAGS.ENABLE_SMART_ROUTING = true;
    const smartDecision = safeRoute("Build a feature");
    expect(smartDecision.primaryAgent.name).toBeDefined();
    
    ROUTING_FLAGS.ENABLE_SMART_ROUTING = originalFlag;
  });

  test('should handle errors gracefully', () => {
    // Simulate error by passing null
    const decision = safeRoute(null);
    
    expect(decision).toBeDefined();
    expect(decision.primaryAgent.name).toBe('james'); // fallback
    expect(decision.confidence).toBeLessThan(0.7);
  });
});
```

### 6. Integration Tests

```javascript
describe('End-to-End Routing', () => {
  test('should route security audit to Marcus', () => {
    const request = "Perform a comprehensive security audit of the authentication system";
    const analysis = analyzeTask(request);
    const decision = matchAgents(analysis);
    
    expect(decision.primaryAgent.name).toBe('marcus');
    expect(decision.reasoning).toContain('security');
  });

  test('should route UI design to Sally', () => {
    const request = "Create beautiful and accessible UI mockups for the dashboard";
    const analysis = analyzeTask(request);
    const decision = matchAgents(analysis);
    
    expect(decision.primaryAgent.name).toBe('sally');
  });

  test('should route testing strategy to Elena', () => {
    const request = "Develop comprehensive test strategy with automated regression testing";
    const analysis = analyzeTask(request);
    const decision = matchAgents(analysis);
    
    expect(decision.primaryAgent.name).toBe('elena');
  });

  test('should suggest collaboration for full-stack features', () => {
    const request = "Build a complete user management system with React frontend and Node.js backend";
    const analysis = analyzeTask(request);
    const decision = matchAgents(analysis);
    
    expect(decision.primaryAgent.name).toBe('james');
    expect(decision.supportingAgents.length).toBeGreaterThan(0);
  });
});
```

## Test Execution

To run these tests:

1. Each test should be evaluated against the smart router implementation
2. Verify that the routing logic correctly identifies domains and technologies
3. Ensure agent matching produces sensible results
4. Validate that confidence scores reflect match quality
5. Check that error handling prevents crashes

## Expected Coverage

- Task analysis accuracy: 90%+
- Agent matching correctness: 85%+
- Helper function reliability: 100%
- Error handling robustness: 100%
- Feature flag compliance: 100%

## Performance Benchmarks

- Task analysis: < 10ms
- Agent matching: < 20ms
- Full routing decision: < 50ms
- Error recovery: < 5ms