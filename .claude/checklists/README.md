# BACO Checklists

This directory contains validation checklists used to ensure quality and completeness.

## Checklist Structure

Each checklist is a markdown file with:
- Purpose and context
- Categorized check items
- Success criteria
- Actions for failures

## Available Checklists

- `architecture-review.md` - Architecture document review
- `code-quality.md` - Code implementation review
- `security-audit.md` - Security assessment checklist
- `deployment-readiness.md` - Pre-deployment validation

## Usage

Agents execute checklists:
```
*checklist architecture-review
*execute-checklist security-audit
```