# BACO Testing & Validation Strategy

## Objective
Implement comprehensive testing for BACO components ensuring reliability, performance, and accurate orchestration decisions.

## Testing Structure

### 1. Unit Tests
Create `tests/` directory structure:

```
tests/
├── test_complexity.py
├── test_agents.py
├── test_context.py
├── test_orchestrator.py
├── test_cli.py
├── fixtures/
│   ├── projects.yaml
│   ├── agent_outputs.json
│   └── patterns.yaml
└── conftest.py
```

### 2. Complexity Analyzer Tests
Create `tests/test_complexity.py`:

```python
import pytest
from unittest.mock import AsyncMock, patch
from baco.complexity import ComplexityAnalyzer, ComplexityLevel

class TestComplexityAnalyzer:
    @pytest.fixture
    def analyzer(self):
        mock_client = AsyncMock()
        return ComplexityAnalyzer(mock_client)
    
    @pytest.mark.asyncio
    async def test_simple_project_classification(self, analyzer):
        """Test that simple CRUD projects are classified correctly"""
        project = "Basic todo list API with CRUD operations"
        tech_stack = ["Python", "SQLite"]
        requirements = ["User authentication", "Basic CRUD"]
        
        result = await analyzer.analyze(project, tech_stack, requirements)
        
        assert result.overall_level == ComplexityLevel.SIMPLE
        assert len(result.required_agents) <= 2
        assert "developer" in result.required_agents
    
    @pytest.mark.asyncio
    async def test_complex_project_classification(self, analyzer):
        """Test that complex projects trigger appropriate agents"""
        project = "Distributed microservices platform with event sourcing"
        tech_stack = ["Kubernetes", "Kafka", "PostgreSQL", "Redis"]
        requirements = ["99.99% uptime", "PCI compliance", "Multi-region"]
        
        result = await analyzer.analyze(project, tech_stack, requirements)
        
        assert result.overall_level == ComplexityLevel.COMPLEX
        assert "architect" in result.required_agents
        assert "security" in result.required_agents
        assert len(result.required_agents) >= 4
    
    @pytest.mark.asyncio
    async def test_edge_case_detection(self, analyzer):
        """Test edge cases that elevate complexity"""
        # Simple project with compliance requirement
        project = "Basic blog platform"
        tech_stack = ["WordPress"]
        requirements = ["HIPAA compliance"]  # This elevates complexity
        
        result = await analyzer.analyze(project, tech_stack, requirements)
        
        assert result.overall_level != ComplexityLevel.SIMPLE
        assert "security" in result.required_agents
        assert any("compliance" in risk.lower() for risk in result.risk_factors)
```

### 3. Agent System Tests
Create `tests/test_agents.py`:

```python
class TestAgentSystem:
    @pytest.mark.asyncio
    async def test_agent_activation_triggers(self):
        """Test that agents activate based on correct triggers"""
        security_agent = SecurityAgent()
        
        # Should activate for security keywords
        assert security_agent.should_activate("payment processing", mock_complexity())
        assert security_agent.should_activate("user authentication", mock_complexity())
        assert not security_agent.should_activate("simple calculator", mock_complexity())
    
    @pytest.mark.asyncio 
    async def test_agent_collaboration(self):
        """Test agent interaction patterns"""
        developer = DeveloperAgent()
        architect = ArchitectAgent()
        
        context = AgentContext(
            project_description="E-commerce platform",
            complexity_profile=mock_complexity(),
            previous_outputs={},
            current_phase="planning"
        )
        
        # Run sequentially
        dev_output = await developer.analyze(context)
        context.previous_outputs["developer"] = dev_output.content
        arch_output = await architect.analyze(context)
        
        # Architect should reference developer insights
        assert "developer" in arch_output.dependencies
        assert arch_output.confidence > 0.7
```

### 4. Context Management Tests
Create `tests/test_context.py`:

```python
class TestContextManagement:
    @pytest.mark.asyncio
    async def test_context_compression(self):
        """Test that compression preserves critical information"""
        manager = ContextManager(max_tokens=1000)
        
        # Create oversized context
        large_context = create_large_context(2000)  # 2x limit
        
        compressed = await manager.compress(large_context, 1000)
        
        assert compressed.total_tokens <= 1000
        assert all(
            layer in compressed.layers 
            for layer in large_context.layers 
            if layer.priority >= 8
        )
    
    @pytest.mark.asyncio
    async def test_pattern_matching(self):
        """Test pattern relevance calculation"""
        memory = PatternMemory()
        
        # Add test patterns
        pattern1 = Pattern(
            id="test1",
            category="architecture",
            description="Microservices with event sourcing",
            fingerprint="abc123"
        )
        memory.add_pattern(pattern1)
        
        # Create similar context
        context = create_context_with_fingerprint("abc124")  # Similar
        
        relevant = await memory.find_relevant_patterns(context)
        
        assert len(relevant) > 0
        assert pattern1 in relevant
```

### 5. Orchestrator Integration Tests
Create `tests/test_orchestrator.py`:

