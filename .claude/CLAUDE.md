# 🏛️ Pantheon God Configuration

## Core Architecture

### BMAD-METHOD Integration
The Pantheon system uses the BMAD methodology for structured development:

- **Two-Phase Workflow**: Planning → Execution
- **Sacred Scrolls**: XML-based context preservation
- **Quality Gates**: Oracle enforces standards at checkpoints
- **Context Management**: Automatic scroll creation and archival

### God Registry
All gods are defined in `.claude/agents/` with:
- YAML header configuration
- Tools and capabilities
- Integration patterns
- Command examples

## Available Gods

### Core Gods
- **zeus**: Master orchestrator and project planning
- **athena**: System architecture and strategic design
- **hephaestus**: Implementation and construction
- **apollo**: Quality validation and testing
- **hermes**: Communication and coordination
- **oracle**: Quality gates and standards enforcement

### BMAD Specialist Gods
- **mnemosyne**: Memory goddess - Sacred Scrolls custodian
- **chronos**: Time god - Two-phase workflow enforcement
- **moirai**: Three Fates - Phase transition management
- **hypergraphia**: Hyper-detailed documentation specialist
- **zeus-bmad**: BMAD-enhanced orchestrator

### CI/CD Gods
- **githeus-ci**: Version control with CI/CD powers
- **bmad-tester**: Automated testing specialist
- **scroll-manager**: Sacred Scrolls maintenance
- **quality-gate**: Phase transition validation

## Usage Patterns

### Basic Invocation
```javascript
Task("zeus", "Plan authentication system");
Task("athena", "Design microservices architecture");
Task("hephaestus", "Build user service");
```

### BMAD Workflow
```javascript
// Phase 1: Planning
Task("zeus-bmad", "Start Phase 1 planning for e-commerce");
Task("mnemosyne", "Create Sacred Scroll for project");

// Phase 2: Execution  
Task("chronos", "Validate phase transition");
Task("hephaestus", "Execute from Sacred Scroll");
```

### CI/CD Automation
```javascript
Task("githeus-ci", "Setup automated workflows");
Task("bmad-tester", "Run comprehensive tests");
Task("quality-gate", "Validate deployment readiness");
```

## Sacred Scrolls System

### Directory Structure
```
.pantheon/
├── scrolls/          # Active Sacred Scrolls
├── archives/         # Historical scrolls
├── ci-reports/       # CI/CD reports
└── metrics/          # Performance metrics
```

### Scroll Format
```xml
<sacred-scroll>
  <metadata>
    <project>Name</project>
    <phase>1|2</phase>
    <timestamp>ISO-8601</timestamp>
  </metadata>
  <planning>...</planning>
  <execution>...</execution>
</sacred-scroll>
```

## Hooks Integration

Claude Code hooks provide automation:
- **PostToolUse**: Auto-test after file changes
- **Stop**: Auto-commit when tests pass
- **PreToolUse**: Protect Sacred Scrolls
- **SubagentStop**: Track god completion

## Interactive Requirements Gathering

Gods interactively collect project requirements:
- App name and description
- UI reference URLs for analysis
- CSS frameworks and styling preferences
- Image assets and design resources
- Technical stack preferences
- Deployment targets

## Best Practices

### Phase Management
1. Always start with Phase 1 planning
2. Use Chronos to validate transitions
3. Create Sacred Scrolls for context
4. Use Oracle for quality gates

### Collaboration
1. Use TodoWrite for task tracking
2. Launch parallel gods for independent work
3. Use Memory for cross-god coordination
4. Monitor with Hermes for progress

### Quality Assurance
1. Auto-test with hooks
2. Use Oracle at checkpoints
3. Run bmad-tester before releases
4. Validate with quality-gate

## Configuration Files

### Essential Files
- `.claude/agents/`: God definitions
- `.claude/hooks.json`: Automation hooks
- `.claude/scripts/pantheon-ci.sh`: CI/CD orchestration
- `.pantheon/`: Sacred Scrolls and state

### Settings
- `CLAUDE.md`: Project configuration
- `.claude/README.md`: Technical documentation

---

*Pantheon v2.0 - BMAD-Enhanced Multi-AI Orchestration*