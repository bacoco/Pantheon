# BACO Project Setup

## Objective
Initialize the Basic Adaptive Context Orchestrator (BACO) project with proper structure, dependencies, and configuration.

## Requirements
- Python 3.11+
- Poetry for dependency management
- Async/await architecture
- Type hints throughout

## Project Structure
```
baco/
├── pyproject.toml
├── README.md
├── .gitignore
├── .env.example
├── baco/
│   ├── __init__.py
│   ├── orchestrator.py
│   ├── complexity.py
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── developer.py
│   │   ├── architect.py
│   │   ├── qa.py
│   │   └── security.py
│   ├── context/
│   │   ├── __init__.py
│   │   ├── manager.py
│   │   └── memory.py
│   ├── cli.py
│   └── config.py
├── tests/
│   └── __init__.py
└── examples/
    └── simple_project.yaml
```

## Implementation Tasks

1. **Initialize Poetry Project**
   - Create pyproject.toml with dependencies:
     - click>=8.1
     - pydantic>=2.0
     - pyyaml>=6.0
     - openai>=1.0
     - rich>=13.0 (for beautiful CLI output)
     - python-dotenv>=1.0
     - aiofiles>=23.0

2. **Create Base Configuration**
   - Environment variables handling
   - YAML configuration schema
   - Default settings

3. **Setup Logging**
   - Structured logging with rich
   - Debug/info/error levels
   - Async-safe logging

4. **Create Package Structure**
   - All directories with __init__.py
   - Version management in __init__.py
   - Export key classes/functions

## Configuration Schema
```python
from pydantic import BaseModel
from typing import List, Dict, Optional

class AgentConfig(BaseModel):
    name: str
    triggers: List[str]
    system_prompt: str
    enabled: bool = True

class BACOConfig(BaseModel):
    openai_api_key: str
    model: str = "gpt-4-turbo-preview"
    max_agents_simple: int = 2
    max_agents_medium: int = 4
    max_agents_complex: int = 8
    context_window_size: int = 8000
    agents: List[AgentConfig]
```

## Success Criteria
- Poetry install works without errors
- Basic CLI runs with `poetry run baco --help`
- Configuration loads from YAML and environment
- All imports resolve correctly
- Type checking passes with mypy