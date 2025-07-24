# Routing Command Test Scenarios

This file tests the `/gods route` command implementation.

## Test 1: Basic Routing

### Command
```
/gods route Implement user authentication with JWT tokens
```

### Expected Analysis
```yaml
domains: [implementation, security, authentication]
technologies: [jwt]
complexity: 5
taskType: implementation
```

### Expected Routing
- Primary: James (Developer) - High confidence
- Supporting: Marcus (Security) - Authentication expertise
- Alternatives: Winston (architecture approach)

## Test 2: Complex Multi-Domain

### Command
```
/gods route Design and build a scalable real-time chat system with React frontend, Node.js backend, WebSocket support, and Redis for message queue
```

### Expected Analysis
```yaml
domains: [architecture, implementation, frontend, backend, ui]
technologies: [react, nodejs, redis]
complexity: 8-9
taskType: design/implementation
```

### Expected Routing
- Primary: Baco Master or Winston (complexity requires orchestration)
- Team composition suggested
- Multiple alternatives provided

## Test 3: UI/UX Task

### Command
```
/gods route Create accessible and responsive mockups for mobile banking app
```

### Expected Analysis
```yaml
domains: [ui, user_experience, design_systems]
technologies: []
complexity: 6
taskType: design
```

### Expected Routing
- Primary: Sally (UX Designer) - Expert match
- Supporting: Pixel (UI quality)
- High confidence (>90%)

## Test 4: Testing Task

### Command
```
/gods route Develop comprehensive E2E test suite for checkout flow
```

### Expected Analysis
```yaml
domains: [testing, quality_assurance]
technologies: []
complexity: 6
taskType: testing
```

### Expected Routing
- Primary: Elena (QA Lead) - Expert match
- Supporting: James (implementation support)
- Pattern match: "test suite"

## Test 5: Security Audit

### Command
```
/gods route Perform security audit and penetration testing for our API
```

### Expected Analysis
```yaml
domains: [security, testing]
technologies: []
complexity: 7
taskType: analysis/testing
```

### Expected Routing
- Primary: Marcus (Security Expert)
- Supporting: Elena (testing methodology)
- High confidence

## Test 6: Edge Cases

### Unclear Request
```
/gods route fix the thing
```

Expected: Request for clarification

### No Technology Match
```
/gods route Implement quantum computing algorithm
```

Expected: Lower confidence, Baco Master fallback

### Simple Task
```
/gods route Add a button to the homepage
```

Expected: James with high confidence, low complexity

## Test 7: Feature Flags

### When Disabled
```yaml
SMART_ROUTING.enabled: false
```

Expected: Message that routing is disabled, fallback to default

### Preview Mode
```
/gods route --preview Design microservices architecture
```

Expected: Show routing without activation

### Auto Mode
```
/gods route --auto Fix CSS styling issue
```

Expected: Auto-accept if confidence > 70%

## Test 8: JSON Output

### Command
```
/gods route --json Build REST API
```

### Expected Output Structure
```json
{
  "analysis": {...},
  "routing": {
    "primaryAgent": {...},
    "supportingAgents": [...],
    "alternatives": [...]
  },
  "flags": {...}
}
```

## Validation Checklist

For each test scenario, verify:

1. ✓ Task analysis correctly identifies domains
2. ✓ Technology detection works accurately
3. ✓ Complexity scoring is reasonable
4. ✓ Agent matching follows capability metadata
5. ✓ Confidence scores reflect match quality
6. ✓ Supporting agents add value
7. ✓ Alternatives are sensible
8. ✓ Error handling for edge cases
9. ✓ Feature flags are respected
10. ✓ Output format matches specification

## Performance Requirements

- Task analysis: < 50ms
- Full routing decision: < 100ms
- Error recovery: < 10ms
- Memory usage: < 10MB per request