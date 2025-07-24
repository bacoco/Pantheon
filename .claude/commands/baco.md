# /baco - Simplified Pantheon Workflow Command

The primary command for the simplified Pantheon workflow using `baco.md` files.

## ACTIVATION
When the user runs `/baco` or any `/baco [subcommand]`, activate this simplified workflow.

## HOW TO HANDLE THE COMMAND

This is a prompt-based system. When invoked, you should:
1. Check which subcommand was used
2. Follow the appropriate instructions below
3. Use your understanding to parse files and generate responses
4. Maintain the illusion of a working system while being transparent that this runs in Claude

## COMMAND HANDLERS

> **Note**: All command handlers should follow the interactive flow patterns defined in `.claude/lib/interactive-flow.md` for consistent user experience.

### `/baco` (no subcommand)
Show available subcommands and check for baco.md file:
- If baco.md exists: "📄 Found baco.md file. Run `/baco plan` to generate a development plan."
- If no baco.md: "No baco.md file found. Run `/baco init` to create one."

### `/baco init`
Start an interactive project definition session. When invoked:

1. **Check for --template flag**: If user types `/baco init --template`, provide the basic template (see below)
2. **Otherwise, start interactive session**:

#### Interactive Session Flow:

**Step 1: Welcome & Project Setup**
```
🎯 Welcome to BACO Interactive Project Setup!

I'll help you create a comprehensive project definition through conversation.
This will help me understand your needs and generate a customized baco.md file.

First, let's set up your project:

📁 What would you like to name your project?
   (This will create a directory with this name)
   
Project name:
```

After user provides project name:
- Validate name (alphanumeric, hyphens, underscores only)
- Check if directory already exists
- If exists: "Directory 'project-name' already exists. Use it anyway? (y/n)"
- Create directory: `mkdir -p project-name`
- Show: "✅ Created project directory: ./project-name/"
- **Framework Detection**: Check for existing package.json or config files
  - If framework detected: "🔍 Detected: [Framework]. Use this configuration? (y/n)"
  - If no framework: Continue to Step 2

**Step 2: Project Discovery**
Ask these questions in sequence, adapting based on responses:

```
1️⃣ What type of application are you building?
   (e.g., Web App, REST API, CLI Tool, Mobile Backend, Desktop App, etc.)

[Wait for response, then ask follow-up based on type]

2️⃣ What's the main purpose or problem it solves?
   
3️⃣ Who are your target users?
   (e.g., developers, businesses, consumers, internal team)

4️⃣ What's the expected scale?
   (e.g., prototype, small team use, enterprise, global service)

5️⃣ Do you have a timeline or deadline?
```

**Step 3: Feature Exploration**
```
Now let's explore your features. I'll help you organize them by priority.

What are the core features your application must have?
(List them one by one, and I'll help structure them)
```

For each feature mentioned:
- Ask for more details if vague
- Identify dependencies between features
- Suggest related features based on project type
- Classify priority (HIGH/MEDIUM/LOW)

**Step 4: Technical Deep Dive**
```
Let's talk about technical requirements...

🛠️ What technologies/frameworks are you planning to use?
   (or would you like suggestions based on your requirements?)

📚 Do you have any documentation or examples to share?
   (URLs, file paths, or paste code examples)

🔧 Any specific technical constraints?
   (database, performance, security, compliance)
```

When user provides documentation/examples:
- Check documentation cache first for instant insights
- If framework detected, load knowledge base immediately
- Use WebFetch to analyze new documentation (if not cached)
- Extract patterns from code examples
- Build domain expertise
- Note conventions and best practices
- Cache results for future use

**Step 5: Constraints & Considerations**
```
Almost done! Let's capture any constraints or special considerations...

- Performance requirements?
- Security/compliance needs?
- Integration requirements?
- Budget or resource limitations?
- Other important factors?
```

**Step 6: Development Workflow Preferences**
```
Let's set up your development workflow preferences...

📝 Version Control & Testing Options:
☑ Initialize Git repository automatically
☑ Commit after each development phase
☑ Run tests before commits
☑ Generate test files for components
☐ Create feature branch instead of using main
☑ Create GitHub repository immediately
☑ Push after each phase completion
☑ Push to GitHub after completion
☑ Generate README.md file

🐳 Docker & Deployment Options:
☑ Generate Dockerfile for deployment
☑ Create docker-compose.yml for production
☑ Create docker-compose.dev.yml for development
☐ Generate Kubernetes manifests
☐ Include CI/CD workflows (GitHub Actions)

Would you like to change any of these? (y/N): 

If yes, which numbers to toggle? (1-14):
```

Based on response, update preferences and add to baco.md configuration.

