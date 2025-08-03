# 🎯 Interactive Examples & Tutorials

## Quick Start Tutorial

### Example 1: Your First Feature (15 minutes)

Let's build a simple user authentication feature step-by-step:

```bash
# Step 1: Start your session
$ /session start --type feature-development --project "my-app"

📊 Session started: my-app-2024-01-15-1500
🎯 Workflow: feature-development
💰 Budget: $5.00
```

```bash
# Step 2: Plan with Zeus
$ /gods plan user-authentication

⚡ ZEUS ORCHESTRATING...
📋 Breaking down into phases:
1. Design authentication flow
2. Implement JWT tokens
3. Add password hashing
4. Create middleware
5. Write tests

Ready for validation. Run:
gemini "Validate auth plan: JWT tokens, bcrypt hashing, Express middleware"
```

```bash
# Step 3: In your terminal (copy & paste)
$ gemini "Validate auth plan: JWT tokens, bcrypt hashing, Express middleware"

🔍 APOLLO VALIDATING...
✅ Solid approach! Suggestions:
- Add refresh tokens for better UX
- Consider rate limiting for security
- Use RS256 instead of HS256 for production
```

```bash
# Step 4: Build with Hephaestus
$ /gods build auth-system

🔨 HEPHAESTUS BUILDING...
Creating files:
✅ src/auth/jwt.js
✅ src/auth/middleware.js
✅ src/auth/passwords.js
✅ tests/auth.test.js

Ready for validation!
```

```bash
# Step 5: Batch validate everything
$ /batch-validate files --list "src/auth/*" --type all

📦 Batch validation prepared. Run:
gemini "Validate all: [provides code context for all files]"
```

**Expected Result:**
- Working authentication system
- Validated by Gemini (FREE)
- Total cost: ~$0.45 (Claude only)
- Time: 15 minutes

---

### Example 2: Emergency Bug Fix (5 minutes)

Real scenario: Production login is failing!

```bash
# Quick diagnosis
$ /gods analyze-bug "Users can't login, getting 401 errors"

👟 HERMES ANALYZING (Fast mode)...
Checking common issues:
- Token expiration ✓
- Database connection ✓
- Middleware ordering ❌ <- Found it!

Run: gemini "Confirm diagnosis: Express middleware order causing auth to run before body parser"
```

```bash
# Terminal:
$ gemini "Confirm diagnosis: Express middleware..."

✅ Confirmed! Fix: Move auth middleware after body-parser
```

```bash
# Apply fix
$ /gods fix middleware-order

🔨 Quick fix applied:
Changed: app.js line 15-20
Moved auth middleware after body-parser

$ /batch-validate changes --type security --critical-only

✅ Fix validated - Deploy ready!
```

**Time saved:** 30 minutes of debugging
**Cost:** $0.08

---

### Example 3: Architecture Review (30 minutes)

Review your entire codebase architecture:

```bash
# Step 1: Map current architecture
$ /gods map-architecture

🦉 ATHENA ANALYZING...
Found:
- 3 services (auth, api, database)
- 15 modules
- 45 components

Generating architecture map...
```

```bash
# Step 2: Batch validate architecture
$ /batch-validate architecture --components "*" --depth deep --parallel

📦 Prepared 3 parallel validations:

Terminal 1:
gemini "Validate auth service architecture: [details]"

Terminal 2:
gemini "Validate api service architecture: [details]"

Terminal 3:
gemini "Validate database architecture: [details]"
```

```bash
# Step 3: Get comprehensive report
$ /export report --template architecture-review

📊 Architecture Review Report
Score: 85/100

Strengths:
✅ Good separation of concerns
✅ Consistent naming
✅ Proper error handling

Issues Found:
⚠️ Circular dependency: auth ↔ user
⚠️ Missing caching layer
⚠️ No rate limiting

Recommendations:
1. Add Redis caching
2. Implement rate limiting
3. Refactor auth/user dependency
```

---

## Interactive Workflow Builder

### Build Your Custom Workflow

```bash
$ /workflow interactive

🎯 WORKFLOW BUILDER
==================

What are you building?
1. Web API
2. React Frontend  
3. Full-Stack App
4. CLI Tool
5. Library

> 1

What's your priority?
1. Speed (use more Gemini)
2. Quality (use more Claude)
3. Cost (maximize FREE tier)

> 3

Team size?
1. Solo
2. Small (2-5)
3. Large (5+)

> 1

GENERATING OPTIMAL WORKFLOW...

📋 Your Custom Workflow: "cost-optimized-api"
=============================================
1. Planning: Claude Sonnet (minimal)
2. Research: Gemini Flash (FREE)
3. Building: Claude Sonnet (efficient)
4. All Validation: Gemini Pro (FREE)
5. Documentation: Gemini Flash (FREE)

Estimated cost: $1.20 (75% savings)
Estimated time: 2 hours

Save this workflow? (y/n) > y
✅ Saved as: .claude/workflows/cost-optimized-api.json
```

---

## Live Examples with Expected Output

### Example: Real-time Validation

```bash
$ /gods build user-service

🔨 Building user-service...
```

