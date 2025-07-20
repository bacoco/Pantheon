# BACO Agent System Implementation

## Objective
Implement a flexible agent system where specialized AI agents can be dynamically activated based on project needs.

## Core Components

### 1. Base Agent Class
Create `baco/agents/base.py`:

```python
from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from pydantic import BaseModel

class AgentContext(BaseModel):
    project_description: str
    complexity_profile: ComplexityProfile
    previous_outputs: Dict[str, str]
    current_phase: str

class AgentOutput(BaseModel):
    content: str
    confidence: float
    suggestions: List[str]
    dependencies: List[str]  # Other agents this output depends on

class BaseAgent(ABC):
    def __init__(self, name: str, system_prompt: str, triggers: List[str]):
        self.name = name
        self.system_prompt = system_prompt
        self.triggers = triggers
        self.llm_client = None  # Set by orchestrator
    
    @abstractmethod
    async def analyze(self, context: AgentContext) -> AgentOutput:
        """Perform agent-specific analysis"""
        pass
    
    def should_activate(self, project_context: str, complexity: ComplexityProfile) -> bool:
        """Determine if this agent should be activated"""
        # Check triggers in project context
        # Check if explicitly required by complexity profile
        # Return activation decision
```

### 2. Specialist Agent Implementations

Create individual agent files:

**Developer Agent** (`baco/agents/developer.py`):
- Focus: Code structure, implementation approach, technical decisions
- Triggers: Always active (core agent)
- Outputs: Technical PRD, implementation plan, code patterns

**Architect Agent** (`baco/agents/architect.py`):
- Focus: System design, scalability, integration patterns  
- Triggers: "microservices", "distributed", "scale", complexity > moderate
- Outputs: Architecture decisions, component design, API contracts

**QA Agent** (`baco/agents/qa.py`):
- Focus: Test strategy, quality metrics, validation approach
- Triggers: Always active for code generation
- Outputs: Test plans, validation criteria, coverage requirements

**Security Agent** (`baco/agents/security.py`):
- Focus: Security requirements, compliance, vulnerability prevention
- Triggers: "auth", "payment", "PCI", "HIPAA", "security"
- Outputs: Security checklist, compliance requirements, threat model

**Performance Agent** (`baco/agents/performance.py`):
- Focus: Optimization, caching, scalability
- Triggers: "high traffic", "performance", "scale", "concurrent"
- Outputs: Performance targets, optimization strategies, monitoring plan

### 3. Agent Registry
Create `baco/agents/__init__.py`:

```python
class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
    
    def register(self, agent: BaseAgent):
        self._agents[agent.name] = agent
    
    def get_available_agents(self) -> List[BaseAgent]:
        return list(self._agents.values())
    
    def get_agent(self, name: str) -> Optional[BaseAgent]:
        return self._agents.get(name)
    
    def select_agents(self, context: str, complexity: ComplexityProfile) -> List[BaseAgent]:
        """Select agents based on project needs"""
        selected = []
        for agent in self._agents.values():
            if agent.should_activate(context, complexity):
                selected.append(agent)
        return selected
```

### 4. Agent Prompts

Each agent needs carefully crafted system prompts:

```python
DEVELOPER_SYSTEM_PROMPT = """
You are a Senior Software Developer specializing in creating clear, maintainable code.

Your role:
- Analyze technical requirements and propose implementation approaches
- Create detailed technical specifications
- Identify code patterns and best practices
- Consider maintainability, testability, and documentation

Focus on practical implementation details that a developer needs to start coding.
"""

ARCHITECT_SYSTEM_PROMPT = """
You are a Software Architect with expertise in scalable system design.

Your role:
- Design system architecture that meets both current and future needs
- Identify integration points and API contracts
- Propose technology choices with justification
- Consider scalability, reliability, and maintainability

Provide architectural decisions that guide implementation without over-engineering.
"""
```

### 5. Agent Collaboration

Implement agent interaction patterns:

```python
class AgentCollaborator:
    async def run_agents_parallel(self, agents: List[BaseAgent], context: AgentContext) -> Dict[str, AgentOutput]:
        """Run multiple agents in parallel"""
        tasks = [agent.analyze(context) for agent in agents]
        results = await asyncio.gather(*tasks)
        return {agent.name: result for agent, result in zip(agents, results)}
    
    async def run_agents_sequential(self, agents: List[BaseAgent], context: AgentContext) -> Dict[str, AgentOutput]:
        """Run agents sequentially, passing outputs forward"""
        outputs = {}
        for agent in agents:
            context.previous_outputs = outputs
            output = await agent.analyze(context)
            outputs[agent.name] = output
        return outputs
    
    def synthesize_outputs(self, outputs: Dict[str, AgentOutput]) -> str:
        """Combine agent outputs into cohesive response"""
        # Merge insights
        # Resolve conflicts
        # Create unified output
```

### 6. Dynamic Agent Creation

Support creating agents from configuration:

```python
def create_agent_from_config(config: AgentConfig) -> BaseAgent:
    """Dynamically create agent from configuration"""
    class DynamicAgent(BaseAgent):
        async def analyze(self, context: AgentContext) -> AgentOutput:
            # Use LLM with configured system prompt
            # Return structured output
            pass
    
    return DynamicAgent(
        name=config.name,
        system_prompt=config.system_prompt,
        triggers=config.triggers
    )
```

## Success Criteria
- Agents activate correctly based on triggers
- Clean separation of concerns between agents
- Parallel execution completes in reasonable time
- Agent outputs are structured and actionable
- Easy to add new specialist agents