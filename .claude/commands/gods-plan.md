# /gods plan - Generate Development Plan

Create a comprehensive development plan based on project requirements.

## ACTIVATION

When the user types `/gods plan`, analyze the project and generate a detailed development plan.

## Purpose

Transform the project vision from pantheon.md into:
- Phased development approach
- Technical architecture decisions
- Feature breakdown and prioritization
- Risk assessment and mitigation
- Comprehensive Product Requirements Document (PRD)

## Pre-requisites Check

### 1. Check Project Context
```bash
# Check if in a project directory
if [ ! -f "pantheon.md" ]; then
  # Check for saved projects
  if [ -d ".claude/memory/projects" ]; then
    echo "No pantheon.md found. Available projects:"
    ls .claude/memory/projects/*.json
    echo "Use '/gods resume' to load a project"
  else
    echo "No project found. Run '/gods init' to start a new project"
  fi
  exit
fi
```

### 2. Load Project State
```javascript
// Load from current directory's pantheon.md
const pantheonContent = read_file("pantheon.md");
const projectName = extractProjectName(pantheonContent);

// Load session state if exists
const statePath = `.claude/memory/projects/${projectName}-state.json`;
const state = loadSessionState(statePath);
```

## Planning Process

### 1. Welcome Message
```markdown
⚡ **Initiating Divine Planning Session**

📖 Reading project requirements from pantheon.md...
🔍 Analyzing project scope and complexity...
🏛️ Convening the planning council...

*The gods gather to deliberate on your project...*
```

### 2. Summon Planning Gods

Invoke relevant gods based on project type:

```javascript
// Core planning team
const planningGods = ["zeus", "prometheus", "daedalus"];

// Add specialists based on project type
if (projectType.includes("web") || projectType.includes("mobile")) {
  planningGods.push("apollo"); // UX/UI planning
}
if (projectType.includes("api") || projectType.includes("backend")) {
  planningGods.push("aegis"); // Security planning
}

// Transparent summoning
showProgress("Summoning planning council...");
for (const god of planningGods) {
  Task(`Contribute to development plan for ${projectName}`, god);
  logProgress(`${god} has joined the planning session`);
}
```

### 3. Generate Development Phases

Create phased approach in `/projects/[name]/chatrooms/development-phases.md`:

```markdown
# Development Phases - [Project Name]

## Phase 1: Foundation (Week 1-2)
- Set up development environment
- Initialize project structure
- Configure build tools and dependencies
- Set up testing framework
- Create CI/CD pipeline

## Phase 2: Core Architecture (Week 3-4)
- Implement data models
- Set up database/storage
- Create API structure
- Implement authentication
- Set up logging/monitoring

## Phase 3: Core Features (Week 5-8)
- [Feature 1 from pantheon.md]
- [Feature 2 from pantheon.md]
- [Feature 3 from pantheon.md]

## Phase 4: Enhancement (Week 9-10)
- Performance optimization
- Security hardening
- Error handling improvements
- Documentation

## Phase 5: Launch Preparation (Week 11-12)
- User acceptance testing
- Deployment setup
- Monitoring configuration
- Launch checklist
```

### 4. Technical Architecture

Create `/projects/[name]/chatrooms/architecture-decisions.md`:

```markdown
# Architecture Decisions - [Project Name]

## Technology Stack
Based on project requirements, the recommended stack:

### Frontend (if applicable)
- Framework: [React/Vue/Angular/etc]
- State Management: [Redux/Vuex/etc]
- Styling: [Tailwind/CSS Modules/etc]
- Build Tool: [Vite/Webpack/etc]

### Backend (if applicable)
- Runtime: [Node.js/Python/Go/etc]
- Framework: [Express/FastAPI/Gin/etc]
- Database: [PostgreSQL/MongoDB/etc]
- Cache: [Redis/Memcached/etc]

### Infrastructure
- Hosting: [Vercel/AWS/GCP/etc]
- CI/CD: [GitHub Actions/CircleCI/etc]
- Monitoring: [DataDog/NewRelic/etc]

## Key Design Decisions
1. **Decision 1**: [Rationale]
2. **Decision 2**: [Rationale]
3. **Decision 3**: [Rationale]

## Security Considerations
- Authentication method
- Data encryption approach
- API security measures
```

### 5. Generate PRD

