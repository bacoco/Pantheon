# Pantheon Technical Architecture

This document describes the technical implementation of Pantheon, a prompt-based orchestration system for Claude Code where AI gods collaborate to build software.

## Architecture Overview

Pantheon is a **prompt-based system** that runs entirely within Claude Code. It does not contain executable code - instead, it provides structured markdown instructions that Claude interprets and executes.

### Core Components

```
.claude/
├── commands/          # Command definitions (markdown instructions)
│   ├── analyze.md    # Multi-dimensional task analysis
│   ├── orchestrate.md # Agent coordination
│   ├── generate-prp.md # PRP generation
│   ├── gods.md       # gods workflow commands
│   ├── workflow.md   # Multi-agent workflow orchestration
│   ├── git.md        # Git integration commands
│   ├── preview.md    # Live preview server
│   ├── add-feature.md # Incremental feature addition
│   ├── update-deps.md # Dependency management
│   └── help.md       # Command reference
├── agents/           # Agent personas and expertise
│   ├── winston.md    # System Architect
│   ├── james.md      # Senior Developer
│   ├── elena.md      # QA Engineer
│   ├── marcus.md     # Security Expert
│   ├── prometheus.md  # Product Manager
│   ├── sarah.md      # Product Owner
│   ├── bob.md        # Scrum Master
│   ├── sally.md      # UX Designer
│   ├── vision.md     # Style Guide Generator
│   ├── fusion.md     # Design Optimizer
│   ├── motion.md     # Animation Specialist
│   ├── voice.md      # Microcopy Expert
│   ├── janus.md      # Meta-orchestrator
│   └── zeus.md       # Supreme Orchestrator (main entry point)
├── lib/              # Core libraries and engines
│   ├── workflow-engine.md # Multi-agent workflow execution
│   ├── workflow-visualizer.md # Workflow progress display
│   ├── git-integration.md # Git operations library
│   ├── live-preview.md # Development server management
│   ├── incremental-updates.md # Safe project modifications
│   ├── cross-domain-bridge.md # Cross-domain execution
│   └── workflow-optimization-engine.md # Workflow optimization
├── utils/            # Parsing and analysis utilities
│   ├── pantheon-parser.md
│   └── example-analyzer.md
├── schemas/          # Data structure definitions
│   └── pantheon-md-schema.yaml
└── memory/           # Pattern storage
    └── patterns.json
```

## How Pantheon Works

### 1. Command Invocation Flow

When a user types `/command`, Claude:

1. Reads `.claude/commands/{command}.md`
2. Finds the ACTIVATION section
3. Interprets the instructions as pseudo-code
4. Executes the logic using available tools
5. Formats output according to specifications

Example from `/analyze` command:
```markdown
ACTIVATION: When user types `/analyze <task>`, perform complexity analysis.

INSTRUCTIONS:
1. Parse the task description
2. Analyze across 5 dimensions
3. Calculate complexity scores
4. Generate recommendations
```

### 2. Agent Orchestration

Pantheon employs 15 specialized AI gods organized into divine teams:

#### Agent Teams

**Core Development & Management Team** (Phase 4):
- **Daedalus** (Architect): System design, ADRs, component diagrams
- **Hephaestus** (Developer): Implementation, code quality, performance
- **Themis** (QA): Test plans, automated testing, quality metrics
- **Aegis** (Security): Security audits, compliance, threat modeling
- **Prometheus** (PM): Product strategy, PRDs, roadmaps
- **Athena** (PO): Backlog management, user stories, acceptance criteria
- **Hermes** (SM): Agile processes, sprint planning, story preparation
- **Apollo** (UX): User experience, UI specs, design systems

**UI Enhancement Team** (Advanced):
- **Oracle**: Extracts design tokens from visual inspiration
- **Harmonia**: Optimizes designs for target audiences
- **Iris**: Adds performance-conscious animations (60fps)
- **Calliope**: Ensures consistent brand communication

**Orchestration Layer**:
- **Janus**: Meta-orchestrator with universal tool access
- **Smart Routing Engine**: Analyzes complexity and routes tasks

