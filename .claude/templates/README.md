# BACO Templates

This directory contains document templates used by agents to generate structured outputs.

## Template Structure

Templates are YAML files with:
- Metadata (name, version, purpose)
- Sections with prompts/structure
- Variables for dynamic content
- Validation rules

## Available Templates

- `architecture-doc.yaml` - System architecture document
- `implementation-plan.yaml` - Development implementation plan
- `security-assessment.yaml` - Security analysis document
- `test-strategy.yaml` - Testing strategy document

## Usage

Agents use templates with tasks:
```
*create-doc architecture-doc
*task create-implementation-plan
```