**Step 7: Review & Generate**
```
Great! Based on our conversation, here's what I understand:

📋 Project Type: [summarize]
🎯 Main Purpose: [summarize]
👥 Target Users: [summarize]
📏 Scale: [summarize]
⚡ Key Features: [list with priorities]
🛠️ Tech Stack: [summarize]
⚠️ Constraints: [summarize]
🔧 Workflow: Git enabled, auto-commit, test-driven, Docker ready

Shall I generate your customized baco.md file? (yes/no/refine)
```

If "refine", ask what needs adjustment.
If "yes", generate customized baco.md with all gathered information in the project directory:
- Include workflow settings based on user preferences:
  ```yaml
  workflow:
    git_enabled: [based on option 1]
    auto_commit: [based on option 2]
    test_before_commit: [based on option 3]
    generate_tests: [based on option 4]
    feature_branch: [based on option 5]
    create_github_immediately: [based on option 6]
    continuous_push: [based on option 7]
    auto_push_github: [based on option 8]
    generate_readme: [based on option 9]
    docker_enabled: [based on option 10]
    docker_compose: [based on option 11]
    docker_dev_config: [based on option 12]
    kubernetes_manifests: [based on option 13]
    cicd_workflows: [based on option 14]
  ```
- Save as `{project-name}/baco.md`
- Show: "✅ Created {project-name}/baco.md"

#### GitHub Repository Creation (if enabled):
If `create_github_immediately` is true in workflow preferences:
1. **Initialize Git**:
   ```
   cd {project-name}
   git init --initial-branch=main
   # Generate basic README if enabled (full README generated during implementation)
   if generate_readme is true:
     echo "# {project-name}" > README.md
     echo "" >> README.md
     echo "Project initialized by BACO. Full README will be generated during implementation." >> README.md
   git add .
   git commit -m "Initial commit: Project setup by BACO"
   ```

2. **Create GitHub Repository**:
   ```
   🔗 Creating GitHub repository...
   
   Checking authentication...
   gh auth status
   
   Creating repository...
   gh repo create {project-name} --private --source=. --remote=origin
   
   ✅ GitHub repository created: https://github.com/{username}/{project-name}
   ```

3. **First Push**:
   ```
   git push -u origin main
   ✅ Initial commit pushed to GitHub
   ```

#### Template Mode (--template flag):
If user specifically requests template mode with `/baco init --template`:

```yaml
---
version: 1.0
project_type: "Web Application"  # e.g., FastAPI Service, React App, CLI Tool
author: "Your Name"
created_at: "[current date]"
workflow:
  git_enabled: true
  auto_commit: true
  test_before_commit: true
  generate_tests: true
  commit_style: detailed
  feature_branch: false
  create_github_immediately: true
  continuous_push: true
  auto_push_github: true
  generate_readme: true
  docker_enabled: true
  docker_compose: true
  docker_dev_config: true
---

## FEATURE: Primary Feature Name

Describe your main feature here. Be specific about what it should do,
who will use it, and what problem it solves.

## FEATURE: Secondary Feature Name

[LOW PRIORITY] Another feature description. You can mark features as
[HIGH PRIORITY] or [LOW PRIORITY] to indicate importance.

Dependencies: Primary Feature Name

## EXAMPLES:

- `./examples/similar_code.py`: Description of what this example shows
- `./examples/patterns.js`: Another relevant example

## DOCUMENTATION:

- `https://relevant-framework.com/docs`: Main framework documentation
- `https://library-docs.com/`: Library documentation

## CONSTRAINTS:

- Must use PostgreSQL for the database
- API responses must follow REST conventions
- All endpoints must be authenticated
- Response time must be under 200ms

## OTHER CONSIDERATIONS:

Any additional notes, gotchas, or important context that doesn't
fit in the other sections.
```

Tell the user: "✅ Created baco.md template. Copy this to a file named `baco.md` and edit it with your project requirements."

#### Smart Feature Suggestions:
Based on project type, proactively suggest common features:
- **E-commerce**: payment processing, shopping cart, inventory, user accounts
- **SaaS**: multi-tenancy, billing, analytics, team management
- **Chat/Social**: real-time messaging, presence, notifications, media sharing
- **API Service**: authentication, rate limiting, documentation, monitoring
- **Enterprise**: SSO, audit logs, compliance, role-based access

#### Knowledge Base Integration:
When user mentions specific technologies:
- **Instant Loading**: "I see you're using React. Loading React best practices..."
- **Framework Insights**: Show common patterns, project structure, ecosystem
- **Stack Suggestions**: Recommend complementary technologies
- **Common Pitfalls**: Warn about framework-specific gotchas
- **No Wait Time**: Knowledge base provides immediate value

Example:
```
User: "I'm building with FastAPI"
BACO: "Great choice! FastAPI is excellent for modern Python APIs. From my knowledge base:
       • Project structure: app/ with api/, models/, schemas/ subdirectories
       • Common libraries: SQLAlchemy, Pydantic, python-jose for auth
       • Best practices: Use async handlers, dependency injection, type hints
       • Testing: pytest with httpx for async tests
       
       Would you like me to analyze the latest FastAPI docs for updates?"