#### Agent Integration

Agents are integrated throughout the system via:

1. **Commands**: Primary actors in `/agent`, `/workflow`, `/route`, `/team`
2. **Core Libraries**: Central to `smart-router.md`, `workflow-engine.md`
3. **Templates**: Agent-specific artifacts in `.claude/templates/agents/`
4. **MCPs**: Each agent has specific tool permissions
5. **Testing**: Unit tests ensure proper routing (e.g., "architecture → Daedalus")

#### Workflow Examples

```
Product Development: Prometheus → Athena → Hermes → Development Team
UI Enhancement: Oracle → Harmonia → Iris → Calliope
Implementation: Daedalus → Hephaestus → Themis
Security Review: Aegis reviews all → Recommendations
```

#### Orchestration Hierarchy
Zeus serves as the Supreme Orchestrator (main entry point), while Janus handles meta-orchestration for complex multi-agent workflows. The Smart Routing Engine assists with intelligent task routing.

### 3. pantheon.md Processing

The new simplified workflow uses structured project files:

```yaml
---
version: 1.0
project_type: "Web Application"
author: "Developer Name"
---

## FEATURE: Feature Name
Description and requirements...

## EXAMPLES:
- `./path/to/example.js`: Pattern demonstration

## CONSTRAINTS:
- Technical requirements
```

Processing steps:
1. **Validation**: Check YAML frontmatter and section structure
2. **Parsing**: Extract features, examples, constraints
3. **Analysis**: Determine complexity and team needs
4. **Planning**: Generate phased implementation approach
5. **Execution**: Create comprehensive PRP

### 4. Convention Detection

The example analyzer (`example-analyzer.md`) instructs Claude to:

1. Parse provided code examples
2. Identify patterns:
   - Naming conventions
   - File structure
   - Import styles
   - Testing approaches
   - Documentation format
3. Generate "discovered constraints"
4. Apply patterns to generated code

## Implementation Details

### Pseudo-Code Interpretation

Pantheon uses pseudo-code that Claude interprets. Example:

```python
# From pantheon-parser.md
def parse_pantheon_file(content):
    # Extract frontmatter
    if content.startswith('---'):
        frontmatter = extract_yaml_frontmatter(content)
        validate_frontmatter(frontmatter)
    
    # Parse sections
    features = extract_sections('FEATURE:', content)
    examples = extract_sections('EXAMPLES:', content)
    constraints = extract_sections('CONSTRAINTS:', content)
    
    return {
        'metadata': frontmatter,
        'features': features,
        'examples': examples,
        'constraints': constraints
    }
```

Claude interprets this as instructions for how to process files, not actual executable code.

### Dynamic Team Composition

Based on project analysis, Pantheon summons relevant deities:

```yaml
High Complexity + Security Requirements:
  - Daedalus (Architect)
  - Aegis (Security)
  - Themis (QA)
  - Hephaestus (Developer)

Data-Heavy Project:
  - Daedalus (Architect)
  - Data Analyst (if available)
  - Hephaestus (Developer)
  - Themis (QA)
```

### Pattern Learning

Successful patterns are stored in `.claude/memory/patterns.json`:

```json
{
  "patterns": [
    {
      "id": "auth-jwt-pattern",
      "task": "JWT authentication",
      "approach": "Middleware-based validation",
      "success_metrics": {
        "security": "high",
        "performance": "200ms avg"
      },
      "applicability": ["web-api", "microservices"]
    }
  ]
}
```

## Integration Points

### 1. Command Chaining

Commands can be composed:
```bash
/analyze "Build chat app"          # Understand complexity
/orchestrate "Build chat app"      # Get expert insights  
/generate-prp "Build chat app"     # Create implementation guide
```

### 2. pantheon.md Integration

When a `pantheon.md` file exists, all commands leverage it:
- `/analyze` includes all features and constraints
- `/orchestrate` uses recommended team composition
- `/generate-prp` incorporates full project context

### 3. Tool Usage