**LIVE OUTPUT:**
```javascript
// Creating: src/services/user.js
class UserService {
  constructor(db) {
    this.db = db;
  }
  
  async createUser(userData) {
    // Validating with Apollo...
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.db.users.create({
      ...userData,
      password: hashedPassword
    });
  }
}

✅ Apollo suggests: Add input validation
🔧 Applying suggestion...

class UserService {
  constructor(db) {
    this.db = db;
  }
  
  async createUser(userData) {
    // Input validation added
    if (!userData.email || !userData.password) {
      throw new Error('Email and password required');
    }
    
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.db.users.create({
      ...userData,
      password: hashedPassword
    });
  }
}

✅ Code validated and improved!
```

---

## Try It Yourself Exercises

### Exercise 1: Build a REST API
```bash
# Your task: Create a TODO API with CRUD operations
# Time limit: 20 minutes
# Budget: $2.00

# Start here:
$ /session start --type feature-development --project "todo-api"

# Hints:
# - Use batch validation for all endpoints
# - Let Gemini validate your OpenAPI spec (FREE)
# - Use Hermes for quick iterations
```

<details>
<summary>Solution</summary>

```bash
$ /gods plan todo-api
$ gemini "Validate TODO API design with CRUD"
$ /gods build todo-crud
$ /batch-validate files --list "src/api/*" --type all
$ /export api --format openapi
```
</details>

### Exercise 2: Optimize Expensive Workflow
```bash
# Current workflow costs $10 per feature
# Your goal: Reduce to $3 while maintaining quality

# Analyze current workflow:
$ /workflow analyze --current-cost 10.00

# Hints:
# - Move validation to Gemini
# - Batch similar tasks
# - Use Gemini Flash for simple tasks
```

<details>
<summary>Solution</summary>

```bash
$ /workflow optimize --target-cost 3.00
$ /batch-validate all --use-gemini
$ /workflow template create --name "optimized" \
    --validation "gemini-only" \
    --documentation "gemini-flash"
```
</details>

---

## Common Patterns Cookbook

### Pattern: Test-Driven Development
```bash
# 1. Write tests first (Claude)
$ /gods write-tests feature-name

# 2. Validate test coverage (Gemini FREE)
$ gemini "Validate test scenarios for: [tests]"

# 3. Implement to pass tests
$ /gods implement feature-name --tdd

# 4. Validate implementation
$ /batch-validate tdd --tests "tests/*" --impl "src/*"
```

### Pattern: Parallel Development
```bash
# Terminal 1: Frontend
$ /gods build frontend --component user-dashboard

# Terminal 2: Backend
$ /gods build backend --api user-endpoints

# Terminal 3: Continuous validation
$ /workflow continuous-validation --watch
```

### Pattern: Cost-Conscious Development
```bash
# Use Claude only for complex logic
$ /gods build complex-algorithm  # Claude

# Everything else with Gemini
$ gemini "Write tests for algorithm"  # FREE
$ gemini "Document the algorithm"     # FREE
$ gemini "Create examples"            # FREE
```

---

## Success Metrics

Track your improvement with these benchmarks:

| Metric | Beginner | Intermediate | Expert |
|--------|----------|--------------|--------|
| Cost per feature | $5-10 | $2-5 | <$2 |
| Validation rate | 30% | 70% | 95% |
| Batch usage | 10% | 50% | 80% |
| Time per feature | 4h | 2h | 1h |
| Quality score | 70 | 85 | 95+ |

---

## Video-Style Walkthroughs

### 🎬 "Building a Login System in 10 Minutes"

```
[00:00] Start session
$ /session start --type feature-development

[00:30] Plan architecture
$ /gods plan login-system

[01:00] Validate with Gemini (FREE)
$ gemini "Validate login architecture"

[02:00] Build components
$ /gods build login-components

[05:00] Batch validate
$ /batch-validate all

[07:00] Fix issues
$ /gods fix validation-issues

[09:00] Final validation
$ gemini "Final security check"

[10:00] Export and done!
$ /export pr-description
```

### 🎬 "From $50 to $5: Cost Optimization"

```
[00:00] Analyze current costs
$ /workflow analyze --verbose

[01:00] Identify waste
- Single validations: $15
- Redundant Claude calls: $20
- Unused features: $15

[02:00] Implement optimizations
$ /workflow optimize --aggressive

[03:00] New workflow:
- Batch all validations
- Use Gemini for ALL validation
- Claude for creation only

[04:00] Result: 90% cost reduction!
```

---

## Sandbox Environment

Practice without cost concerns:

```bash
$ /sandbox start

🏖️ SANDBOX MODE ACTIVE
- No real API calls
- Simulated responses
- Perfect for learning

Try anything:
$ /gods plan massive-project
$ /batch-validate everything
$ /workflow optimize --extreme

Exit sandbox:
$ /sandbox exit
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│         PANTHEON QUICK REFERENCE         │
├─────────────────────────────────────────┤
│ Start:    /session start                 │
│ Plan:     /gods plan [feature]          │
│ Build:    /gods build [component]       │
│ Validate: /batch-validate all           │
│ Export:   /export validation            │
├─────────────────────────────────────────┤
│ Cost Savers:                            │
│ • Use batch validation always           │
│ • Gemini for ALL validation (FREE)      │
│ • Claude for creation only              │
│ • Cache validation results              │
├─────────────────────────────────────────┤
│ Speed Tips:                             │
│ • Use parallel terminals                │
│ • Batch similar tasks                   │
│ • Use workflow templates                │
│ • Enable progressive validation         │
└─────────────────────────────────────────┘
```