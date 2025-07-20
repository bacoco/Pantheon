# BACO Orchestrator Implementation

## Objective
Implement the core orchestrator that coordinates complexity analysis, agent selection, context management, and workflow execution.

## Core Orchestrator Class
Create `baco/orchestrator.py`:

```python
from typing import Dict, List, Optional
import asyncio
from dataclasses import dataclass

@dataclass
class OrchestrationResult:
    prp: str
    context: UnifiedContext
    agent_outputs: Dict[str, AgentOutput]
    patterns_used: List[Pattern]
    execution_time: float
    token_usage: Dict[str, int]

class BACOOrchestrator:
    def __init__(self, config: BACOConfig):
        self.config = config
        self.llm_client = self._init_llm_client()
        self.complexity_analyzer = ComplexityAnalyzer(self.llm_client)
        self.agent_registry = self._init_agents()
        self.context_manager = ContextManager(config.context_window_size)
        self.pattern_memory = PatternMemory()
        self.collaborator = AgentCollaborator()
    
    async def plan(self, project_description: str, requirements: List[str], 
                   tech_stack: List[str], additional_context: Optional[Dict] = None) -> OrchestrationResult:
        """Main planning phase - analyze, select agents, build context, generate PRP"""
        start_time = time.time()
        
        # Step 1: Analyze project complexity
        complexity = await self.complexity_analyzer.analyze(
            project_description=project_description,
            tech_stack=tech_stack,
            requirements=requirements
        )
        
        # Step 2: Select appropriate agents
        agents = await self._select_agents(complexity, project_description)
        
        # Step 3: Build initial context
        project_info = {
            "description": project_description,
            "requirements": requirements,
            "tech_stack": tech_stack,
            "complexity": complexity,
            **(additional_context or {})
        }
        context = await self.context_manager.build_initial_context(project_info)
        
        # Step 4: Find relevant patterns
        patterns = await self.pattern_memory.find_relevant_patterns(context)
        if patterns:
            context = await self._incorporate_patterns(context, patterns)
        
        # Step 5: Run selected agents
        agent_outputs = await self._run_agents(agents, context, complexity)
        
        # Step 6: Enhance context with agent insights
        context = await self.context_manager.enhance_context(context, agent_outputs)
        
        # Step 7: Generate comprehensive PRP
        prp = await self._generate_prp(context, agent_outputs)
        
        # Step 8: Track metrics
        execution_time = time.time() - start_time
        token_usage = self._calculate_token_usage(agent_outputs)
        
        return OrchestrationResult(
            prp=prp,
            context=context,
            agent_outputs=agent_outputs,
            patterns_used=patterns,
            execution_time=execution_time,
            token_usage=token_usage
        )
```

### Agent Selection Logic
```python
async def _select_agents(self, complexity: ComplexityProfile, project_description: str) -> List[BaseAgent]:
    """Select agents using LLM reasoning + complexity limits"""
    
    # Get complexity-based agent limit
    max_agents = self._get_max_agents(complexity.overall_level)
    
    # Get all potentially relevant agents
    all_agents = self.agent_registry.get_available_agents()
    triggered_agents = [
        agent for agent in all_agents 
        if agent.should_activate(project_description, complexity)
    ]
    
    # If within limit, use all triggered agents
    if len(triggered_agents) <= max_agents:
        return triggered_agents
    
    # Otherwise, use LLM to prioritize
    selection_prompt = f"""
    Project complexity: {complexity.overall_level}
    Available agents: {[a.name for a in triggered_agents]}
    Maximum agents: {max_agents}
    
    Project details:
    {project_description}
    
    Key risks: {complexity.risk_factors}
    
    Select the {max_agents} most critical agents for project success.
    Prioritize based on:
    1. Risk mitigation
    2. Project-specific needs
    3. Agent interdependencies
    
    Return agent names in priority order.
    """
    
    selected_names = await self.llm_client.select_agents(selection_prompt)
    return [
        agent for agent in triggered_agents 
        if agent.name in selected_names[:max_agents]
    ]

def _get_max_agents(self, complexity_level: ComplexityLevel) -> int:
    """Get maximum agents based on complexity"""
    limits = {
        ComplexityLevel.SIMPLE: self.config.max_agents_simple,
        ComplexityLevel.MODERATE: self.config.max_agents_medium,
        ComplexityLevel.COMPLEX: self.config.max_agents_complex,
        ComplexityLevel.EXTREME: self.config.max_agents_complex
    }
    return limits[complexity_level]
```

