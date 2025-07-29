# /baco Command

## ACTIVATION
When the user types /baco init, start an interactive session to create a complete application.

## BEHAVIOR

When the user runs `/baco init`:

1. **Start Interactive Session**
   - Greet the user
   - Ask what kind of application they want to build
   - Gather requirements through conversation

2. **Generate PRD (Product Requirements Document)**
   - Create a comprehensive PRD.md file
   - Include project goals, features, tech stack
   - Ask user to review and confirm

3. **Create Project Structure**
   - Generate README.md with project overview
   - Create directory structure based on project type
   - Set up configuration files (package.json, etc.)

4. **Implement Code**
   - Generate all necessary code files
   - Create components, APIs, database schemas
   - Implement features based on PRD
   - Ask for user validation at key points

5. **Finalize Project**
   - Create setup instructions
   - Generate development scripts
   - Provide next steps

## EXAMPLE INTERACTION

```
User: /baco init

Claude: Welcome to BACO! I'll help you create a complete application.

What type of application would you like to build?
- Web app (React, Vue, Next.js)
- API server (Node.js, Python)
- Full-stack application
- Mobile app

User: Web app with React

Claude: Great! Let's build a React web application. 

What is the main purpose of your app? What problem does it solve?

User: A task management app for teams

Claude: Excellent! I'll create a team task management app. Let me start by generating a Product Requirements Document (PRD).

[Generates PRD.md]

Here's the PRD for your team task management app. Would you like me to proceed with this plan? (yes/no)

User: yes

Claude: Perfect! Now I'll create the project structure and implement the features...

[Generates all code files, asks for validation at key points]
```

## INSTRUCTIONS

1. Engage in natural conversation
2. Gather all requirements before starting
3. Generate real, working code
4. Create all necessary files
5. Ask for user confirmation at important steps
6. Provide clear documentation
7. Ensure the project is ready to run

### /baco create-app <type> <name>
Launch full application development workflow.

Types:
- web: React/Next.js web application
- api: Node.js/Express API server
- fullstack: Full-stack application with frontend and backend
- mobile: React Native mobile app

## CREATE-APP WORKFLOW

When user runs `/baco create-app <type> <name>`:

1. **Analysis Phase**
   ```yaml
   project_analysis:
     name: <app-name>
     type: <app-type>
     requirements:
       - core_features: [list main features]
       - tech_stack: [recommended technologies]
       - architecture: [proposed architecture]
   ```

2. **Planning Phase**
   - Generate comprehensive PRD (Product Requirements Document)
   - Create technical specification
   - Design system architecture
   - Plan development phases

3. **Scaffolding Phase**
   - Create project structure
   - Set up development environment
   - Initialize git repository
   - Configure build tools

4. **Development Phase**
   - Generate boilerplate code
   - Implement core features
   - Set up testing framework
   - Create documentation

5. **Orchestration**
   - Coordinate specialist agents:
     - Architect: System design
     - Developer: Implementation
     - QA: Testing setup
     - DevOps: CI/CD configuration

## EXAMPLE USAGE

```
/baco create-app web my-todo-app
```

This will:
1. Analyze requirements for a todo app
2. Create React project structure
3. Generate components (TodoList, TodoItem, AddTodo)
4. Set up state management
5. Configure routing
6. Add styling (Tailwind CSS)
7. Set up testing (Jest + React Testing Library)
8. Create README with setup instructions

## INSTRUCTIONS

1. Parse the subcommand and arguments
2. For 'create-app':
   - Validate app type and name
   - Start comprehensive workflow
   - Use TodoWrite to track all tasks
   - Coordinate multiple agents
   - Generate all necessary files
   - Provide clear next steps

3. Show progress throughout the process
4. End with running instructions and next steps