Pantheon commands instruct Claude to use available tools:
- **Read**: Access command/agent definitions
- **TodoWrite**: Maintain task tracking
- **Multi-file operations**: Batch analysis

## File Format Specifications

### pantheon.md Schema

Required structure:
- YAML frontmatter with version, project_type, author
- Markdown sections with specific headers
- Feature dependencies noted inline
- Priority markers: [HIGH PRIORITY], [MEDIUM PRIORITY], [LOW PRIORITY]

### Command File Structure

```markdown
# /command-name - Brief Description

ACTIVATION: Trigger condition and basic behavior

INSTRUCTIONS:
[Pseudo-code or structured steps]

OUTPUT FORMAT:
[Expected output structure]
```

### Agent Definition Format

```markdown
# Agent Name - Role

PERSONA:
[Personality and communication style]

EXPERTISE:
[Domain knowledge and skills]

APPROACH:
[How they analyze problems]
```

## Performance Considerations

1. **Prompt Efficiency**: Instructions are concise to minimize token usage
2. **Caching Strategy**: Patterns stored for reuse
3. **Batch Operations**: Multiple agents activated in single pass
4. **Lazy Loading**: Only relevant agents/patterns loaded

## Extension Mechanisms

### Adding Commands

1. Create `.claude/commands/new-command.md`
2. Define ACTIVATION trigger
3. Provide clear INSTRUCTIONS
4. Update help.md
5. Add library support in `.claude/lib/` if needed
6. Integrate with workflow engine if applicable

### Adding Agents

1. Create `.claude/agents/new-agent.md`
2. Define persona and expertise
3. Update orchestration logic in `orchestrate.md`
4. Add to workflow definitions
5. Create agent-specific templates
6. Define handoff protocols

### Custom Workflows

Extend pantheon.md with new sections:
```yaml
## CUSTOM_SECTION:
Your domain-specific requirements
```

Update parser to recognize new sections.

## Security Considerations

- No code execution - all prompt-based
- File access limited to .claude/ directory
- Pattern storage sanitized
- No external API calls
- User data stays local

## Limitations

1. **Interpretation Dependent**: Relies on Claude's understanding
2. **No State Persistence**: Beyond pattern memory
3. **Context Window**: Large projects may exceed limits
4. **Determinism**: Results may vary between runs

## Multi-Agent Workflow Architecture

### Workflow Engine

The workflow engine (`.claude/lib/workflow-engine.md`) orchestrates multi-agent collaborations:

```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  agents: string[];
  steps: WorkflowStep[];
}

interface WorkflowStep {
  agent: string;
  action: string;
  input: string;
  outputVariable?: string;
  parallel?: boolean;
}
```

Key features:
1. **Sequential & Parallel Execution**: Steps can run in sequence or parallel
2. **Context Preservation**: Output from one agent becomes input for next
3. **State Management**: Track workflow progress and artifacts
4. **Error Handling**: Graceful failure recovery

### Pre-defined Workflows

1. **Product Planning**: PM → PO → SM
2. **Implementation**: Architect → Developer → QA
3. **UI Feature**: UX → Developer → QA
4. **Security-First**: Security → Developer

## Git Integration Architecture

### Git Operations Library

The git integration (`.claude/lib/git-integration.md`) provides:

```typescript
interface GitOperations {
  initializeRepo(options: GitInitOptions): Promise<GitResult>;
  createBranch(name: string, options?: BranchOptions): Promise<GitResult>;
  commitPhase(options: PhaseCommitOptions): Promise<GitResult>;
  createPullRequest(projectPath: string, options: PROptions): Promise<GitResult>;
}
```

Features:
1. **Auto-initialization**: Set up git repo during project creation
2. **Phase Commits**: Commit after each development phase
3. **Branch Management**: Feature branch workflow
4. **PR Generation**: Create PRs with descriptions
5. **Gitignore Templates**: Framework-specific ignore files

## Live Preview Architecture

### Development Server Management

The live preview system (`.claude/lib/live-preview.md`) handles:

