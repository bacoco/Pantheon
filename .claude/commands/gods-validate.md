# /gods validate - Validate Project Configuration

Have the gods verify your project setup and requirements.

## ACTIVATION

When the user types `/gods validate`, analyze and validate the project configuration.

## Purpose

Ensure project quality by validating:
- pantheon.md structure and completeness
- Project directory organization
- Code quality and standards
- Test coverage
- Documentation completeness
- Security considerations

## Validation Process

### 1. Initial Check
```javascript
// Determine what to validate
if (fileExists("pantheon.md")) {
  validatePantheonFile();
} else if (fileExists("chatrooms/PRD.md")) {
  validateFullProject();
} else {
  showError("No project found to validate!");
}
```

### 2. Summon Validation Gods
```markdown
⚖️ **Summoning the Divine Validators**

Themis approaches with scales of justice...
Athena brings wisdom for validation...
Aegis checks security measures...
```

### 3. Pantheon.md Validation

If validating pantheon.md:

```markdown
📋 **Validating Project Definition**

Checking structure... 
```

#### Required Sections
```javascript
const requiredSections = [
  { name: "Project Type", critical: true },
  { name: "Description", critical: true },
  { name: "Goals", critical: true },
  { name: "Technical Stack", critical: false },
  { name: "Features", critical: true },
  { name: "Constraints", critical: false }
];

// Validate each section
for (const section of requiredSections) {
  const status = checkSection(section);
  reportStatus(section, status);
}
```

#### Validation Report
```markdown
## Pantheon.md Validation Report

### ✅ Valid Sections
- Project Type: Web Application ✓
- Description: Clear and concise ✓
- Goals: 3 goals defined ✓
- Features: 5 features listed ✓

### ⚠️ Warnings
- Technical Stack: Consider specifying framework choice
- Constraints: No timeline specified

### ❌ Missing Sections
- None (all required sections present)

### 📊 Completeness Score: 85%

### Recommendations
1. **Add Technical Details**: Specify your preferred framework (React/Vue/etc)
2. **Define Timeline**: Add time constraints for better planning
3. **Clarify Scope**: Feature 3 could be more specific

### Overall Assessment
**Status: READY FOR PLANNING** ✅

Your pantheon.md is well-structured and ready for `/gods plan`.
Minor improvements suggested but not required.
```

### 4. Full Project Validation

If validating complete project:

```markdown
🏛️ **Comprehensive Project Validation**

Validating all aspects of your divine creation...
```

#### Validation Checklist
```javascript
const validationAreas = [
  {
    name: "Project Structure",
    validator: validateProjectStructure,
    god: "daedalus"
  },
  {
    name: "Code Quality",
    validator: validateCodeQuality,
    god: "hephaestus"
  },
  {
    name: "Test Coverage",
    validator: validateTests,
    god: "themis"
  },
  {
    name: "Security",
    validator: validateSecurity,
    god: "aegis"
  },
  {
    name: "Documentation",
    validator: validateDocs,
    god: "athena"
  },
  {
    name: "Performance",
    validator: validatePerformance,
    god: "hermes"
  }
];
```

#### Detailed Validation Report
```markdown
## Divine Project Validation Report

### 🏗️ Project Structure (Daedalus)
- ✅ Directory structure follows best practices
- ✅ Configuration files properly set up
- ⚠️ Missing: Environment example file (.env.example)
- **Score: 90%**

### 💻 Code Quality (Hephaestus)
- ✅ Consistent code style
- ✅ ESLint configuration present
- ✅ No major code smells detected
- ⚠️ Found 3 TODO comments to address
- **Score: 85%**

### 🧪 Test Coverage (Themis)
- ✅ Test suite configured
- ✅ Unit tests: 24/24 passing
- ❌ Integration tests: Missing
- ⚠️ Coverage: 72% (target: 80%)
- **Score: 70%**

### 🛡️ Security (Aegis)
- ✅ No hardcoded secrets found
- ✅ Dependencies up to date
- ✅ Authentication implemented
- ⚠️ Missing: Rate limiting on API
- **Score: 85%**

### 📚 Documentation (Athena)
- ✅ README.md comprehensive
- ✅ API documentation present
- ❌ Missing: Deployment guide
- ❌ Missing: Contributing guidelines
- **Score: 60%**

### ⚡ Performance (Hermes)
- ✅ Build size optimized
- ✅ Lazy loading implemented
- ⚠️ Consider: Image optimization
- **Score: 80%**

### 📊 Overall Project Score: 78%

### 🔧 Priority Improvements

1. **High Priority**
   - Add integration tests
   - Increase test coverage to 80%
   - Create deployment documentation

2. **Medium Priority**
   - Add .env.example file
   - Implement API rate limiting
   - Add contributing guidelines

3. **Low Priority**
   - Address TODO comments
   - Optimize images
   - Add performance monitoring

### 🎯 Certification Status
**PRODUCTION READY: NO** ❌

Complete high priority items for production readiness.
Current status: **DEVELOPMENT READY** ✅
```

