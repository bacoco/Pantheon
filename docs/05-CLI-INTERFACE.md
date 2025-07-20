# BACO CLI Implementation

## Objective
Implement a clean, intuitive CLI interface for BACO using Click, with rich output formatting and helpful interactive features.

## Core CLI Structure
Create `baco/cli.py`:

```python
import click
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
from rich.panel import Panel
from rich.syntax import Syntax
import asyncio
from pathlib import Path

console = Console()

@click.group()
@click.version_option(version="0.1.0")
def cli():
    """BACO - Basic Adaptive Context Orchestrator
    
    AI-powered development orchestration that adapts to your project's complexity.
    """
    pass

@cli.command()
@click.option('--project', '-p', help='Project description or path to project file')
@click.option('--requirements', '-r', multiple=True, help='Project requirements')
@click.option('--tech-stack', '-t', multiple=True, help='Technology stack')
@click.option('--config', '-c', type=click.Path(exists=True), help='Path to config file')
@click.option('--output', '-o', type=click.Path(), help='Output file for PRP')
@click.option('--live', is_flag=True, help='Show live agent deliberation')
@click.option('--patterns', is_flag=True, help='Show relevant patterns found')
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
def plan(project, requirements, tech_stack, config, output, live, patterns, verbose):
    """Generate an enhanced PRP through adaptive agent consultation"""
    asyncio.run(_plan_command(project, requirements, tech_stack, config, output, live, patterns, verbose))

async def _plan_command(project, requirements, tech_stack, config, output, live, patterns, verbose):
    """Async implementation of plan command"""
    # Load configuration
    baco_config = load_config(config)
    
    # Initialize orchestrator
    orchestrator = BACOOrchestrator(baco_config)
    
    # Parse project info
    project_info = parse_project_info(project, requirements, tech_stack)
    
    # Show planning header
    console.print(Panel.fit(
        f"[bold blue]BACO Planning Phase[/bold blue]\n"
        f"Project: {project_info['description'][:50]}...",
        border_style="blue"
    ))
    
    # Run orchestration with progress
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        # Analyze complexity
        task = progress.add_task("[cyan]Analyzing project complexity...", total=None)
        complexity = await orchestrator.complexity_analyzer.analyze(
            project_info['description'],
            project_info['tech_stack'],
            project_info['requirements']
        )
        progress.update(task, completed=True)
        
        # Show complexity analysis
        if verbose:
            show_complexity_analysis(complexity)
        
        # Select agents
        task = progress.add_task("[cyan]Selecting optimal agents...", total=None)
        agents = await orchestrator._select_agents(complexity, project_info['description'])
        progress.update(task, completed=True)
        
        # Show selected agents
        show_selected_agents(agents, complexity)
        
        # Run full orchestration
        if live:
            result = await run_with_live_output(orchestrator, project_info, agents)
        else:
            task = progress.add_task("[cyan]Running agent analysis...", total=None)
            result = await orchestrator.plan(
                project_info['description'],
                project_info['requirements'],
                project_info['tech_stack']
            )
            progress.update(task, completed=True)
    
    # Show results
    show_orchestration_results(result, patterns)
    
    # Save output
    if output:
        save_prp(result.prp, output)
        console.print(f"[green]✓[/green] PRP saved to: {output}")
    else:
        console.print("\n[bold]Generated PRP:[/bold]")
        console.print(Panel(result.prp, border_style="green"))
```

### Build Command
```python
@cli.command()
@click.option('--prp', '-p', type=click.Path(exists=True), help='Path to PRP file')
@click.option('--live', is_flag=True, help='Show live build progress')
@click.option('--test-coverage', type=int, default=80, help='Required test coverage %')
@click.option('--agent', '-a', multiple=True, help='Additional agents to activate')
def build(prp, live, test_coverage, agent):
    """Execute the PRP with adaptive agent support"""
    asyncio.run(_build_command(prp, live, test_coverage, agent))

async def _build_command(prp, live, test_coverage, agent):
    """Async implementation of build command"""
    # Load PRP
    prp_content = load_prp(prp)
    
    # Initialize build monitor
    build_monitor = BuildMonitor(
        prp=prp_content,
        test_coverage_target=test_coverage,
        additional_agents=list(agent)
    )
    
    console.print(Panel.fit(
        f"[bold green]BACO Build Phase[/bold green]\n"
        f"Executing PRP with adaptive agent support",
        border_style="green"
    ))
    
    if live:
        # Show live build progress
        await show_live_build(build_monitor)
    else:
        # Run build with progress indicators
        result = await build_monitor.execute()
        show_build_results(result)
```

### Interactive Features
```python
async def run_with_live_output(orchestrator, project_info, agents):
    """Run orchestration with live agent deliberation"""
    console.print("\n[bold cyan]Live Agent Deliberation:[/bold cyan]")
    
    # Create live display area
    live_display = console.status("[bold green]Agents thinking...")
    
    # Hook into agent outputs
    agent_outputs = {}
    
    with live_display:
        for agent in agents:
            live_display.update(f"[bold yellow]{agent.name}[/bold yellow] analyzing...")
            
            # Run agent
            output = await agent.analyze(create_agent_context(project_info))
            agent_outputs[agent.name] = output
            
            # Show agent thinking
            console.print(f"\n[bold]{agent.name}:[/bold]")
            console.print(Panel(
                output.content[:200] + "...",
                title=f"Confidence: {output.confidence:.2f}",
                border_style="blue"
            ))
    
    return agent_outputs
```