Create comprehensive PRD in `/projects/[name]/chatrooms/PRD.md`:

```markdown
# Product Requirements Document (PRD)
## [Project Name]

### Executive Summary
[Generated summary based on pantheon.md]

### Problem Statement
[Extracted from goals in pantheon.md]

### Solution Overview
[High-level solution approach]

### User Personas
1. **Primary User**: [Description]
2. **Secondary User**: [Description]

### Functional Requirements

#### Must Have (P0)
- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]

#### Should Have (P1)
- [ ] [Requirement 4]
- [ ] [Requirement 5]

#### Nice to Have (P2)
- [ ] [Requirement 6]
- [ ] [Requirement 7]

### Non-Functional Requirements
- Performance: [Targets]
- Security: [Requirements]
- Scalability: [Expectations]
- Accessibility: [Standards]

### Technical Specifications
[Reference architecture decisions]

### Success Metrics
1. [Metric 1]: Target value
2. [Metric 2]: Target value
3. [Metric 3]: Target value

### Timeline
[Reference development phases]

### Risks and Mitigation
1. **Risk**: [Description]
   **Mitigation**: [Strategy]

### Dependencies
- External APIs
- Third-party services
- Team dependencies

---
*Generated by Pantheon Planning Council on [date]*
```

### 6. Update Progress Log

Write to `/projects/[name]/chatrooms/planning-progress.md`:

```markdown
# Planning Session Progress

**[timestamp]** - Planning session initiated
**[timestamp]** - Zeus orchestrating overall strategy
**[timestamp]** - Prometheus analyzing market requirements
**[timestamp]** - Daedalus designing system architecture
**[timestamp]** - Apollo planning user experience (if applicable)
**[timestamp]** - Development phases created
**[timestamp]** - Architecture decisions documented
**[timestamp]** - PRD generated
**[timestamp]** - Planning session complete
```

### 7. Auto-commit (if git initialized)

```bash
cd /projects/[name]
git add -A
git commit -m "docs: add development plan and PRD

- Created phased development approach
- Documented architecture decisions
- Generated comprehensive PRD
- Added success metrics and timeline

Generated by Pantheon Planning Council"
```

### 8. Success Message

```markdown
✅ **Development Plan Complete!**

📊 The divine council has created your development blueprint:

**Generated Documents:**
- 📋 Development Phases: `chatrooms/development-phases.md`
- 🏗️ Architecture Decisions: `chatrooms/architecture-decisions.md`
- 📄 Product Requirements: `chatrooms/PRD.md`
- 📈 Planning Progress: `chatrooms/planning-progress.md`

**Key Decisions:**
- Technology Stack: [Summary]
- Development Timeline: [Duration]
- Priority Features: [Top 3]

**Next Steps:**
1. Review the generated documents
2. Run `/gods execute` to generate implementation blueprint
3. Or run `/gods council` for collaborative refinement

💡 All documents have been saved and committed to git!
```

## Error Handling

### No Project Found
```markdown
❌ No project found!

Please run `/gods init` first to create a project, or navigate to an existing project directory.

To see available projects, run `/gods resume`.
```

### Invalid pantheon.md
```markdown
⚠️ Invalid or incomplete pantheon.md!

The planning council needs:
- Project type
- Goals
- Features

Please update pantheon.md and try again.
```

## Integration Points

### With /gods init
- Expects pantheon.md to exist
- Uses project structure created by init
- Updates session state

### With /gods execute
- Execute reads the PRD and phases
- Generates PRP based on plan
- Continues the workflow

### With Divine Council
- Can invoke council for refinement
- Council can enhance the plan
- Collaborative approach available

## MCP Tool Usage

Log all MCP tool usage:

```markdown
**[timestamp]** - Prometheus used web_search for market analysis
  Query: "best practices [project type]"
  Found: [Key insights]

**[timestamp]** - Daedalus used Grep to analyze code patterns
  Analyzed: Similar project architectures
  Insights: [Architecture patterns]
```

## Best Practices

1. **Always check prerequisites** - Ensure project exists
2. **Log progress transparently** - Show what gods are doing
3. **Generate actionable documents** - Not just templates
4. **Commit automatically** - Preserve work
5. **Provide clear next steps** - Guide user journey
6. **Use MCP tools** - Enhance with real research

## Example Usage

```
User: /gods plan