### Agent Execution Strategies
```python
async def _run_agents(self, agents: List[BaseAgent], context: UnifiedContext, 
                     complexity: ComplexityProfile) -> Dict[str, AgentOutput]:
    """Execute agents with appropriate strategy"""
    
    agent_context = AgentContext(
        project_description=context.get_layer("overview"),
        complexity_profile=complexity,
        previous_outputs={},
        current_phase="planning"
    )
    
    # Determine execution strategy based on agent dependencies
    strategy = self._determine_execution_strategy(agents)
    
    if strategy == "parallel":
        return await self.collaborator.run_agents_parallel(agents, agent_context)
    elif strategy == "sequential":
        return await self.collaborator.run_agents_sequential(agents, agent_context)
    else:  # hybrid
        return await self._run_agents_hybrid(agents, agent_context)

async def _run_agents_hybrid(self, agents: List[BaseAgent], context: AgentContext) -> Dict[str, AgentOutput]:
    """Run agents in dependency-aware batches"""
    # Group agents by dependency level
    independent = []
    dependent = []
    
    for agent in agents:
        if hasattr(agent, 'depends_on') and agent.depends_on:
            dependent.append(agent)
        else:
            independent.append(agent)
    
    # Run independent agents in parallel
    outputs = await self.collaborator.run_agents_parallel(independent, context)
    
    # Run dependent agents with access to previous outputs
    context.previous_outputs = outputs
    dependent_outputs = await self.collaborator.run_agents_sequential(dependent, context)
    
    outputs.update(dependent_outputs)
    return outputs
```

### PRP Generation
```python
async def _generate_prp(self, context: UnifiedContext, agent_outputs: Dict[str, AgentOutput]) -> str:
    """Generate comprehensive PRP from context and agent outputs"""
    
    prp_prompt = f"""
    Generate a comprehensive Product Requirements Prompt (PRP) based on the following:
    
    Project Context:
    {context.get_relevant_context("requirements")}
    
    Agent Insights:
    {self._format_agent_outputs(agent_outputs)}
    
    Create a PRP that includes:
    1. Clear project objectives
    2. Technical requirements and constraints
    3. Architecture decisions (if applicable)
    4. Implementation approach
    5. Testing requirements
    6. Success criteria
    
    Format the PRP for direct use with an AI coding assistant.
    Make it comprehensive but concise, actionable and unambiguous.
    """
    
    prp = await self.llm_client.generate(prp_prompt)
    
    # Validate PRP completeness
    validation = await self._validate_prp(prp, context)
    if not validation.is_complete:
        prp = await self._enhance_prp(prp, validation.missing_elements)
    
    return prp
```

### Pattern Integration
```python
async def _incorporate_patterns(self, context: UnifiedContext, patterns: List[Pattern]) -> UnifiedContext:
    """Incorporate relevant patterns into context"""
    pattern_layer = ContextLayer(
        name="learned_patterns",
        content=self._format_patterns(patterns),
        priority=7,
        tokens=0,  # Will be calculated
        timestamp=datetime.now()
    )
    
    pattern_layer.tokens = self.context_manager._count_tokens(pattern_layer.content)
    
    enhanced_context = context.copy()
    enhanced_context.add_layer(pattern_layer)
    
    # Update pattern usage statistics
    for pattern in patterns:
        pattern.usage_count += 1
        pattern.last_used = datetime.now()
    
    return enhanced_context
```

### Build Phase Support
```python
async def build(self, prp: str, context: UnifiedContext) -> BuildResult:
    """Support build phase with on-demand agent consultation"""
    build_agents = self._get_build_phase_agents()
    
    # QA agent is always active during build
    qa_agent = self.agent_registry.get_agent("qa")
    
    # Monitor build progress and activate agents as needed
    build_monitor = BuildMonitor(
        prp=prp,
        context=context,
        qa_agent=qa_agent,
        available_agents=build_agents
    )
    
    return await build_monitor.start()
```

### Confidence and Fallback Handling
```python
async def _handle_low_confidence(self, result: OrchestrationResult) -> OrchestrationResult:
    """Handle low-confidence orchestration decisions"""
    confidence_threshold = 0.7
    
    # Check overall confidence
    avg_confidence = sum(
        output.confidence for output in result.agent_outputs.values()
    ) / len(result.agent_outputs)
    
    if avg_confidence < confidence_threshold:
        # Request human review
        review_request = self._format_review_request(result)
        print(f"\n⚠️  Low confidence ({avg_confidence:.2f}) - Human review recommended:")
        print(review_request)
        
        # Optionally wait for human input
        if self.config.require_human_review_on_low_confidence:
            human_feedback = await self._get_human_feedback()
            result = await self._incorporate_feedback(result, human_feedback)
    
    return result
```

## Success Criteria
- Orchestration completes in <10 seconds for most projects
- Agent selection adapts correctly to project complexity
- PRP generation is comprehensive and actionable
- Pattern integration improves suggestions over time
- Low-confidence decisions trigger appropriate reviews