# BACO Context Management Implementation

## Objective
Implement a sophisticated context management system that builds context progressively, compresses intelligently, and maintains a self-improving pattern memory.

## Core Components

### 1. Context Manager
Create `baco/context/manager.py`:

```python
from typing import Dict, List, Optional
import hashlib
from pydantic import BaseModel

class ContextLayer(BaseModel):
    name: str
    content: str
    priority: int  # 1-10, higher = more important
    tokens: int
    timestamp: datetime

class UnifiedContext(BaseModel):
    layers: List[ContextLayer]
    total_tokens: int
    fingerprint: str
    
    def add_layer(self, name: str, content: str, priority: int):
        """Add new context layer"""
        pass
    
    def compress(self, target_tokens: int) -> 'UnifiedContext':
        """Compress context to fit token limit"""
        pass
    
    def get_relevant_context(self, query: str) -> str:
        """Extract context relevant to specific query"""
        pass

class ContextManager:
    def __init__(self, max_tokens: int = 8000):
        self.max_tokens = max_tokens
        self.current_context = UnifiedContext(layers=[], total_tokens=0, fingerprint="")
    
    async def build_initial_context(self, project_info: Dict) -> UnifiedContext:
        """Build base context from project information"""
        layers = []
        
        # Layer 1: Project Overview (Priority 10)
        overview = await self._create_overview_layer(project_info)
        layers.append(overview)
        
        # Layer 2: Technical Requirements (Priority 9)
        tech_reqs = await self._create_technical_layer(project_info)
        layers.append(tech_reqs)
        
        # Layer 3: Constraints & Guidelines (Priority 8)
        constraints = await self._create_constraints_layer(project_info)
        layers.append(constraints)
        
        return self._assemble_context(layers)
    
    async def enhance_context(self, base_context: UnifiedContext, agent_outputs: Dict[str, str]) -> UnifiedContext:
        """Enhance context with agent insights"""
        enhanced = base_context.copy()
        
        for agent_name, output in agent_outputs.items():
            layer = ContextLayer(
                name=f"agent_{agent_name}",
                content=output,
                priority=7,
                tokens=self._count_tokens(output),
                timestamp=datetime.now()
            )
            enhanced.add_layer(layer)
        
        # Compress if needed
        if enhanced.total_tokens > self.max_tokens:
            enhanced = await self._intelligent_compress(enhanced)
        
        return enhanced
```

### 2. Pattern Memory System
Create `baco/context/memory.py`:

```python
class Pattern(BaseModel):
    id: str
    fingerprint: str  # Context fingerprint when pattern was learned
    category: str  # architecture, testing, security, etc.
    description: str
    implementation: str
    success_metrics: Dict[str, float]
    usage_count: int = 0
    last_used: Optional[datetime] = None
    confidence: float = 0.5

class PatternMemory:
    def __init__(self, storage_path: str = "~/.baco/patterns"):
        self.storage_path = Path(storage_path).expanduser()
        self.patterns: Dict[str, Pattern] = self._load_patterns()
        self.curator = PatternCurator()  # LLM-based curation
    
    async def find_relevant_patterns(self, context: UnifiedContext, category: Optional[str] = None) -> List[Pattern]:
        """Find patterns relevant to current context"""
        candidates = []
        
        for pattern in self.patterns.values():
            if category and pattern.category != category:
                continue
            
            relevance = await self._calculate_relevance(pattern, context)
            if relevance > 0.7:
                candidates.append((relevance, pattern))
        
        # Return top patterns sorted by relevance
        candidates.sort(key=lambda x: x[0], reverse=True)
        return [pattern for _, pattern in candidates[:5]]
    
    async def learn_pattern(self, context: UnifiedContext, implementation: str, outcome: ProjectOutcome) -> Optional[Pattern]:
        """Learn new pattern from successful implementation"""
        # Extract pattern
        pattern_desc = await self._extract_pattern(context, implementation)
        
        # Evaluate if worth storing
        decision = await self.curator.evaluate_pattern(pattern_desc, outcome)
        
        if decision.should_store:
            pattern = Pattern(
                id=self._generate_id(),
                fingerprint=context.fingerprint,
                category=decision.category,
                description=pattern_desc,
                implementation=implementation,
                success_metrics=outcome.metrics,
                confidence=decision.confidence
            )
            
            self.patterns[pattern.id] = pattern
            self._save_patterns()
            return pattern
        
        return None
```

