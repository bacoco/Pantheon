# Model Management Command System

Advanced model attribution and routing control for the Pantheon Multi-AI ecosystem.

## Purpose
Control which AI models handle specific tasks, optimize costs, and manage routing strategies across all gods and agents.

## Command Syntax
```bash
/model-[action] [parameters]
```

## Available Commands

### Global Model Control

#### Set Global Model Override
```bash
/model-global set [provider] [model]
/model-global set gemini gemini-2.5-pro
/model-global set claude sonnet
```
This overrides ALL agent model assignments globally.

#### Clear Global Override
```bash
/model-global clear
```
Returns to smart routing based on agent configurations.

#### Show Global Status
```bash
/model-global status
```
Display current global model configuration and overrides.

### Agent-Specific Control

#### Set Model for Specific Agent/God
```bash
/model-agent [agent-name] [provider] [model]
/model-agent apollo gemini gemini-2.5-pro
/model-agent athena claude sonnet
/model-agent zeus claude opus
```

#### Clear Agent Override
```bash
/model-agent [agent-name] clear
/model-agent apollo clear
```

#### List All Agent Assignments
```bash
/model-agent list
```
Shows current model assignment for all agents.

#### Bulk Agent Configuration
```bash
/model-agents [category] [provider] [model]
/model-agents validation gemini gemini-2.5-pro
/model-agents creation claude sonnet
/model-agents documentation gemini gemini-2.5-flash
```

### Routing Strategy Control

#### Set Routing Strategy
```bash
/routing-strategy [strategy-name]
/routing-strategy cost-optimized    # Minimize costs
/routing-strategy quality-focused   # Maximize quality  
/routing-strategy speed-focused     # Maximize speed
/routing-strategy balanced          # Balance all factors
/routing-strategy development       # Development mode
```

#### Show Current Strategy
```bash
/routing-strategy status
```

#### Create Custom Strategy
```bash
/routing-create [strategy-name] [config-file]
/routing-create my-strategy ./custom-routing.json
```

### Workflow Mode Control

#### Validation Modes
```bash
/validation-mode strict     # All work must be validated
/validation-mode optional   # Validation on request only
/validation-mode off        # No automatic validation
```

#### Collaboration Modes
```bash
/collaboration-mode active   # Full multi-agent interaction
/collaboration-mode minimal  # Limited cross-agent communication
/collaboration-mode single   # Single-agent mode (no collaboration)
```

#### Auto-Delegation
```bash
/auto-delegation on         # Zeus automatically delegates to gods
/auto-delegation off        # Manual delegation required
```

### Cost and Usage Control

#### Set Daily Usage Limits
```bash
/limit-daily [provider] [count]
/limit-daily claude 1000
/limit-daily gemini 800
```

#### Show Usage Statistics
```bash
/usage-stats daily
/usage-stats weekly
/usage-stats monthly
/usage-stats by-model
/usage-stats by-agent
```

#### Cost Optimization
```bash
/cost-optimize enable
/cost-optimize disable
/cost-optimize strategy [conservative|balanced|performance]
```

#### Cost Alerts
```bash
/cost-alert set [amount]
/cost-alert set 50          # Alert when daily spend exceeds $50
/cost-alert clear
```

### Emergency Controls

#### Emergency Fallback to Free Tier
```bash
/emergency free-tier-only
```
Immediately routes all requests to free tier models (Gemini).

#### Force Specific Model
```bash
/force-model [provider] [model] --duration [time]
/force-model claude sonnet --duration 1h
/force-model gemini gemini-2.5-flash --duration 30m
```

#### Reset to Defaults
```bash
/reset-config
```
Resets all model routing to default configuration.

## Monitoring and Analytics

### Real-Time Monitoring
```bash
/monitor performance        # Model performance metrics
/monitor costs             # Real-time cost tracking
/monitor usage-patterns    # Usage pattern analysis
/monitor routing-decisions # See routing decisions in real-time
```

### Generate Reports
```bash
/report weekly-usage       # Weekly usage report
/report model-effectiveness # Model effectiveness analysis
/report cost-analysis      # Detailed cost breakdown
/report optimization-opportunities # Suggested optimizations
```

### Optimization Suggestions
```bash
/optimize suggest          # Get optimization suggestions
/optimize implement [id]   # Implement specific suggestion
/optimize preview [id]     # Preview optimization impact
```