```

#### Pattern Detection from Examples:
When analyzing provided code:
- Naming conventions (camelCase, snake_case, etc.)
- File organization patterns
- Testing approaches
- Error handling patterns
- Documentation style
- Framework-specific patterns

#### Documentation Analysis:
When user provides documentation URLs:
- Extract key concepts and terminology
- Identify required vs optional features
- Note performance/security guidelines
- Capture best practices
- Reference in generated baco.md

### Interactive Init Memory:
Throughout the conversation:
- Track all discovered information in structured format
- Allow user to correct/refine any aspect
- Build comprehensive context
- Use for intelligent suggestions
- Summarize before final generation

### `/baco validate`
When invoked:
1. Ask the user to share their baco.md file content
2. Check for:
   - Valid YAML frontmatter between --- markers
   - At least one ## FEATURE: section
   - Proper markdown structure
   - Feature dependencies that reference existing features
3. Provide specific feedback on any issues found
4. If valid, show a summary of features, examples, constraints

### `/baco plan`
When invoked:
1. Ask the user to share their baco.md file content (if not already shared)
2. Parse the content to understand:
   - Project type and metadata
   - All features with their priorities and dependencies
   - Examples provided
   - Constraints and considerations
3. **Extract models and entities**:
   - Parse feature descriptions for entities and fields
   - Detect relationships between models
   - Identify validation rules and constraints
   - Generate model specifications
4. **Analyze available templates**:
   - Scan `.claude/templates/` for applicable patterns
   - Match templates to features based on:
     - Framework compatibility
     - Feature requirements
     - Technology stack
   - Identify template combinations needed
   - Note any features requiring custom implementation
5. Generate a comprehensive development plan including:
   - **Detected models and their relationships**
   - Detected coding conventions (based on described examples)
   - **Template utilization strategy**
   - Recommended team composition based on requirements
   - Implementation phases respecting dependencies
   - Specific steps for each feature

Display the plan in this format:
```
🎯 BACO DEVELOPMENT PLAN
========================

📋 Project Type: [type]
👤 Author: [author]
🔢 Total Features: [count]
📊 Complexity: [Simple/Moderate/Complex]

🗂️ Detected Models:
   • User
     - Fields: email, password, name
     - Relations: has many Tasks
   • Task
     - Fields: title, description, status, priority, dueDate
     - Relations: belongs to User (assignee)
   • [Other models...]

📐 Detected Patterns:
   • [Inferred patterns from examples]

🧩 Available Templates:
   • Authentication: jwt-auth-express (matches User Login feature)
   • CRUD Operations: rest-api-crud (matches Product Management)
   • Form Handling: dynamic-form-app-router (matches Contact Form)
   • [Other matching templates...]

👥 Recommended Team:
   • Winston (Architect): System design and architecture
     Reason: Required for all projects
   • [Other agents based on requirements]

🚀 Features Implementation Plan:

1. [Feature Name] [PRIORITY]
   Dependencies: [if any]
   Models: [User, Task]
   Template: [matching template name or "Custom implementation"]
   Relevant Examples: [matching examples]
   Steps:
      1. [Specific implementation step]
      2. [Another step]

📅 Implementation Phases:

Phase 1: Foundation
Features: [features with no dependencies]
Models Generated: [User, Task]
Templates Used: [list of templates]
Duration: [estimate]

[Additional phases...]

💡 Next Steps:
   1. Review and adjust the plan if needed
   2. Run '/baco execute' to start implementation
   3. Or use '/generate-prp' to create a detailed PRP
```

After displaying the plan, offer interactive continuation:
```
What would you like to do with this plan?
1. 🚀 Generate implementation blueprint (PRP)
2. 📝 Modify the plan
3. 💾 Save plan for later
4. ❌ Start over with different requirements

