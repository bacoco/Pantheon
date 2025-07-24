# /analyze Command

## ACTIVATION
When the user types /analyze <task>, perform multi-dimensional complexity analysis.

## OUTPUT FORMAT
```yaml
complexity_analysis:
  scope: <brief description>
  dimensions:
    - technical: <rating 1-10>
    - requirements: <rating 1-10>
    - integration: <rating 1-10>
    - testing: <rating 1-10>
  recommendation: <approach>
```

## INSTRUCTIONS
1. Analyze the task across multiple dimensions
2. Rate complexity from 1-10 for each dimension
3. Provide a clear recommendation for approach
4. Suggest whether to use simple implementation or full BMAD workflow