### Rich Output Formatting
```python
def show_complexity_analysis(complexity: ComplexityProfile):
    """Display complexity analysis in a nice table"""
    table = Table(title="Complexity Analysis", show_header=True)
    table.add_column("Dimension", style="cyan")
    table.add_column("Score", justify="center")
    table.add_column("Reasoning", style="dim")
    
    for dim in complexity.dimensions:
        score_color = "green" if dim.score < 4 else "yellow" if dim.score < 7 else "red"
        table.add_row(
            dim.name,
            f"[{score_color}]{dim.score:.1f}/10[/{score_color}]",
            dim.reasoning[:50] + "..."
        )
    
    console.print(table)
    console.print(f"\n[bold]Overall Complexity:[/bold] [{complexity.overall_level}]{complexity.overall_level}[/{complexity.overall_level}]")

def show_selected_agents(agents: List[BaseAgent], complexity: ComplexityProfile):
    """Display selected agents"""
    console.print("\n[bold]Selected Agents:[/bold]")
    
    for agent in agents:
        icon = "🤖" if agent.name in ["developer", "qa"] else "🧠"
        console.print(f"  {icon} [cyan]{agent.name}[/cyan] - {agent.description}")
    
    console.print(f"\n[dim]({len(agents)} agents selected based on {complexity.overall_level} complexity)[/dim]")
```

### Configuration Management
```python
@cli.command()
@click.option('--init', is_flag=True, help='Initialize new configuration')
@click.option('--add-agent', help='Add custom agent configuration')
@click.option('--set', '-s', multiple=True, help='Set config value (key=value)')
@click.option('--show', is_flag=True, help='Show current configuration')
def config(init, add_agent, set, show):
    """Manage BACO configuration"""
    if init:
        init_configuration()
    elif add_agent:
        add_custom_agent(add_agent)
    elif set:
        update_configuration(set)
    elif show:
        show_configuration()

def init_configuration():
    """Initialize BACO configuration"""
    config_path = Path.home() / ".baco" / "config.yaml"
    config_path.parent.mkdir(exist_ok=True)
    
    if config_path.exists():
        if not click.confirm("Configuration exists. Overwrite?"):
            return
    
    # Create default configuration
    default_config = {
        "openai_api_key": "${OPENAI_API_KEY}",
        "model": "gpt-4-turbo-preview",
        "max_agents_simple": 2,
        "max_agents_medium": 4,
        "max_agents_complex": 8,
        "context_window_size": 8000,
        "agents": [
            {
                "name": "developer",
                "triggers": ["always"],
                "system_prompt": "You are a senior developer...",
                "enabled": True
            },
            {
                "name": "qa",
                "triggers": ["always"],
                "system_prompt": "You are a QA engineer...",
                "enabled": True
            }
        ]
    }
    
    with open(config_path, 'w') as f:
        yaml.dump(default_config, f, default_flow_style=False)
    
    console.print(f"[green]✓[/green] Configuration initialized at: {config_path}")
```

### Pattern Management
```python
@cli.command()
@click.option('--list', 'list_patterns', is_flag=True, help='List learned patterns')
@click.option('--search', help='Search patterns')
@click.option('--export', type=click.Path(), help='Export patterns')
@click.option('--import', 'import_file', type=click.Path(exists=True), help='Import patterns')
@click.option('--stats', is_flag=True, help='Show pattern statistics')
def patterns(list_patterns, search, export, import_file, stats):
    """Manage learned patterns"""
    memory = PatternMemory()
    
    if list_patterns:
        show_patterns(memory.get_all_patterns())
    elif search:
        results = memory.search_patterns(search)
        show_patterns(results)
    elif export:
        memory.export_patterns(export)
        console.print(f"[green]✓[/green] Patterns exported to: {export}")
    elif import_file:
        count = memory.import_patterns(import_file)
        console.print(f"[green]✓[/green] Imported {count} patterns")
    elif stats:
        show_pattern_statistics(memory)
```

## Error Handling
```python
def handle_errors(func):
    """Decorator for consistent error handling"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except OpenAIError as e:
            console.print(f"[red]✗ OpenAI API Error:[/red] {str(e)}")
            console.print("[dim]Check your API key and try again[/dim]")
            sys.exit(1)
        except ConfigError as e:
            console.print(f"[red]✗ Configuration Error:[/red] {str(e)}")
            console.print("[dim]Run 'baco config --init' to create configuration[/dim]")
            sys.exit(1)
        except Exception as e:
            console.print(f"[red]✗ Unexpected Error:[/red] {str(e)}")
            if os.getenv("BACO_DEBUG"):
                console.print_exception()
            sys.exit(1)
    return wrapper
```

## Success Criteria
- Commands complete successfully with clear feedback
- Rich formatting improves readability
- Live mode provides engaging real-time updates
- Configuration is easy to manage
- Errors are handled gracefully with helpful messages