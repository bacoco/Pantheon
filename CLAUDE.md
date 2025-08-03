# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This repository contains the Pantheon Multi-AI ecosystem documentation - a comprehensive setup for coordinating Claude Code and Gemini models in a collaborative development workflow. The system emphasizes:
- Claude models as primary creators and implementers
- Gemini models as validators and advisors (never writing code)
- Transparent multi-model orchestration with cost optimization

## Key Project Files
- `complete-claude-gemini-ecosystem.md`: Main documentation containing all agent definitions, workflows, and configuration templates
- `.claude/settings.local.json`: Local Claude Code settings for permissions

## Core Architecture Principles
**Model Separation of Concerns:**
- **Claude Models**: Code creation, implementation, architecture design, documentation writing
- **Gemini Models**: Validation, analysis, synthesis, UI/UX consultation (NEVER writes or edits code)
- **Workflow**: Claude creates → Gemini validates → Claude refines → Iterate

## Agent Categories
The ecosystem defines specialized agents in several categories:

1. **Creation Agents** (Claude-based):
   - `claude-architect`: System design and architecture
   - `claude-builder`: Feature implementation
   - `claude-documenter`: Documentation generation
   - `claude-refactor`: Code refactoring

2. **Validation Agents** (Gemini-based):
   - `gemini-advisor`: Primary validation specialist
   - `project-analyst`: Project-wide analysis
   - `code-reviewer`: Detailed code reviews
   - `security-auditor`: Security-focused validation

3. **Management Agents**:
   - `model-manager`: Model attribution and routing control
   - `agent-orchestrator`: Workflow coordination
   - `workflow-controller`: Process management
   - `cost-optimizer`: Usage optimization

## Critical Rules
1. **Gemini models MUST NEVER write, edit, or generate code** - they only read, analyze, and advise
2. **All significant Claude work should be validated** by Gemini advisors
3. **Tool permissions are strictly enforced** - Gemini models cannot use Edit or Bash tools
4. **Validation is the default mode** - use `/validation-mode strict` for automatic validation

## Workflow Patterns

### Feature Development Workflow
1. Requirements analysis (Gemini Synthesizer)
2. Architecture design (Claude Architect)
3. Architecture validation (Gemini Advisor)
4. Implementation (Claude Builder)
5. Code review (Gemini Advisor)
6. Testing (Testing Master)
7. Documentation (Claude Documenter)
8. Final validation (Project Analyst)

### Validation Commands
```bash
validate architecture [component]
validate code [file/function]
validate approach [methodology]
validate ui [component]
```

### Model Management Commands
```bash
/model-global set [provider] [model]
/model-agent [agent-name] [provider] [model]
/routing-strategy [cost-optimized|quality-focused|speed-focused]
/validation-mode [strict|optional|off]
```

## Cost Optimization Strategies
- Use Gemini Flash for quick validation tasks
- Use Gemini Pro for large context analysis
- Reserve Claude Sonnet for code creation and complex reasoning
- Use Claude Haiku for documentation and simple tasks

## Important Notes
- The ecosystem is designed for transparent multi-model collaboration
- Focus is on quality through systematic validation
- Gemini's role is advisory and analytical, never implementational
- All workflows include validation checkpoints
- Model routing can be customized based on task requirements