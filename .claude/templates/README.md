# BACO Template System

This directory contains reusable code templates and document templates for BACO.

## Directory Structure

```
templates/
├── documents/         # Document templates (existing)
│   ├── architecture-doc.yaml
│   ├── implementation-plan.yaml
│   ├── security-assessment.yaml
│   └── test-strategy.yaml
├── patterns/          # Common code patterns
│   ├── auth/         # Authentication patterns
│   ├── crud/         # CRUD operations
│   ├── api/          # API patterns
│   └── database/     # Database patterns
├── frameworks/        # Framework-specific templates
│   ├── nextjs/       # Next.js templates
│   ├── express/      # Express.js templates
│   ├── fastapi/      # FastAPI templates
│   └── react/        # React templates
├── testing/          # Testing templates
│   ├── unit/         # Unit test patterns
│   ├── integration/  # Integration test patterns
│   └── e2e/          # End-to-end test patterns
└── infrastructure/   # Infrastructure templates
    ├── docker/       # Docker configurations
    ├── ci-cd/        # CI/CD pipelines
    └── deployment/   # Deployment configurations
```

## Document Templates

Templates are YAML files with:
- Metadata (name, version, purpose)
- Sections with prompts/structure
- Variables for dynamic content
- Validation rules

### Usage
Agents use templates with tasks:
```
*create-doc architecture-doc
*task create-implementation-plan
```

## Code Templates

Code templates help generate consistent, high-quality code for common patterns.

### Template Format
```yaml
---
name: "Template Name"
description: "What this template provides"
category: "auth|crud|api|etc"
frameworks: ["react", "nextjs", "express"]
dependencies: 
  - package: "dependency-name"
    version: "^1.0.0"
tags: ["jwt", "authentication", "security"]
---

## Overview
Brief description

## Code
```[language]
// Template code
```

## Usage
Integration instructions

## Example
Working example
```

### Available Patterns
- **Authentication**: JWT, OAuth2, Session-based, Magic Links
- **CRUD**: REST, GraphQL, Repository Pattern
- **API**: RESTful structure, GraphQL schemas, WebSockets
- **Database**: Connection pooling, migrations, ORMs
- **Testing**: Unit tests, integration tests, E2E tests