## Predefined Routing Strategies

### Cost-Optimized (60% cost reduction)
```json
{
  "creation": "claude,sonnet",
  "validation": "gemini,gemini-2.5-pro",
  "quick_tasks": "gemini,gemini-2.5-flash",
  "documentation": "gemini,gemini-2.5-flash"
}
```

### Quality-Focused (Maximum quality)
```json
{
  "creation": "claude,sonnet",
  "validation": "claude,sonnet",
  "analysis": "gemini,gemini-2.5-pro",
  "documentation": "claude,sonnet"
}
```

### Speed-Focused (Fastest responses)
```json
{
  "all_tasks": "gemini,gemini-2.5-flash",
  "complex_only": "gemini,gemini-2.5-pro"
}
```

### Development Mode (Rapid iteration)
```json
{
  "creation": "claude,sonnet",
  "validation": "gemini,gemini-2.5-flash",
  "testing": "gemini,gemini-2.5-flash",
  "documentation": "skip"
}
```

## God-Specific Optimizations

### Creation Gods (Claude)
```bash
/model-agent zeus claude sonnet
/model-agent athena claude sonnet
/model-agent hephaestus claude sonnet
```

### Validation Gods (Gemini FREE)
```bash
/model-agent apollo gemini gemini-2.5-pro
/model-agent themis gemini gemini-2.5-pro
/model-agent argus gemini gemini-2.5-pro
```

### Support Gods (Gemini Flash FREE)
```bash
/model-agent hermes gemini gemini-2.5-flash
/model-agent calliope gemini gemini-2.5-flash
/model-agent iris gemini gemini-2.5-flash
```

## Example Usage Patterns

### Starting a Cost-Optimized Session
```bash
# Set routing strategy
/routing-strategy cost-optimized

# Configure validation mode
/validation-mode strict

# Set daily limits
/limit-daily claude 500

# Enable cost alerts
/cost-alert set 25
```

### High-Quality Critical Work
```bash
# Use best models for critical work
/routing-strategy quality-focused

# Override specific god for extra quality
/model-agent athena claude opus

# Ensure thorough validation
/validation-mode strict
```

### Rapid Prototyping
```bash
# Speed over everything
/routing-strategy speed-focused

# Skip validation for speed
/validation-mode off

# Use fastest models
/model-agents all gemini gemini-2.5-flash
```

### Emergency Cost Control
```bash
# Immediately switch to free tier
/emergency free-tier-only

# Check current usage
/usage-stats daily

# Get optimization suggestions
/optimize suggest
```

## Best Practices

### Cost Management
1. Start sessions with `/routing-strategy cost-optimized`
2. Set daily limits to prevent overspending
3. Use Gemini models for validation (FREE)
4. Monitor usage with `/usage-stats daily`

### Quality Assurance
1. Keep `/validation-mode strict` for production work
2. Use Claude Sonnet for complex reasoning
3. Use Gemini Pro for thorough analysis
4. Never skip validation on critical code

### Performance Optimization
1. Use Gemini Flash for quick responses
2. Batch similar tasks together
3. Use appropriate models for task complexity
4. Monitor performance with `/monitor performance`

## Troubleshooting

### High Costs
```bash
/usage-stats by-model      # Identify expensive models
/routing-strategy cost-optimized
/emergency free-tier-only   # If needed
```

### Slow Responses
```bash
/monitor performance        # Check bottlenecks
/model-agents support gemini gemini-2.5-flash
/routing-strategy speed-focused
```

### Quality Issues
```bash
/validation-mode strict     # Ensure validation
/model-agent [god] claude sonnet  # Upgrade specific god
/routing-strategy quality-focused
```

## Configuration File Format

Custom routing strategies can be defined in JSON:
```json
{
  "name": "custom-strategy",
  "description": "My custom routing strategy",
  "routing_rules": {
    "creation": "claude,sonnet",
    "validation": "gemini,gemini-2.5-pro",
    "documentation": "gemini,gemini-2.5-flash"
  },
  "limits": {
    "daily_claude": 1000,
    "daily_gemini": 1500
  },
  "validation_mode": "strict"
}
```

Remember: Smart model management can reduce costs by 60% while maintaining quality. Use validation gods (Apollo, Themis, Argus) with Gemini for FREE comprehensive validation.