Your choice (1-4):
```

If user chooses option 1, seamlessly transition to `/baco execute` functionality without requiring them to type a new command.

### `/baco execute`
When invoked:
1. Ensure a baco.md file has been shared/validated
2. Generate a comprehensive Product Requirements Prompt (PRP) that includes:
   - All features as goals
   - Detected coding conventions
   - Examples to follow
   - Technical constraints
   - Phased implementation approach
   - Validation strategy
   - Team recommendations

3. Present the execution strategy:
   - Explain which agents would be involved
   - How the implementation would proceed
   - What validation would occur

4. Save the generated PRP with timestamp in project directory:
   - Save as `{project-name}/baco-prp-[timestamp].md`
   - Track project location in session state

5. **Interactive Continuation** (NEW):
   After PRP generation, present options:
   ```
   ✅ PRP Generated: baco-prp-[timestamp].md

   I've created a comprehensive implementation blueprint for your [project type].

   What would you like to do next?
   1. 🚀 Start implementing immediately
   2. 📄 Review the PRP first  
   3. ✏️ Modify the plan
   4. ⏸️ Pause for now
   
   Git options (enabled by default):
   ☑ Initialize Git repository
   ☑ Commit after each phase
   ☑ Run tests before commits
   ☐ Create feature branch
   ☐ Push to GitHub after completion
   
   Disable any? (type numbers like "1,3" or press Enter to keep all)
   
   Your choice (1-4):
   ```

   Based on user choice:
   - **Choice 1**: Seamlessly transition to `/execute-prp` functionality
     - Parse disabled options from input (e.g., "1,3" disables options 1 and 3)
     - Show implementation phases from the PRP
     - Ask for confirmation to proceed
     - **Git Setup** (automatic by default):
       1. Initialize git repository: `git init --initial-branch=main`
       2. Create .gitignore based on project type (see `.claude/lib/test-detection.md`)
       3. Initial commit: "Initial project setup by BACO"
       4. Create feature branch if enabled: `git checkout -b feature/[project-name]`
     - **CRITICAL: Actually implement the code**:
       1. Read the full PRP content
       2. Use TodoWrite to create tasks for each phase
       3. For each task:
          - Create actual files using Write tool
          - Run commands using Bash tool (npm install, etc.)
          - Show real progress: "✅ Created src/app/page.tsx"
          - **Phase completion flow** (automatic by default):
            a. Run tests (if test command detected and test_before_commit is true):
               ```
               🧪 Running tests...
               
               # Test detection process (from test-detection.md):
               1. Check package.json for "test" script
               2. Detect package manager from lock files:
                  - yarn.lock → yarn test
                  - pnpm-lock.yaml → pnpm test
                  - bun.lockb → bun test
                  - default → npm test
               3. For Python: pytest if in requirements.txt
               4. For Rust: cargo test
               5. For Go: go test ./...
               
               [Run detected command and show output]
               ```
            b. Handle test results:
               - Tests pass → Continue to commit
               - Tests fail → Ask: "Tests failed. Options: 1) Fix now 2) Commit as WIP 3) Skip commit"
               - No tests → Note and continue
            c. Auto-commit (if not disabled):
               ```
               git add -A
               git commit -m "feat: complete [phase-name] (Phase X/Y)
               
               - [List main changes]
               - Tests: [status]
               
               Generated by BACO"
               ```
            d. Continuous push (if enabled):
               ```
               if continuous_push is true:
                 git push origin main
                 ✅ Phase X pushed to GitHub
               ```
       4. Track all created files in session state
       5. Run validation commands if specified in PRP
     - After each major milestone, ask "Continue? (y/n)"
     - Example implementation flow:
       ```
       Creating Next.js project structure...
       [Use Bash: npx create-next-app@latest ...]
       ✅ Project initialized
       
       Installing dependencies...
       [Use Bash: npm install replicate ...]
       ✅ Dependencies installed
       
       Creating components...
       [Use Write: Create actual component files]
       ✅ Created src/components/PromptInput.tsx
       ✅ Created src/components/ImageGrid.tsx
       ```
   - **Choice 2**: Display key sections of the PRP for review
   - **Choice 3**: Ask what modifications are needed
   - **Choice 4**: Save state and provide resume instructions

6. **Continuous Implementation Flow**:
   When user chooses to implement:
   ```
   📋 Implementation Plan:
   - Phase 1: [Description] (Duration)
   - Phase 2: [Description] (Duration)
   [etc...]

   Starting with Phase 1...
   ```
   
   Then proceed with implementation, providing updates:
   - "✅ Created project structure. Setting up [next item]..."
   - "✅ Phase 1 complete! Ready for Phase 2? (y/n)"
   - Handle errors gracefully with options to fix and retry

7. **Session State Management**:
   - Track current phase/step in memory
   - Allow resuming if interrupted
   - Provide progress indicators throughout

### PRP EXECUTION DETAILS

When implementing (Choice 1), follow this exact process:

1. **Parse PRP Structure**:
   - Extract phases from "Implementation Phases" section
   - Identify code blocks marked with ```typescript, ```jsx, etc.
   - Find file paths mentioned (e.g., "src/components/PromptInput.tsx")
   - Extract dependencies and commands to run

2. **Create Implementation Tasks**:
   ```
   TodoWrite([
     { id: "setup_project", content: "Initialize Next.js project", status: "pending", priority: "high" },
     { id: "install_deps", content: "Install dependencies", status: "pending", priority: "high" },
     { id: "create_layout", content: "Create app layout", status: "pending", priority: "high" },
     // ... more tasks based on PRP phases
   ])
   ```

3. **Execute Each Task with Template Integration**:
   - All commands run in project directory:
   - **Framework Detection and Setup**:
     ```
     1. Detect framework from package.json or baco.md
     2. If no framework detected, infer from project type
     3. Scaffold project structure based on framework:
        - Create directories (src, tests, etc.)
        - Generate tsconfig.json if TypeScript
        - Create .env.example with required variables
        - Set up .gitignore for framework
        - Generate README.md (if generate_readme is true):
          ```javascript
          // Parse baco.md to extract project details
          const bacoContent = Read("{project-name}/baco.md");
          const projectType = extractFromYAML(bacoContent, "project_type");
          const author = extractFromYAML(bacoContent, "author");
          const features = extractFeatures(bacoContent); // Parse FEATURE sections
          const techStack = extractTechStack(bacoContent); // From DOCUMENTATION and features
          const constraints = extractConstraints(bacoContent);
          
          // Generate comprehensive README
          const readmeContent = `# {project-name}

