# Divine Workflow Orchestration Command System

Orchestrate complex multi-god workflows with automatic validation, cost optimization, and intelligent handoffs.

## Purpose
Coordinate divine collaboration across the entire Pantheon, ensuring systematic development with automatic validation loops and cost-effective model routing.

## Command Syntax
```bash
/gods workflow [action] [workflow-name] [parameters]
```

## Workflow Actions

### Start Workflows
```bash
/gods workflow start [workflow-name] [parameters]
/gods workflow start feature-development --feature="user-auth"
/gods workflow start bug-fix --issue="payment-error"
/gods workflow start architecture-review --component="api"
/gods workflow start security-audit --scope="full"
```

### Monitor Workflows
```bash
/gods workflow status              # Show all active workflows
/gods workflow status [id]         # Show specific workflow
/gods workflow list                # List available workflows
/gods workflow history             # Show completed workflows
```

### Control Workflows
```bash
/gods workflow pause [id]          # Pause active workflow
/gods workflow resume [id]         # Resume paused workflow
/gods workflow cancel [id]         # Cancel workflow
/gods workflow restart [id]        # Restart failed workflow
```

## Predefined Divine Workflows

### 🏗️ Feature Development Workflow
```bash
/gods workflow start feature-development --feature="[name]" --priority="[high|medium|low]"
```

**Divine Sequence**:
1. **⚡ Zeus** (Claude Sonnet) - Orchestrates the quest
2. **🦉 Athena** (Claude Sonnet) - Designs architecture
3. **☀️ Apollo** (Gemini Pro FREE) - Validates design
4. **🔨 Hephaestus** (Claude Sonnet) - Builds implementation
5. **☀️ Apollo** (Gemini Pro FREE) - Reviews code quality
6. **👁️ Argus** (Gemini Pro FREE) - Security scan
7. **⚖️ Themis** (Gemini Pro FREE) - Compliance check
8. **📜 Calliope** (Gemini Flash FREE) - Documentation
9. **👟 Hermes** (Gemini Flash FREE) - Status updates

**Cost**: ~$0.012 (60% savings using Gemini validation)

### 🐛 Bug Fix Workflow
```bash
/gods workflow start bug-fix --issue="[description]" --severity="[critical|high|medium|low]"
```

**Divine Sequence**:
1. **⚡ Zeus** - Assesses the crisis
2. **☀️ Apollo** (Gemini Pro FREE) - Analyzes bug
3. **🦉 Athena** (Claude Sonnet) - Designs fix strategy
4. **👁️ Argus** (Gemini Pro FREE) - Security implications
5. **🔨 Hephaestus** (Claude Sonnet) - Implements fix
6. **☀️ Apollo** (Gemini Pro FREE) - Validates fix
7. **⚖️ Themis** (Gemini Pro FREE) - Ensures compliance

**Cost**: ~$0.006 (70% savings)

### 🏛️ Architecture Review Workflow
```bash
/gods workflow start architecture-review --component="[name]" --depth="[quick|standard|deep]"
```

**Divine Sequence**:
1. **⚡ Zeus** - Convenes the council
2. **🦉 Athena** (Claude Sonnet) - Current state analysis
3. **☀️ Apollo** (Gemini Pro FREE) - Quality assessment
4. **⚖️ Themis** (Gemini Pro FREE) - Standards compliance
5. **👁️ Argus** (Gemini Pro FREE) - Security architecture
6. **🦉 Athena** (Claude Sonnet) - Improvement design
7. **📜 Calliope** (Gemini Flash FREE) - Document decisions

**Cost**: ~$0.009 (65% savings)

### 🔒 Security Audit Workflow
```bash
/gods workflow start security-audit --scope="[component|full]" --standard="[OWASP|CWE|SANS]"
```

**Divine Sequence**:
1. **⚡ Zeus** - Initiates security review
2. **👁️ Argus** (Gemini Pro FREE) - Vulnerability scan
3. **☀️ Apollo** (Gemini Pro FREE) - Code security review
4. **⚖️ Themis** (Gemini Pro FREE) - Compliance audit
5. **🦉 Athena** (Claude Sonnet) - Security architecture
6. **🔨 Hephaestus** (Claude Sonnet) - Implement fixes
7. **👁️ Argus** (Gemini Pro FREE) - Re-validation

**Cost**: ~$0.006 (80% savings using Gemini validators)

### 🎨 UI/UX Design Workflow
```bash
/gods workflow start ui-design --component="[name]" --type="[web|mobile|desktop]"
```

**Divine Sequence**:
1. **⚡ Zeus** - Design initiative
2. **🌈 Iris** (Gemini Flash FREE) - User research & design
3. **☀️ Apollo** (Gemini Pro FREE) - Usability validation
4. **🦉 Athena** (Claude Sonnet) - Technical feasibility
5. **🔨 Hephaestus** (Claude Sonnet) - Implementation
6. **🌈 Iris** (Gemini Flash FREE) - Design validation
7. **📜 Calliope** (Gemini Flash FREE) - User documentation

**Cost**: ~$0.009 (70% savings)

## Custom Workflow Creation

### Define Custom Workflow
```bash
/gods workflow create [name] --steps [god-sequence]
```

