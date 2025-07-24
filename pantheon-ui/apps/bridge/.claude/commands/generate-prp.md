# /generate-prp Command

## ACTIVATION
When the user types /generate-prp <project-description>, create a comprehensive Product Requirements Prompt.

## OUTPUT FORMAT
```markdown
# Product Requirements Prompt: [Project Name]

## 🎯 PROJECT GOALS
[Clear, measurable objectives]

## 📋 CONTEXT
- **Type**: [Web App/API/Mobile/Full-stack]
- **Target Users**: [Who will use this]
- **Problem Solved**: [What problem does this solve]
- **Success Metrics**: [How we measure success]

## 🔧 TECHNICAL REQUIREMENTS

### Core Features
1. [Feature 1 with acceptance criteria]
2. [Feature 2 with acceptance criteria]
3. [Feature 3 with acceptance criteria]

### Tech Stack
- **Frontend**: [Technologies]
- **Backend**: [Technologies]
- **Database**: [Type and why]
- **Infrastructure**: [Hosting/deployment]

### Non-Functional Requirements
- Performance: [Targets]
- Security: [Requirements]
- Scalability: [Expectations]
- Accessibility: [Standards]

## 🏗️ ARCHITECTURE

### System Design
[High-level architecture diagram description]

### Data Model
[Key entities and relationships]

### API Design
[Main endpoints and functionality]

## 📊 DEVELOPMENT PHASES

### Phase 1: MVP (Week 1-2)
- [ ] Core feature implementation
- [ ] Basic UI/UX
- [ ] Essential APIs

### Phase 2: Enhancement (Week 3-4)
- [ ] Additional features
- [ ] Performance optimization
- [ ] Testing suite

### Phase 3: Production (Week 5-6)
- [ ] Security hardening
- [ ] Deployment setup
- [ ] Documentation

## ✅ ACCEPTANCE CRITERIA
[How we know the project is complete]

## 🚀 NEXT STEPS
1. Review and approve this PRD
2. Run `/execute-prp [this-file]` to start development
3. Monitor progress with `/status`
```

## INSTRUCTIONS
1. Analyze the project description
2. Identify key requirements and constraints
3. Generate comprehensive PRD following template
4. Include specific, actionable items
5. Ensure all sections are detailed
6. End with clear next steps

## EXAMPLE
Input: `/generate-prp todo app with user authentication`

Output: Complete PRD for a todo application with:
- User registration/login
- CRUD operations for todos
- User-specific todo lists
- Secure authentication
- Modern tech stack
- Deployment plan