${extractProjectDescription(features)}

## 🚀 Overview

This ${projectType} was generated by BACO (Basic Adaptive Context Orchestrator) with comprehensive development automation.

## 🛠️ Tech Stack

${techStack.map(tech => `- **${tech.name}**: ${tech.purpose}`).join('\n')}

## ✨ Features

${features.filter(f => f.priority === 'HIGH').map(f => `- ✅ **${f.name}**: ${f.description}`).join('\n')}
${features.filter(f => f.priority === 'MEDIUM').map(f => `- 🔧 **${f.name}**: ${f.description}`).join('\n')}
${features.filter(f => f.priority === 'LOW').map(f => `- 📋 **${f.name}**: ${f.description}`).join('\n')}

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ (for Next.js projects)
- npm/yarn/pnpm package manager
${constraints.includes('PostgreSQL') ? '- PostgreSQL database' : ''}
${constraints.includes('Redis') ? '- Redis server' : ''}

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/${detectGitHubUsername()}/{project-name}.git
cd {project-name}

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev
\`\`\`

### Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm test            # Run test suite
npm run lint        # Run linting
npm run typecheck   # Run TypeScript checks
\`\`\`

## 📁 Project Structure

\`\`\`
{project-name}/
├── src/              # Source code
│   ├── app/         # Next.js app directory
│   ├── components/  # React components
│   ├── lib/         # Utility functions
│   └── types/       # TypeScript types
├── public/          # Static assets
├── tests/           # Test files
├── .env.example     # Environment variables template
├── package.json     # Dependencies and scripts
└── README.md        # This file
\`\`\`

## 🧪 Testing

This project includes comprehensive test coverage:

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
\`\`\`

## 🔧 Configuration

Key configuration files:

- \`.env\` - Environment variables
- \`next.config.js\` - Next.js configuration
- \`tailwind.config.ts\` - Tailwind CSS configuration
- \`tsconfig.json\` - TypeScript configuration

## 📝 Development Workflow

This project was set up with BACO's automated workflow:

- ✅ Automatic Git commits after each development phase
- ✅ Continuous GitHub integration
- ✅ Test files generated for all components
- ✅ Dependency management and conflict resolution
- ✅ Pre-commit test execution

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Author

${author}

---

*Generated with ❤️ by [BACO](https://github.com/bacoco/BACO) on ${new Date().toLocaleDateString()}*`;
          
          Write("{project-name}/README.md", readmeContent);
          ✅ Generated comprehensive README.md
          ```
     ```
   - **Check for applicable templates**:
     ```
     For each feature in PRP:
       1. Search .claude/templates/ for matching patterns
       2. Select templates based on:
          - Detected framework (Next.js, Express, etc.)
          - Feature tags (auth, crud, api, etc.)
          - Dependencies available
       3. Customize template variables:
          - {{projectName}} → actual project name
          - {{modelName}} → entity names from PRP
          - Adapt to detected conventions
       4. ALWAYS include error handling:
          - For Express APIs: Use global-error-handler template
          - For React apps: Include react-error-boundary template
          - For forms: Apply validation-error-handling patterns
          - For async operations: Use async-error-patterns
     ```
   - For project setup:
     ```
     Bash("cd {project-name} && npx create-next-app@latest . --typescript --tailwind --app")
     ```
   - For file creation with templates and tests:
     ```
     # Generate models first:
     1. For each detected entity:
        - Generate TypeScript interface
        - Generate database schema (Mongoose/Prisma)
        - Write model files to project
     
     # If matching template found:
     1. Load template content
     2. Customize for project and specific models:
        - Replace generic "Item" with actual model names
        - Inject model-specific fields and validations
        - Add relationship handling
     3. Write("{project-name}/path/to/file", customized_template_content)
     4. Generate corresponding test file (if generate_tests is true):
        - Analyze component/function structure
        - Select appropriate test template
        - Generate test cases
        - Write("{project-name}/path/to/__tests__/file.test.tsx", test_content)
     
     # If no template:
     1. Write("{project-name}/src/components/PromptInput.tsx", <component code from PRP>)
     2. Generate test based on code analysis (if generate_tests is true):
        - For React components: Use React Testing Library template
        - For API endpoints: Use Supertest/Jest template
        - For utility functions: Use Jest unit test template
     3. Write("{project-name}/src/components/__tests__/PromptInput.test.tsx", test_content)
     ```
   
   ### Test Generation Templates:
   
   **React Component Test Template**:
   ```typescript
   import { render, screen, fireEvent, waitFor } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { {ComponentName} } from '../{ComponentName}';
   
   describe('{ComponentName}', () => {
     const defaultProps = {
       // Add default props based on component analysis
     };
   
     beforeEach(() => {
       // Setup before each test
     });
   
     it('renders without crashing', () => {
       render(<{ComponentName} {...defaultProps} />);
       expect(screen.getByRole('{mainRole}')).toBeInTheDocument();
     });
   
     it('handles user interaction correctly', async () => {
       const user = userEvent.setup();
       const mockHandler = jest.fn();
       
       render(<{ComponentName} {...defaultProps} onAction={mockHandler} />);
       
       await user.click(screen.getByRole('button'));
       expect(mockHandler).toHaveBeenCalledTimes(1);
     });
   
     // Generate specific tests based on component props and state
     {generateComponentSpecificTests(component)}
   });
   ```
   
   **API Endpoint Test Template**:
   ```typescript
   import request from 'supertest';
   import { app } from '../app';
   import { {ModelName} } from '../models/{ModelName}';
   
   describe('{EndpointPath}', () => {
     beforeEach(async () => {
       // Clear test database
       await {ModelName}.deleteMany({});
     });
   
     describe('GET {EndpointPath}', () => {
       it('returns all items', async () => {
         const testData = [
           { /* test item 1 */ },
           { /* test item 2 */ }
         ];
         await {ModelName}.insertMany(testData);
   
         const response = await request(app)
           .get('{EndpointPath}')
           .expect(200);
   
         expect(response.body).toHaveLength(2);
         expect(response.body[0]).toMatchObject(testData[0]);
       });
   
       it('handles errors gracefully', async () => {
         // Simulate error condition
         jest.spyOn({ModelName}, 'find').mockRejectedValue(new Error('DB Error'));
   
         const response = await request(app)
           .get('{EndpointPath}')
           .expect(500);
   
         expect(response.body.error).toBeDefined();
       });
     });
   
     // Generate CRUD operation tests based on endpoint analysis
     {generateEndpointSpecificTests(endpoint)}
   });
   ```
   
   **Utility Function Test Template**:
   ```typescript
   import { {functionName} } from '../{functionName}';
   
   describe('{functionName}', () => {
     it('handles valid input correctly', () => {
       const input = {/* valid test input */};
       const expected = {/* expected output */};
       
       const result = {functionName}(input);
       expect(result).toEqual(expected);
     });
   
     it('handles edge cases', () => {
       expect({functionName}(null)).toBeNull();
       expect({functionName}(undefined)).toBeUndefined();
       expect({functionName}([])).toEqual([]);
     });
   
     it('throws error for invalid input', () => {
       const invalidInput = {/* invalid test input */};
       
       expect(() => {functionName}(invalidInput)).toThrow();
     });
   
     // Generate specific tests based on function logic
     {generateFunctionSpecificTests(functionLogic)}
   });
   ```
   - For dependency installation:
     ```
     # Dependency management process:
     1. Collect dependencies from all used templates
     2. Parse imports from generated code files
     3. Detect any additional packages needed
     4. Check existing package.json for conflicts
     5. Resolve version conflicts automatically
     6. Generate or update package.json
     7. Run appropriate package manager:
        - Detect npm/yarn/pnpm/bun from lock files
        - Install missing dependencies
        - Show progress: "📦 Installing 12 dependencies..."
     8. Handle failures gracefully:
        - If auto-install fails, provide manual commands
        - Log which packages failed
     ```
   - Show real-time progress after each action