```typescript
interface PreviewServer {
  start(projectPath: string, options?: PreviewOptions): Promise<PreviewResult>;
  detectFramework(projectPath: string): Promise<FrameworkInfo>;
  generateQRCode(url: string): string;
  stop(): Promise<void>;
}
```

Capabilities:
1. **Framework Detection**: Auto-detect Next.js, React, Vue, etc.
2. **Port Management**: Find available ports automatically
3. **Mobile Preview**: QR codes for device testing
4. **Hot Reload**: Integration with framework dev servers
5. **Network Access**: LAN URLs for mobile testing

## Incremental Updates Architecture

### Safe Modification System

The incremental updates (`.claude/lib/incremental-updates.md`) enable:

```typescript
interface IncrementalUpdater {
  analyzeProject(projectPath: string): Promise<ProjectAnalysis>;
  addFeature(projectPath: string, feature: FeatureDefinition): Promise<UpdateResult>;
  updateDependencies(projectPath: string, options: UpdateOptions): Promise<UpdateResult>;
  createBackup(projectPath: string): Promise<BackupInfo>;
}
```

Safety features:
1. **Project Analysis**: Understand existing code before changes
2. **Backup Creation**: Automatic backups before modifications
3. **Conflict Detection**: Identify potential conflicts
4. **Merge Strategies**: Intelligent code merging
5. **Rollback Support**: Undo changes if needed

## Janus Meta-Orchestration

### Dynamic Workflow Generation

Janus can:
1. **Analyze Tasks**: Determine optimal agent composition
2. **Generate Workflows**: Create custom workflows dynamically
3. **Cross-Domain Bridge**: Connect technical and business domains
4. **Optimize Execution**: Improve workflow efficiency

### Cross-Domain Execution

```yaml
Domain Bridges:
  Technical ↔ Business:
    - Requirements to Architecture
    - Code to User Stories
    - Tests to Acceptance Criteria
  
  Design ↔ Development:
    - Mockups to Components
    - UX Patterns to Code
    - Accessibility to Implementation
```

## Performance Optimizations

### Parallel Execution

1. **Agent Parallelization**: Run independent agents concurrently
2. **File Operations**: Batch file reads/writes
3. **Tool Batching**: Multiple tool calls in single response
4. **Lazy Loading**: Load only required libraries

### Context Management

1. **Smart Pruning**: Remove unnecessary context
2. **Context Handoff**: Efficient agent-to-agent transfer
3. **Memory Patterns**: Reuse successful patterns
4. **Token Optimization**: Minimize token usage

## Future Enhancements

Completed enhancements from previous roadmap:
- ✅ Version Control Integration (Git-aware patterns)
- ✅ Multi-Agent Workflows
- ✅ Live Preview System
- ✅ Incremental Updates

New potential improvements:
1. **Graph-based Dependencies**: Visual feature relationships
2. **Multi-Project Patterns**: Cross-project learning
3. **Performance Metrics**: Track command effectiveness
4. **Custom Schema Extensions**: Domain-specific pantheon.md sections
5. **Cloud Integration**: Deploy to cloud providers
6. **CI/CD Pipelines**: Automated testing and deployment

## Development Philosophy

Pantheon follows these principles:

1. **Simplicity**: Markdown-based, no runtime required
2. **Transparency**: All logic visible and modifiable
3. **Extensibility**: Easy to add new capabilities
4. **Efficiency**: Minimize token usage
5. **Pragmatism**: Solve real development workflow problems

## Debugging

When Pantheon commands don't work as expected:

1. Check command file syntax in `.claude/commands/`
2. Verify agent definitions are complete
3. Validate pantheon.md structure with `/pantheon validate`
4. Review Claude's interpretation in responses
5. Check for typos in ACTIVATION conditions

## Contributing

To contribute to Pantheon:

1. Follow existing markdown instruction patterns
2. Test commands thoroughly in Claude Code
3. Document new features in help.md
4. Maintain backward compatibility
5. Focus on practical developer workflows

---

*Pantheon Technical Documentation v1.0 - Implementation details for developers and contributors*