### 3. Context Compression
Implement intelligent compression strategies:

```python
class ContextCompressor:
    def __init__(self, llm_client):
        self.llm_client = llm_client
    
    async def compress(self, context: UnifiedContext, target_tokens: int) -> UnifiedContext:
        """Compress context while preserving critical information"""
        if context.total_tokens <= target_tokens:
            return context
        
        # Sort layers by priority
        sorted_layers = sorted(context.layers, key=lambda x: x.priority, reverse=True)
        
        # Keep high-priority layers intact
        essential_layers = []
        essential_tokens = 0
        
        for layer in sorted_layers:
            if layer.priority >= 8:  # Always keep
                essential_layers.append(layer)
                essential_tokens += layer.tokens
            else:
                break
        
        # Compress lower-priority layers
        remaining_tokens = target_tokens - essential_tokens
        compressed_layers = []
        
        for layer in sorted_layers[len(essential_layers):]:
            if remaining_tokens <= 0:
                break
            
            compressed = await self._compress_layer(layer, remaining_tokens)
            compressed_layers.append(compressed)
            remaining_tokens -= compressed.tokens
        
        return UnifiedContext(
            layers=essential_layers + compressed_layers,
            total_tokens=sum(l.tokens for l in essential_layers + compressed_layers),
            fingerprint=self._calculate_fingerprint(essential_layers + compressed_layers)
        )
    
    async def _compress_layer(self, layer: ContextLayer, max_tokens: int) -> ContextLayer:
        """Compress individual layer using LLM"""
        prompt = f"""
        Compress this context while preserving critical information:
        
        {layer.content}
        
        Requirements:
        - Maintain all key technical details
        - Preserve constraints and requirements
        - Remove redundancy and verbose explanations
        - Target length: approximately {max_tokens} tokens
        """
        
        compressed_content = await self.llm_client.compress(prompt)
        
        return ContextLayer(
            name=f"{layer.name}_compressed",
            content=compressed_content,
            priority=layer.priority,
            tokens=self._count_tokens(compressed_content),
            timestamp=datetime.now()
        )
```

### 4. Context Fingerprinting
Generate unique fingerprints for context matching:

```python
def calculate_context_fingerprint(context: UnifiedContext) -> str:
    """Generate unique fingerprint for context state"""
    components = []
    
    # Include high-priority layer content
    for layer in context.layers:
        if layer.priority >= 7:
            components.append(f"{layer.name}:{layer.content[:100]}")
    
    # Create stable hash
    content = "|".join(sorted(components))
    return hashlib.sha256(content.encode()).hexdigest()[:16]
```

### 5. Progressive Context Building
Support incremental context enhancement:

```python
class ProgressiveContextBuilder:
    def __init__(self, context_manager: ContextManager):
        self.context_manager = context_manager
        self.stages = [
            "project_overview",
            "technical_architecture", 
            "implementation_details",
            "testing_strategy",
            "deployment_requirements"
        ]
    
    async def build_progressively(self, project_info: Dict, depth: str = "full") -> UnifiedContext:
        """Build context progressively based on needed depth"""
        context = await self.context_manager.build_initial_context(project_info)
        
        depth_map = {
            "minimal": 1,
            "standard": 3,
            "full": len(self.stages)
        }
        
        stages_to_process = self.stages[:depth_map.get(depth, len(self.stages))]
        
        for stage in stages_to_process:
            enhancement = await self._process_stage(stage, context, project_info)
            context = await self.context_manager.enhance_context(context, {stage: enhancement})
        
        return context
```

## Success Criteria
- Context fits within token limits without losing critical information
- Pattern memory improves suggestions over time
- Fingerprinting enables accurate pattern matching
- Compression preserves technical accuracy
- Progressive building reduces initial latency