4. **Example Implementation Sequence with Test Generation**:
   ```
   Task: Initialize project
   Running: npx create-next-app...
   ✅ Project created successfully
   
   Task: Generate models
   Creating: src/types/task.ts
   ✅ Task interface created
   Creating: src/models/Task.ts
   ✅ Mongoose schema created
   
   Task: Create task controller
   Using template: rest-api-crud
   Customizing for Task model...
   Writing: src/controllers/taskController.ts
   ✅ Controller created (245 lines)
   
   Generating tests...
   Writing: src/controllers/__tests__/taskController.test.ts
   ✅ Test file created (185 lines)
   ✅ Added 12 test cases for CRUD operations
   
   Task: Install dependencies
   📦 Detected package manager: npm
   📦 Analyzing imports and templates...
   📦 Found 18 dependencies to install:
      - express@^4.18.2
      - mongoose@^7.6.0
      - jsonwebtoken@^9.0.0
      - bcryptjs@^2.4.3
      - express-validator@^7.0.0
      - cors@^2.8.5
      - helmet@^7.1.0
      - winston@^3.11.0
      - dotenv@^16.3.1
      + 9 dev dependencies
   
   Running: npm install express mongoose jsonwebtoken...
   ✅ Dependencies installed successfully
   
   Running: npm install -D @types/express jest supertest...
   ✅ Dev dependencies installed successfully
   
   📦 Updated package.json with all dependencies
   ```

