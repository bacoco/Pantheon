# BACO Technical Architecture

This document describes the technical implementation of BACO (Basic Adaptive Context Orchestrator), a prompt-based orchestration system for Claude Code.

## Architecture Overview

BACO is a **prompt-based system** that runs entirely within Claude Code. It does not contain executable code - instead, it provides structured markdown instructions that Claude interprets and executes.

### Core Components

```
.claude/
├── commands/          # Command definitions (markdown instructions)
│   ├── analyze.md    # Multi-dimensional task analysis
│   ├── orchestrate.md # Agent coordination
│   ├── generate-prp.md # PRP generation
│   ├── baco.md       # baco.md workflow commands
│   └── help.md       # Command reference
├── agents/           # Agent personas and expertise
├── utils/            # Parsing and analysis utilities
│   ├── baco-parser.md
│   └── example-analyzer.md
├── schemas/          # Data structure definitions
│   └── baco-md-schema.yaml
└── memory/           # Pattern storage
    └── patterns.json
```

## How BACO Works

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

The `/orchestrate` command activates multiple specialist agents:

1. **Agent Selection**: Based on task complexity and domain
2. **Persona Embodiment**: Claude adopts each agent's perspective
3. **Synthesis**: Combines insights into actionable recommendations

Agents are defined in `.claude/agents/` with:
- Personality traits
- Domain expertise
- Analysis approaches
- Communication style

### 3. baco.md Processing

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

BACO uses pseudo-code that Claude interprets. Example:

```python
# From baco-parser.md
def parse_baco_file(content):
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

Based on project analysis, BACO selects relevant agents:

```yaml
High Complexity + Security Requirements:
  - Winston (Architect)
  - Marcus (Security)
  - Elena (QA)
  - James (Developer)

Data-Heavy Project:
  - Winston (Architect)
  - Data Analyst (if available)
  - James (Developer)
  - Elena (QA)
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

### 2. baco.md Integration

When a `baco.md` file exists, all commands leverage it:
- `/analyze` includes all features and constraints
- `/orchestrate` uses recommended team composition
- `/generate-prp` incorporates full project context

### 3. Tool Usage

BACO commands instruct Claude to use available tools:
- **Read**: Access command/agent definitions
- **TodoWrite**: Maintain task tracking
- **Multi-file operations**: Batch analysis

## File Format Specifications

### baco.md Schema

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

### Adding Agents

1. Create `.claude/agents/new-agent.md`
2. Define persona and expertise
3. Update orchestration logic in `orchestrate.md`

### Custom Workflows

Extend baco.md with new sections:
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

## Future Enhancements

Potential improvements being considered:

1. **Graph-based Dependencies**: Visual feature relationships
2. **Multi-Project Patterns**: Cross-project learning
3. **Version Control Integration**: Git-aware patterns
4. **Performance Metrics**: Track command effectiveness
5. **Custom Schema Extensions**: Domain-specific baco.md sections

## Development Philosophy

BACO follows these principles:

1. **Simplicity**: Markdown-based, no runtime required
2. **Transparency**: All logic visible and modifiable
3. **Extensibility**: Easy to add new capabilities
4. **Efficiency**: Minimize token usage
5. **Pragmatism**: Solve real development workflow problems

## Debugging

When BACO commands don't work as expected:

1. Check command file syntax in `.claude/commands/`
2. Verify agent definitions are complete
3. Validate baco.md structure with `/baco validate`
4. Review Claude's interpretation in responses
5. Check for typos in ACTIVATION conditions

## Contributing

To contribute to BACO:

1. Follow existing markdown instruction patterns
2. Test commands thoroughly in Claude Code
3. Document new features in help.md
4. Maintain backward compatibility
5. Focus on practical developer workflows

---

*BACO Technical Documentation v1.0 - Implementation details for developers and contributors*