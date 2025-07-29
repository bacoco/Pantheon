# /gods execute - Generate Implementation Blueprint & Execute

Generate a Product Requirements Prompt (PRP) and optionally implement the project.

## ACTIVATION

When the user types `/gods execute`, create an implementation-ready blueprint and offer to build it.

## Purpose

Transform the development plan into:
- Detailed Product Requirements Prompt (PRP)
- Step-by-step implementation guide
- Code templates and examples
- Test specifications
- Optional: Actual implementation

## Pre-requisites Check

### 1. Verify Project State
```javascript
// Check for required files
const requiredFiles = [
  "pantheon.md",
  "chatrooms/PRD.md",
  "chatrooms/development-phases.md"
];

for (const file of requiredFiles) {
  if (!fileExists(file)) {
    showError(`Missing ${file}. Please run '/gods plan' first.`);
    return;
  }
}
```

### 2. Load Project Context
```javascript
const projectName = loadProjectName();
const prd = read_file("chatrooms/PRD.md");
const phases = read_file("chatrooms/development-phases.md");
const architecture = read_file("chatrooms/architecture-decisions.md");
```

## Execution Process

### 1. Welcome Message
```markdown
⚡ **Divine Implementation Council Convening**

📋 Loading development plan...
🏗️ Preparing implementation blueprint...
💻 Summoning the implementation gods...

*The forge of Hephaestus awakens...*
```

### 2. Summon Implementation Gods

```javascript
const implementationGods = [
  "hephaestus", // Lead implementer
  "themis",     // Quality assurance
  "hermes"      // Agile process
];

// Add specialists based on project
if (hasUI) implementationGods.push("apollo");
if (hasAPI) implementationGods.push("aegis");

// Log summoning
logProgress("Implementation council assembling...");
```

### 3. Generate PRP

Create `/projects/[name]/chatrooms/PRP.md`:

```markdown
# Product Requirements Prompt (PRP)
## [Project Name] - Implementation Blueprint

### 🎯 Implementation Goal
[From PRD executive summary]

### 🏗️ Project Setup

\```bash
# Initialize project
cd /projects/[name]
[Technology-specific setup commands]

# Install dependencies
[Package manager] install [dependencies]

# Set up development environment
[Environment setup]
\```

### 📁 Project Structure

\```
[project-name]/
├── src/
│   ├── components/     # UI components
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── [other dirs]/
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
└── [config files]
\```

### 💻 Phase 1: Foundation Implementation

#### Task 1.1: Project Initialization
\```[language]
// Example code for initial setup
[Actual code template]
\```

#### Task 1.2: Configuration
\```[language]
// Configuration setup
[Configuration code]
\```

### 🧪 Testing Strategy

#### Unit Tests
\```[language]
// Example test
[Test code template]
\```

#### Integration Tests
\```[language]
// Integration test example
[Test code]
\```

### 🚀 Deployment Configuration

\```yaml
# Deployment config
[Deployment template]
\```

### ✅ Implementation Checklist

- [ ] Project structure created
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Core models implemented
- [ ] API endpoints created
- [ ] Frontend components built
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Deployment configured

### 📊 Success Criteria
[From PRD success metrics]

---
*Implementation blueprint by the Divine Forge*
```

### 4. Update Progress

Write to `/projects/[name]/chatrooms/implementation-progress.md`:

```markdown
# Implementation Progress

**[timestamp]** - PRP generation started
**[timestamp]** - Hephaestus designing code architecture
**[timestamp]** - Themis preparing test specifications
**[timestamp]** - Apollo crafting UI components (if applicable)
**[timestamp]** - Hermes organizing agile workflow
**[timestamp]** - PRP generation complete
```

### 5. Auto-commit PRP

```bash
cd /projects/[name]
git add -A
git commit -m "docs: add implementation blueprint (PRP)

- Created detailed implementation guide
- Added code templates and examples
- Defined testing strategy
- Set up deployment configuration

Ready for implementation phase"
```

### 6. Offer Implementation

```markdown
✅ **Implementation Blueprint Ready!**

📄 PRP Location: `/projects/[name]/chatrooms/PRP.md`

The divine blueprint contains:
- Complete project structure
- Code templates for all components
- Testing specifications
- Deployment configuration

**Would you like me to implement this blueprint now?** (y/n)

If yes, I will:
1. Create all project files
2. Implement core functionality
3. Set up tests
4. Configure deployment
5. Provide a working application

Choice: [await user input]
```