### 5. Generate Improvement Tasks

Create `/projects/[name]/chatrooms/validation-tasks.md`:

```markdown
# Validation Improvement Tasks

Based on divine validation, these tasks will improve your project:

## High Priority Tasks

### 1. Add Integration Tests
```bash
# Create integration test structure
mkdir -p tests/integration

# Add test file
touch tests/integration/api.test.js
```

**Template:**
```javascript
describe('API Integration Tests', () => {
  // Add integration tests here
});
```

### 2. Increase Test Coverage
Target files needing tests:
- `src/services/userService.js` (45% coverage)
- `src/utils/validation.js` (60% coverage)

### 3. Create Deployment Documentation
Add `docs/deployment.md` with:
- Environment setup
- Deployment steps
- Configuration guide
- Troubleshooting

## Implementation Commands
Run these to address issues:
```bash
# Install additional testing tools
npm install --save-dev @testing-library/react-hooks

# Run coverage report
npm run test:coverage

# Security audit
npm audit fix
```
```

### 6. MCP Usage During Validation

Log MCP tool usage:
```markdown
**[timestamp]** - Aegis used web_search
  Query: "Node.js security best practices 2024"
  Found: Rate limiting is critical for production APIs

**[timestamp]** - Themis used mcp__claude-flow__test_analyze
  Analyzed: Test coverage gaps
  Recommendation: Focus on service layer tests
```

### 7. Auto-commit Validation Results

```bash
cd /projects/[name]
git add chatrooms/validation-*.md
git commit -m "docs: add validation report and improvement tasks

- Comprehensive validation completed
- Identified improvement areas
- Generated task list for enhancements
- Project score: 78%"
```

### 8. Success Message

```markdown
✅ **Validation Complete!**

The divine validators have spoken:

**Project Score: 78%** 📊

**Status**: DEVELOPMENT READY ✅
**Production Ready**: Not yet (complete high priority tasks)

**Reports Generated**:
- 📋 Full Report: `chatrooms/validation-report.md`
- 📝 Improvement Tasks: `chatrooms/validation-tasks.md`

**Next Steps**:
1. Address high priority improvements
2. Run `/gods validate` again after fixes
3. Achieve 90%+ score for production readiness

💡 Tip: The gods can help implement improvements!
   Run `/add-feature integration-tests` for test help.
```

## Validation Criteria

### Code Quality Checks
- Linting passes
- No console.logs in production code
- Consistent naming conventions
- Proper error handling

### Security Checks
- No hardcoded credentials
- Dependencies vulnerability scan
- Proper authentication
- Input validation

### Test Coverage Targets
- Unit tests: 80% minimum
- Critical paths: 100% coverage
- Integration tests present

### Documentation Requirements
- README with setup instructions
- API documentation
- Deployment guide
- Architecture decisions

## Error Handling

### No Project Found
```markdown
❌ No project found to validate!

Options:
1. Run `/gods init` to create a new project
2. Navigate to an existing project directory
3. Create a pantheon.md file manually
```

### Validation Failures
```markdown
⚠️ Critical validation failure!

**Issue**: [Specific problem]
**Impact**: This prevents [consequence]

**Suggested Fix**:
[Detailed solution]

Would you like me to:
1. Fix this automatically
2. Show manual fix instructions
3. Continue validation anyway

Choice (1-3): [await input]
```

## Best Practices

1. **Run regularly** - Validate after major changes
2. **Fix incrementally** - Address high priority first
3. **Track progress** - Re-validate to see improvement
4. **Use MCP tools** - Get current best practices
5. **Document findings** - Keep validation history

## Integration Points

### With CI/CD
Validation can be automated:
```yaml
# .github/workflows/validate.yml
- name: Run Pantheon Validation
  run: claude-code validate
```

### With Git Hooks
Pre-commit validation:
```bash
# .git/hooks/pre-commit
/gods validate --quick
```

## Example Usage

```
User: /gods validate

[Validation runs]

System: Project Score: 78%
        Status: DEVELOPMENT READY
        
        High priority improvements needed for production.
        See chatrooms/validation-tasks.md for details.
```