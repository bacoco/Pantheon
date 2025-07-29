# /help Command

## ACTIVATION
When the user types /help, show available BACO commands.

## OUTPUT FORMAT
```yaml
available_commands:
  core_commands:
    - name: help
      description: Show this help message
    - name: baco init
      description: Initialize BACO in current directory or create new project
      usage: /baco init [project-name]
    - name: baco create-app
      description: Launch full application development workflow
      usage: /baco create-app <type> <name>
      types: [web, api, fullstack, mobile]
  
  development_commands:
    - name: analyze
      description: Perform multi-dimensional complexity analysis
      usage: /analyze <task-description>
    - name: orchestrate
      description: Coordinate specialist agents for insights
      usage: /orchestrate <task-description>
    - name: generate-prp
      description: Generate Product Requirements Prompt
      usage: /generate-prp <project-description>
    - name: execute-prp
      description: Execute a Product Requirements Prompt
      usage: /execute-prp <prp-file>
  
  quick_start:
    - "For new app: /baco create-app web my-app"
    - "For analysis: /analyze <your-task>"
    - "For planning: /generate-prp <project-idea>"
```

## INSTRUCTIONS
1. List all available commands from the .claude/commands directory
2. Group commands by category (core, development, etc.)
3. Show usage examples for complex commands
4. Include quick start suggestions
5. Highlight the most powerful commands like create-app