### Workflow Definition Format
```yaml
name: custom-workflow
description: Custom divine workflow
cost_optimization: true
auto_validation: true

steps:
  - god: zeus
    action: orchestrate
    model: claude-sonnet
    
  - god: athena
    action: design
    model: claude-sonnet
    validates_with: apollo
    
  - god: apollo
    action: validate
    model: gemini-2.5-pro
    cost: free
    
  - god: hephaestus
    action: implement
    model: claude-sonnet
    validates_with: [apollo, argus]
    
  - god: calliope
    action: document
    model: gemini-2.5-flash
    cost: free

handoffs:
  - from: athena
    to: apollo
    trigger: auto_validation
    
  - from: hephaestus
    to: [apollo, argus]
    trigger: completion
    
validation_gates:
  - after: athena
    validator: apollo
    required: true
    
  - after: hephaestus
    validator: [apollo, argus]
    required: true
```

## Workflow Orchestration Features

### Intelligent Handoffs
```
Athena completes design → Apollo automatically validates
Hephaestus finishes code → Apollo + Argus validate in parallel
Any god completes → Hermes provides status update
```

### Parallel Execution
When possible, gods work simultaneously:
```
        ┌─→ Apollo (validation)
Zeus ─→ ├─→ Themis (compliance)
        └─→ Argus (security)
```

### Cost Optimization
```
Creation tasks → Claude Sonnet ($0.003/1K)
Validation tasks → Gemini Pro (FREE)
Documentation → Gemini Flash (FREE)
Status updates → Gemini Flash (FREE)
```

### Automatic Validation Gates
```yaml
validation_gates:
  architecture: apollo_required
  code: apollo_required
  security: argus_required
  compliance: themis_required
```

## Workflow Monitoring

### Real-Time Status
```bash
/gods workflow monitor            # Live workflow dashboard

⚡ DIVINE WORKFLOW STATUS ⚡
━━━━━━━━━━━━━━━━━━━━━━━━━

Workflow: Feature Development
ID: wf_12345
Status: IN_PROGRESS

Progress: ████████░░ 75%

Current Step: Implementation
Active God: 🔨 Hephaestus
Model: Claude Sonnet
Started: 2 minutes ago

Completed:
✅ Zeus - Orchestration
✅ Athena - Architecture  
✅ Apollo - Design Validation

In Progress:
🔄 Hephaestus - Implementation

Pending:
⏳ Apollo - Code Review
⏳ Argus - Security Scan
⏳ Calliope - Documentation

Cost so far: $0.006
Estimated total: $0.012
Savings: 60% vs all-Claude
```

### Workflow Analytics
```bash
/gods workflow analytics

📊 WORKFLOW ANALYTICS 📊
━━━━━━━━━━━━━━━━━━━━━

Today's Workflows: 12
Completed: 10
In Progress: 2

Average Duration: 15 min
Average Cost: $0.010
Total Savings: $0.180

Most Used:
1. Feature Development (5)
2. Bug Fix (4)
3. Security Audit (3)

Performance:
Success Rate: 95%
Validation Pass: 88%
Average Quality: 92/100
```

## Workflow Commands

### Quick Actions
```bash
/gods workflow quick-validate      # Fast validation workflow
/gods workflow emergency-fix       # Critical bug workflow
/gods workflow rapid-prototype     # Speed-focused workflow
```

### Batch Workflows
```bash
/gods workflow batch --file workflows.yaml
# Process multiple workflows from file
```

### Workflow Templates
```bash
/gods workflow template list       # Show available templates
/gods workflow template create     # Create new template
/gods workflow template edit       # Modify template
```

## Integration Examples

### With Git Hooks
```bash
# pre-commit hook
/gods workflow start pre-commit-validation --quick

# pre-push hook
/gods workflow start pre-push-validation --comprehensive
```

### With CI/CD
```yaml
# CI pipeline
- name: Divine Validation
  run: |
    /gods workflow start ci-validation --full
    /gods workflow wait --timeout 10m
    /gods workflow status --exit-code
```

### With Development Flow
```bash
# Morning standup
/gods workflow start daily-status

# Before lunch
/gods workflow start morning-validation

# End of day
/gods workflow start daily-summary
```

## Cost Analysis

### Traditional All-Claude Workflow
```
10 god invocations × $0.003 = $0.030 per workflow
Daily (20 workflows) = $0.60
Monthly = $18.00
```

### Optimized Divine Council Workflow
```
4 Claude invocations = $0.012
6 Gemini invocations = $0.000
Total per workflow = $0.012 (60% reduction)
Daily (20 workflows) = $0.24
Monthly = $7.20
Monthly Savings = $10.80
```

## Best Practices

### Workflow Selection
1. Use predefined workflows for common tasks
2. Create custom workflows for repeated patterns
3. Choose depth based on criticality
4. Enable auto-validation for quality

### Cost Optimization
1. Always use Gemini gods for validation
2. Batch similar workflows together
3. Use quick workflows during development
4. Reserve deep workflows for production

### Quality Assurance
1. Never skip validation gates
2. Address critical issues immediately
3. Document workflow decisions
4. Review workflow analytics regularly

## Troubleshooting

### Workflow Stuck
```bash
/gods workflow status [id]        # Check status
/gods workflow logs [id]          # View logs
/gods workflow restart [id]       # Restart if needed
```

### High Costs
```bash
/routing-strategy cost-optimized  # Switch strategy
/gods workflow cost-analysis      # Analyze costs
```

### Validation Failures
```bash
/gods workflow validation-report [id]
# Review failures and fix issues
/gods workflow resume [id]
```

## Emergency Commands
```bash
/gods workflow emergency-stop-all  # Stop all workflows
/gods workflow rollback [id]      # Rollback changes
/gods workflow recovery-mode      # Enter recovery mode
```

Remember: Divine workflows orchestrate the power of Olympus efficiently. Let Zeus coordinate, Athena design, Hephaestus build, and the validation gods ensure quality—all while saving 60% on costs through intelligent model routing!