5. **Validation After Each Phase**:
   - Run build commands in project directory: `cd {project-name} && npm run build`
   - Run type checking: `cd {project-name} && npm run typecheck`
   - **Run generated tests**: `cd {project-name} && npm test`
   - Show test results and coverage:
     ```
     Test Suites: 4 passed, 4 total
     Tests:       22 passed, 22 total
     Coverage:    85% statements, 78% branches
     ```
   - Show any errors and offer to fix them
   - Only proceed to next phase after validation passes

6. **Git Completion and GitHub Integration**:
   - After all phases complete successfully:
     ```
     🎉 Project implementation complete!
     
     Git Summary:
     - Repository initialized: ✅
     - Commits created: 12
     - Tests status: ✅ All passing
     - Current branch: main
     
     Would you like to create a GitHub repository?
     1. Yes, create new repository (recommended)
     2. Yes, connect to existing repository
     3. No, keep local only
     
     Choice (1-3):
     ```
   
   - If user chooses option 1 (create new repository):
     ```
     Creating GitHub repository...
     [Runs /gh create flow automatically]
     
     Checking GitHub authentication...
     ✅ Authenticated as: [username]
     
     Repository name: [project-name]
     Visibility: private
     
     Creating repository...
     ✅ Created: https://github.com/[username]/[project-name]
     
     Pushing all commits...
     ✅ Pushed 12 commits to main branch
     
     🎉 Your project is now live on GitHub!
     
     View online: https://github.com/[username]/[project-name]
     Clone anywhere: git clone https://github.com/[username]/[project-name]
     ```
   
   - If user chooses option 2 (existing repository):
     ```
     Enter repository URL: 
     [User provides URL]
     
     Adding remote...
     git remote add origin [URL]
     
     Pushing commits...
     git push -u origin main
     
     ✅ Pushed to existing repository
     ```

7. **Docker Generation** (if docker_enabled in workflow):
   ```
   # Check if docker_enabled is true in baco.md workflow
   if (workflow.docker_enabled) {
     🐳 Generating Docker configuration...
     
     # Detect project framework
     const framework = detectFramework();
     
     # Generate Dockerfile
     [Run /docker generate --optimize automatically]
     ✅ Created optimized Dockerfile
     
     # Generate docker-compose if requested
     if (workflow.docker_compose) {
       [Run /docker compose --prod automatically]
       ✅ Created docker-compose.yml
     }
     
     # Generate development compose if requested
     if (workflow.docker_dev_config) {
       [Run /docker compose --dev automatically]
       ✅ Created docker-compose.dev.yml
     }
     
     # Show Docker summary
     📦 Docker files generated:
     - Dockerfile (multi-stage, optimized)
     - docker-compose.yml (production)
     - docker-compose.dev.yml (development with hot reload)
     - .dockerignore
     
     🚀 Quick Docker commands:
     # Build and run locally:
     docker build -t [project-name] .
     docker run -p 3000:3000 [project-name]
     
     # Or use docker-compose:
     docker-compose up -d
     
     # Development with hot reload:
     docker-compose -f docker-compose.dev.yml up
   }
   ```

8. **Live Preview Option** (after completion):
   ```
   🎉 All phases completed successfully!
   
   Would you like to start a live preview?
   1. Yes, open in browser
   2. Yes, with mobile preview (QR code)
   3. Yes, custom settings
   4. No, finish here
   
   Choice (1-4): 2
   
   🚀 Starting development server...
   ✅ Server running at http://localhost:3000
   
   📱 Mobile Preview:
   [QR Code displayed here]
   
   URLs for mobile devices:
   • http://192.168.1.100:3000
   • http://10.0.0.5:3000
   
   🔄 Watching for changes... Press Ctrl+C to stop
   ```

## INTEGRATION WITH OTHER BACO COMMANDS

When a baco.md file has been processed:
- `/analyze` should consider all features and constraints from baco.md
- `/orchestrate` should use the recommended team composition
- `/generate-prp` should incorporate all baco.md content
- `/workspace` commands for monorepo management (list, add, link, run)
- Store the parsed information in "memory" for the session

### Monorepo Context Awareness

When any BACO command is run:
1. Detect monorepo context using monorepo-detector library
2. Adjust paths and operations accordingly
3. Respect workspace boundaries and conventions
4. Use workspace protocols for dependencies
5. Integrate with monorepo build tools

## ERROR HANDLING

Always provide helpful, specific error messages:
- For YAML errors: Point to the specific issue and suggest fixes
- For missing sections: Explain what's required and why
- For dependency issues: List the specific problems
- For missing examples: Explain that BACO can work without them but they help

## EXAMPLE ANALYSIS

When analyzing examples in baco.md:
1. Look for patterns in the described examples:
   - Technology stack mentioned
   - Architectural patterns described
   - Coding conventions implied
