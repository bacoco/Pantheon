# BACO Tasks

This directory contains executable task workflows that agents can run.

## Task Structure

Each task is a markdown file with:
- Purpose section
- Sequential execution steps
- Input/output specifications
- Integration with templates/checklists

## Naming Convention

- `analyze-*.md` - Analysis tasks
- `create-*.md` - Creation tasks
- `review-*.md` - Review tasks
- `validate-*.md` - Validation tasks

## Usage

Agents can execute tasks using their command system:
```
*task analyze-complexity
*task create-architecture-doc
```