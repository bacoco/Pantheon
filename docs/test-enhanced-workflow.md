# Testing Enhanced Pantheon Workflow

## Test Scenario: Build a Task Management App

### 1. Test Project Memory Creation

**Input:**
```
Divine council, build a task management app
```

**Expected Behavior:**
- Zeus creates `.pantheon/` folder
- Asks structured questions about vision
- Creates `vision.md` with user's answers
- Memory persists between sessions

**Verification:**
```bash
ls -la .pantheon/
cat .pantheon/vision.md
```

### 2. Test Oracle Review Gate

**Input:**
```
Zeus, I want to build without clear requirements
```

**Expected Behavior:**
- Oracle reviews requirements
- Identifies missing elements:
  - No success criteria
  - No target users defined
  - Missing technical constraints
- Blocks progression to design phase
- Asks for clarification

**Verification:**
- Check `.pantheon/reviews/requirements-review-*.md`
- Ensure design phase doesn't start until approved

### 3. Test Cost-Optimized Routing

**Input:**
```
Divine council, validate my architecture
```

**Expected Behavior:**
- Oracle (Gemini FREE) performs validation
- Apollo (Gemini FREE) checks quality
- Themis (Gemini FREE) verifies compliance
- Cost tracking shows $0.00 for validation

**Verification:**
- Check `.claude/logs/cost-tracking.log`
- Verify Gemini models used for validation

### 4. Test Workflow Progression

**Complete Flow:**

#### Step 1: Requirements
```
Zeus, build a todo app for developers
```
- Zeus creates requirements
- Oracle reviews
- If rejected: Fix and resubmit
- If approved: Move to design

#### Step 2: Design
```
Continue with design phase
```
- Athena creates architecture
- Oracle reviews design
- If rejected: Revise design
- If approved: Move to implementation

#### Step 3: Implementation
```
Proceed with implementation
```
- Hephaestus builds according to design
- Apollo tests (Gemini FREE)
- Oracle final review

### 5. Test Session Persistence

**Test Steps:**
1. Start project:
```
Divine council, build an e-commerce platform
```

2. Answer initial questions
3. Close session
4. Restart Claude Code
5. Resume project:
```
Zeus, continue the e-commerce project
```

**Expected:**
- Zeus loads `.pantheon/` memory
- Knows current phase
- Continues from last point
- Shows progress summary

### 6. Test Model Routing

**Verify routing configuration:**
```bash
cat .claude/configs/model-routing.json
cat .claude/settings.json
```

**Test different task types:**
- Creation: "Zeus, create architecture" → Should use Claude
- Validation: "Oracle, review this" → Should use Gemini FREE
- Quick task: "Hermes, status update" → Should use Gemini Flash FREE

### Success Metrics

✅ **Test Passed If:**
- [ ] `.pantheon/` folder created with all memory files
- [ ] Oracle blocks progression without approval
- [ ] Requirements → Design → Code workflow enforced
- [ ] Validation tasks use FREE Gemini models
- [ ] Creation tasks use Claude models
- [ ] Project memory loads correctly on restart
- [ ] Cost tracking shows 60% reduction
- [ ] All gods respond with correct model

### Common Issues & Solutions

**Issue:** Oracle not reviewing
- **Solution:** Check oracle.md exists in `.claude/agents/`
- **Solution:** Verify oracle added to settings.json gods list

**Issue:** Memory not persisting
- **Solution:** Check `.pantheon/` folder permissions
- **Solution:** Verify Write tool has access to project directory

**Issue:** Wrong model being used
- **Solution:** Check model-routing.json configuration
- **Solution:** Verify settings.json has model_routing enabled

### Test Commands Summary

```bash
# Start new project
"Divine council, build a task management app"

# Check memory
ls -la .pantheon/
cat .pantheon/vision.md

# Test Oracle
"Oracle, review my requirements"

# Check routing
"Show me which model each god uses"

# Test persistence
"Zeus, what's the status of my project?"

# Cost check
"How much have we saved using smart routing?"
```

## Automated Test Script

```javascript
// test-enhanced-pantheon.js
async function testEnhancedWorkflow() {
  console.log("Testing Enhanced Pantheon...");
  
  // Test 1: Project Memory
  const hasMemory = await checkProjectMemory();
  assert(hasMemory, "Project memory created");
  
  // Test 2: Oracle Reviews
  const oracleWorks = await testOracleReview();
  assert(oracleWorks, "Oracle reviews working");
  
  // Test 3: Cost Routing
  const costOptimized = await verifyCostRouting();
  assert(costOptimized, "Cost routing optimized");
  
  // Test 4: Workflow Gates
  const workflowEnforced = await testWorkflowGates();
  assert(workflowEnforced, "Workflow gates enforced");
  
  console.log("✅ All tests passed!");
}
```

## Expected Output Examples

### Good Requirements (Oracle Approves)
```
Oracle: ✅ Requirements approved!
- Clear problem statement ✓
- Target users identified ✓
- Success criteria defined ✓
- Technical constraints listed ✓

Proceeding to design phase...
```

### Bad Requirements (Oracle Rejects)
```
Oracle: ❌ Requirements need improvement:
- Missing measurable success criteria
- Target users too vague
- No technical constraints specified

Please address these issues before proceeding.
```

### Cost Tracking Output
```
Session Cost Analysis:
- Zeus (Claude): $0.003
- Athena (Claude): $0.003
- Oracle (Gemini): $0.000 ← FREE!
- Apollo (Gemini): $0.000 ← FREE!
- Hermes (Flash): $0.000 ← FREE!

Total: $0.006 (Saved: $0.009 / 60%)
```