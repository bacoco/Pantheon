# BACO Complexity Analyzer Implementation

## Objective
Implement an LLM-driven complexity analyzer that evaluates projects across multiple dimensions and returns structured complexity profiles.

## Dependencies
- OpenAI API (GPT-4)
- Pydantic for response models
- Asyncio for async operations

## Core Requirements

### 1. Complexity Profile Model
```python
from pydantic import BaseModel
from typing import List, Dict
from enum import Enum

class ComplexityLevel(str, Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    EXTREME = "extreme"

class ComplexityDimension(BaseModel):
    name: str
    score: float  # 0-10
    reasoning: str

class ComplexityProfile(BaseModel):
    overall_level: ComplexityLevel
    dimensions: List[ComplexityDimension]
    required_agents: List[str]
    risk_factors: List[str]
    confidence: float  # 0-1
    reasoning: str
```

### 2. Analyzer Implementation
Create `baco/complexity.py` with:

- Async function to analyze project complexity
- Structured prompts for different project aspects
- Error handling and retries
- Confidence scoring
- Caching for repeated analyses

### 3. Analysis Dimensions
The analyzer should evaluate:
- **Technical Complexity**: Architecture, integrations, performance needs
- **Domain Complexity**: Business logic, compliance, security requirements
- **Scale Complexity**: Data volume, user count, geographic distribution
- **Team Complexity**: Coordination needs, skill requirements
- **Timeline Complexity**: Deadlines, dependencies, critical paths

### 4. Prompt Engineering
```python
COMPLEXITY_ANALYSIS_PROMPT = """
Analyze this software project's complexity across multiple dimensions.

Project Description:
{project_description}

Technical Stack:
{tech_stack}

Requirements:
{requirements}

Evaluate:
1. Technical Complexity (0-10): Architecture patterns, integration points, technical debt risk
2. Domain Complexity (0-10): Business rules, compliance needs, industry-specific requirements  
3. Scale Complexity (0-10): Performance requirements, data volume, concurrent users
4. Team Complexity (0-10): Coordination overhead, skill specialization needs
5. Timeline Complexity (0-10): Schedule pressure, critical dependencies

For each dimension, provide:
- Numerical score (0-10)
- Specific reasoning
- Risk factors

Then determine:
- Overall complexity level (simple/moderate/complex/extreme)
- Which specialist agents are required and why
- Confidence in this assessment (0-1)

Return structured JSON matching the ComplexityProfile schema.
"""
```

### 5. Implementation Features

- **Intelligent Defaults**: Infer missing information from context
- **Multi-pass Analysis**: Re-analyze with focused questions if confidence is low
- **Context Extraction**: Pull relevant details from various input formats
- **Explanation Generation**: Provide clear reasoning for decisions

### 6. Error Handling
- API timeout handling
- Rate limit management
- Fallback to simpler analysis if needed
- Clear error messages for debugging

### 7. Testing Requirements
- Unit tests for each dimension
- Integration tests with real API
- Mock responses for CI/CD
- Edge case handling (empty projects, massive projects)

## Example Usage
```python
analyzer = ComplexityAnalyzer(openai_client)

profile = await analyzer.analyze(
    project_description="E-commerce platform with real-time inventory",
    tech_stack=["Python", "PostgreSQL", "Redis", "Docker"],
    requirements=["PCI compliance", "100k concurrent users", "Multi-region"]
)

print(f"Complexity: {profile.overall_level}")
print(f"Required agents: {', '.join(profile.required_agents)}")
```

## Success Criteria
- Accurately categorizes simple vs complex projects
- Provides actionable agent recommendations
- Completes analysis in <5 seconds
- Handles various input formats gracefully
- Confidence scoring correlates with accuracy