2. Infer conventions like:
   - Naming patterns (camelCase, snake_case, etc.)
   - Framework preferences
   - Testing approaches
3. Use these to make the generated code more consistent

## IMPORTANT NOTES

- This is a prompt-based system running in Claude Code
- All "parsing" is done through your understanding of the content
- Maintain consistency with the user's style and preferences
- Be helpful and suggest improvements to their baco.md structure
- The goal is to make project planning and implementation more structured and successful

## PROJECT DIRECTORY STRUCTURE

When using BACO, all project files are organized in a dedicated directory:

```
./                          # Current directory (where BACO is run)
├── project-name/           # Created by /baco init
│   ├── baco.md            # Project definition
│   ├── baco-prp-*.md      # Generated PRPs with timestamps
│   ├── package.json       # Created during implementation
│   ├── src/               # Source code directory
│   │   ├── components/    # React components
│   │   ├── app/          # Next.js app directory
│   │   └── ...           # Other source files
│   └── ...               # Other project files

.claude/                    # BACO system files (not in project)
├── commands/              # Command definitions
├── agents/               # Agent personas
├── lib/                  # Shared libraries
└── memory/               # Session states and project tracking
    └── projects/         # Project-specific state files
        └── project-name-state.json
```

**Key Points**:
- Each project gets its own directory
- No .claude files are created in user projects
- Projects remain clean and standard
- BACO tracks project state separately
- Multiple projects can be managed from one BACO installation

## COMPLETE INTERACTIVE FLOW EXAMPLE

Here's how the entire BACO workflow should feel from the user's perspective:

```
User: /baco init

Claude: 🎯 Welcome to BACO Interactive Project Setup!

First, let's set up your project:

📁 What would you like to name your project?
   (This will create a directory with this name)
   
Project name: ai-image-gen

✅ Created project directory: ./ai-image-gen/

[... interactive questions ...]

Great! Based on our conversation, here's what I understand:
[... summary ...]

Shall I generate your customized baco.md file? (yes/no/refine): yes

✅ Created ai-image-gen/baco.md!

Would you like me to create a development plan now? (y/n): y

[Seamlessly transitions to planning...]

🎯 BACO DEVELOPMENT PLAN
========================
[... shows plan ...]

What would you like to do with this plan?
1. 🚀 Generate implementation blueprint (PRP)
2. 📝 Modify the plan
3. 💾 Save plan for later
4. ❌ Start over with different requirements

Your choice (1-4): 1

[Seamlessly transitions to PRP generation...]

Generating comprehensive implementation blueprint...

✅ PRP Generated: ai-image-gen/baco-prp-20250120.md

I've created a comprehensive implementation blueprint for your Mobile AI Image Generator.

What would you like to do next?
1. 🚀 Start implementing immediately
2. 📄 Review the PRP first
3. ✏️ Modify the plan
4. ⏸️ Pause for now

Your choice (1-4): 1

Great! Let's start implementing your mobile AI image generator.

📋 Implementation Plan:
- Phase 1: Foundation Setup (Days 1-2)
- Phase 2: Core Logic (Days 2-3)
- Phase 3: User Interface (Days 4-5)
- Phase 4: Testing & Polish (Days 6-7)

Starting with Phase 1: Foundation Setup...

Creating Next.js project structure in ai-image-gen/...
[Running: cd ai-image-gen && npx create-next-app@latest . --typescript --tailwind --app]
✅ Project initialized with TypeScript and Tailwind

Creating project files...
✅ Created ai-image-gen/src/app/layout.tsx
✅ Created ai-image-gen/src/app/globals.css
✅ Created ai-image-gen/src/types/index.ts

Installing dependencies...
[Running: cd ai-image-gen && npm install replicate react-zoom-pan-pinch]
✅ Dependencies installed

Phase 1 Progress: 40% complete

Now creating the prompt input component...
✅ Created ai-image-gen/src/components/PromptInput.tsx (52 lines)
✅ Created ai-image-gen/src/hooks/useWordCount.ts (18 lines)
✅ Created ai-image-gen/src/lib/constants.ts (5 lines)

Phase 1 Complete! 

Summary:
- Created 5 files
- Set up project foundation
- Mobile-optimized from the start

Ready to proceed with Phase 2: Core Logic? (y/n): y

Starting Phase 2...
[... continues with implementation ...]
```

## KEY INTERACTIVE PRINCIPLES

1. **Seamless Transitions**: Users shouldn't need to run multiple commands
2. **Continuous Context**: Each step builds on the previous conversation
3. **Progress Visibility**: Always show what's happening and what's next
4. **User Control**: Offer choices at major decision points
5. **Graceful Interruption**: Can pause and resume without losing progress
6. **Success Celebration**: Acknowledge completed milestones

The goal is to make BACO feel like an intelligent assistant guiding users through the entire development process, not a series of disconnected commands.