### 7. If User Chooses Implementation

#### 7a. Implementation Phase
```javascript
if (userChoice === 'y') {
  showMessage("🔨 Beginning divine implementation...\n");
  
  // Create project structure
  createProjectStructure();
  logProgress("Project structure created");
  
  // Implement each phase
  for (const phase of phases) {
    implementPhase(phase);
    runTests();
    commitProgress(phase);
  }
  
  // Final setup
  setupDeployment();
  runFullTestSuite();
}
```

#### 7b. Real-time Progress Updates
```markdown
🔨 **Implementation in Progress**

Creating project structure... ✓
Installing dependencies... ✓
Implementing Phase 1: Foundation... 
  - Setting up [component]... ✓
  - Configuring [service]... ✓
  - Running tests... ✓ (8/8 passing)
  
[Continue with live updates]
```

#### 7c. Launch Preview
After implementation:
```javascript
// Detect framework and start dev server
const framework = detectFramework();
const devCommand = getDevCommand(framework);

showMessage("🚀 Launching preview server...");
const result = bash(devCommand);

// Show URLs
showMessage(`
✨ **Project Ready!**

🌐 Local: http://localhost:3000
📱 Network: http://192.168.1.x:3000
📊 Metrics: All tests passing (24/24)

The gods have forged your application!
`);
```

### 8. Final Success Message

If implementation was chosen:
```markdown
🎉 **Implementation Complete!**

Your project has been divinely crafted with:
- ✅ All features implemented
- ✅ Tests written and passing
- ✅ Documentation generated
- ✅ Git commits for each phase
- ✅ Development server running

**Access your application:**
- 🌐 Local: http://localhost:3000
- 📁 Code: `/projects/[name]/`
- 📚 Docs: `/projects/[name]/docs/`

**Next steps:**
1. Test the application
2. Deploy with `/deploy` (if available)
3. Or push to GitHub: `git push origin main`
```

If only PRP was generated:
```markdown
📄 **Blueprint Complete!**

Your PRP is ready at: `/projects/[name]/chatrooms/PRP.md`

To implement later:
1. Run `/execute-prp chatrooms/PRP.md`
2. Or copy the PRP for manual implementation
3. Or share with your development team
```

## MCP Tool Usage Logging

During implementation, log all MCP usage:

```markdown
**[timestamp]** - Hephaestus used mcp__claude-flow__github_repo_analyze
  Analyzed: Best practices for [framework]
  Applied: [Pattern] in components

**[timestamp]** - Apollo used mcp__playwright__screenshot
  Captured: UI inspiration from [source]
  Implemented: Similar pattern in design

**[timestamp]** - Themis used mcp__claude-flow__test_generate
  Generated: Test suite for [component]
  Result: 12 test cases created
```

## Error Handling

### Missing Prerequisites
```markdown
❌ Missing development plan!

Please run these commands in order:
1. `/gods init` - Create project
2. `/gods plan` - Generate development plan
3. `/gods execute` - Create implementation blueprint
```

### Implementation Errors
```markdown
⚠️ Implementation issue detected!

Error: [Specific error]
Location: [File and line]

The gods are investigating...

Suggested fix:
[Proposed solution]

Would you like me to:
1. Apply the fix and continue
2. Skip this component
3. Stop and let you fix manually

Choice (1-3): [await input]
```

## Best Practices

1. **Always validate context** - Ensure plan exists
2. **Generate working code** - Not just templates
3. **Test as you go** - Run tests after each component
4. **Commit frequently** - Preserve progress
5. **Provide real previews** - Launch actual dev server
6. **Log MCP usage** - Show research and insights
7. **Handle errors gracefully** - Offer solutions

## Integration Points

### With execute-prp
- The generated PRP is compatible
- Can be run independently later
- Same validation and structure

### With Live Preview
- Automatically launches after implementation
- Shows real running application
- Provides network URLs

### With Git/GitHub
- Commits after each phase
- Ready to push to GitHub
- Deployment-ready code

## Example Usage

```
User: /gods execute

[Gods generate PRP]

System: Would you like me to implement this blueprint now? (y/n)

User: y

[Implementation proceeds with real-time updates]
```