```python
class TestOrchestrator:
    @pytest.mark.asyncio
    async def test_end_to_end_planning(self):
        """Test complete planning workflow"""
        config = load_test_config()
        orchestrator = BACOOrchestrator(config)
        
        result = await orchestrator.plan(
            project_description="REST API for inventory management",
            requirements=["Real-time updates", "Multi-tenant"],
            tech_stack=["FastAPI", "PostgreSQL", "Redis"]
        )
        
        assert result.prp is not None
        assert len(result.prp) > 500  # Substantial PRP
        assert result.execution_time < 30  # Reasonable time
        assert result.token_usage["total"] < 10000  # Cost control
    
    @pytest.mark.asyncio
    async def test_confidence_handling(self):
        """Test low confidence triggers review"""
        orchestrator = BACOOrchestrator(load_test_config())
        
        # Mock low confidence response
        with patch.object(orchestrator.llm_client, 'analyze') as mock:
            mock.return_value.confidence = 0.3
            
            result = await orchestrator.plan(
                "Ambiguous project description",
                [], []
            )
            
            assert result.requires_human_review
```

### 6. Performance Tests
Create `tests/test_performance.py`:

```python
class TestPerformance:
    @pytest.mark.asyncio
    async def test_orchestration_latency(self):
        """Ensure orchestration meets latency requirements"""
        orchestrator = BACOOrchestrator(load_test_config())
        
        times = []
        for _ in range(5):
            start = time.time()
            await orchestrator.plan(
                "Standard web application",
                ["User auth", "CRUD operations"],
                ["Python", "PostgreSQL"]
            )
            times.append(time.time() - start)
        
        avg_time = sum(times) / len(times)
        assert avg_time < 10  # Average under 10 seconds
        assert max(times) < 15  # No outliers over 15 seconds
    
    @pytest.mark.asyncio
    async def test_token_efficiency(self):
        """Test token usage optimization"""
        simple_project = "Basic TODO app"
        complex_project = "Enterprise resource planning system with 50 modules"
        
        simple_tokens = await measure_token_usage(simple_project)
        complex_tokens = await measure_token_usage(complex_project)
        
        # Simple should use significantly fewer tokens
        assert simple_tokens < complex_tokens * 0.3
        assert simple_tokens < 2000  # Reasonable limit for simple
```

### 7. CLI Tests
Create `tests/test_cli.py`:

```python
from click.testing import CliRunner

class TestCLI:
    def test_plan_command_basic(self):
        """Test basic plan command execution"""
        runner = CliRunner()
        result = runner.invoke(cli, [
            'plan',
            '--project', 'Simple web app',
            '--requirements', 'User login',
            '--tech-stack', 'Python'
        ])
        
        assert result.exit_code == 0
        assert "Generated PRP" in result.output
    
    def test_config_initialization(self):
        """Test config initialization"""
        runner = CliRunner()
        with runner.isolated_filesystem():
            result = runner.invoke(cli, ['config', '--init'])
            
            assert result.exit_code == 0
            assert Path('.baco/config.yaml').exists()
```

### 8. Mock Fixtures
Create `tests/conftest.py`:

```python
@pytest.fixture
def mock_llm_client():
    """Mock LLM client for testing"""
    client = AsyncMock()
    client.analyze.return_value = ComplexityProfile(
        overall_level=ComplexityLevel.MODERATE,
        dimensions=[],
        required_agents=["developer", "qa"],
        risk_factors=[],
        confidence=0.85,
        reasoning="Test reasoning"
    )
    return client

@pytest.fixture
def sample_projects():
    """Load sample project fixtures"""
    with open('tests/fixtures/projects.yaml') as f:
        return yaml.safe_load(f)
```

### 9. Validation Scripts
Create `scripts/validate_deployment.py`:

```python
async def validate_deployment():
    """Validate BACO deployment"""
    checks = []
    
    # Check API connectivity
    try:
        client = openai.AsyncOpenAI()
        await client.models.list()
        checks.append(("OpenAI API", "✓"))
    except:
        checks.append(("OpenAI API", "✗"))
    
    # Check configuration
    try:
        config = load_config()
        checks.append(("Configuration", "✓"))
    except:
        checks.append(("Configuration", "✗"))
    
    # Test basic orchestration
    try:
        orchestrator = BACOOrchestrator(config)
        result = await orchestrator.plan("Test project", [], [])
        checks.append(("Orchestration", "✓"))
    except:
        checks.append(("Orchestration", "✗"))
    
    # Display results
    for check, status in checks:
        print(f"{check}: {status}")
    
    return all(status == "✓" for _, status in checks)
```

## Test Execution Strategy

### Continuous Integration
```yaml
# .github/workflows/test.yml
name: BACO Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install poetry
      - run: poetry install
      - run: poetry run pytest -v --cov=baco --cov-report=xml
      - uses: codecov/codecov-action@v3
```

### Local Testing
```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=baco --cov-report=html

# Run specific test suite
poetry run pytest tests/test_complexity.py -v

# Run performance tests only
poetry run pytest tests/test_performance.py -v
```

## Success Criteria
- Unit test coverage > 80%
- All integration tests pass
- Performance benchmarks met
- No flaky tests
- Clear test documentation