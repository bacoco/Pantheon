# /orchestrate Command

## ACTIVATION
When the user types /orchestrate <task>, coordinate specialist agents for comprehensive insights.

## OUTPUT FORMAT
```yaml
orchestration_plan:
  task: <task description>
  agents_required:
    - role: <agent role>
      responsibility: <what they will do>
    - role: <agent role>
      responsibility: <what they will do>
  workflow:
    - step: <step number>
      agent: <agent role>
      action: <what they do>
  expected_outcome: <description>
```

## INSTRUCTIONS
1. Identify which specialist agents are needed
2. Define clear responsibilities for each agent
3. Create a step-by-step workflow
4. Specify expected outcomes
5. Ensure proper handoffs between agents