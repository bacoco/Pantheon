# /baco - Simplified BACO Workflow Command

The primary command for the simplified BACO workflow using `baco.md` files.

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

**Step 6: Review & Generate**
```
Great! Based on our conversation, here's what I understand:

📋 Project Type: [summarize]
🎯 Main Purpose: [summarize]
👥 Target Users: [summarize]
📏 Scale: [summarize]
⚡ Key Features: [list with priorities]
🛠️ Tech Stack: [summarize]
⚠️ Constraints: [summarize]

Shall I generate your customized baco.md file? (yes/no/refine)
```

If "refine", ask what needs adjustment.
If "yes", generate customized baco.md with all gathered information in the project directory:
- Save as `{project-name}/baco.md`
- Show: "✅ Created {project-name}/baco.md"

#### Template Mode (--template flag):
If user specifically requests template mode with `/baco init --template`:

```yaml
---
version: 1.0
project_type: "Web Application"  # e.g., FastAPI Service, React App, CLI Tool
author: "Your Name"
created_at: "[current date]"
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
3. **Analyze available templates**:
   - Scan `.claude/templates/` for applicable patterns
   - Match templates to features based on:
     - Framework compatibility
     - Feature requirements
     - Technology stack
   - Identify template combinations needed
   - Note any features requiring custom implementation
4. Generate a comprehensive development plan including:
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
   Template: [matching template name or "Custom implementation"]
   Relevant Examples: [matching examples]
   Steps:
      1. [Specific implementation step]
      2. [Another step]

📅 Implementation Phases:

Phase 1: Foundation
Features: [features with no dependencies]
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

   Your choice (1-4):
   ```

   Based on user choice:
   - **Choice 1**: Seamlessly transition to `/execute-prp` functionality
     - Show implementation phases from the PRP
     - Ask for confirmation to proceed
     - **CRITICAL: Actually implement the code**:
       1. Read the full PRP content
       2. Use TodoWrite to create tasks for each phase
       3. For each task:
          - Create actual files using Write tool
          - Run commands using Bash tool (npm install, etc.)
          - Show real progress: "✅ Created src/app/page.tsx"
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
   - **Check for applicable templates**:
     ```
     For each feature in PRP:
       1. Search .claude/templates/ for matching patterns
       2. Select templates based on:
          - Framework match (Next.js, Express, etc.)
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
     # If matching template found:
     1. Load template content
     2. Customize for project
     3. Write("{project-name}/path/to/file", customized_template_content)
     4. Generate corresponding test file:
        - Analyze component/function structure
        - Select appropriate test template
        - Generate test cases
        - Write("{project-name}/path/to/__tests__/file.test.tsx", test_content)
     
     # If no template:
     1. Write("{project-name}/src/components/PromptInput.tsx", <component code from PRP>)
     2. Generate test based on code analysis
     3. Write("{project-name}/src/components/__tests__/PromptInput.test.tsx", test_content)
     ```
   - For dependency installation:
     ```
     # Collect dependencies from used templates
     # Merge with PRP dependencies
     Bash("cd {project-name} && npm install [all-dependencies]")
     ```
   - Show real-time progress after each action

4. **Example Implementation Sequence with Test Generation**:
   ```
   Task: Initialize project
   Running: npx create-next-app...
   ✅ Project created successfully
   
   Task: Create PromptInput component
   Writing: src/components/PromptInput.tsx
   ✅ Component created (45 lines)
   
   Generating tests...
   Writing: src/components/__tests__/PromptInput.test.tsx
   ✅ Test file created (62 lines)
   ✅ Added 6 test cases:
      - renders input field correctly
      - handles text input changes
      - validates character limit
      - calls onSubmit with input value
      - disables submit when empty
      - has no accessibility violations
   
   Task: Set up API routes
   Writing: src/app/api/enhance-prompt/route.ts
   ✅ API route created (120 lines)
   
   Generating tests...
   Writing: src/app/api/__tests__/enhance-prompt.test.ts
   ✅ Test file created (85 lines)
   ✅ Added 5 test cases:
      - returns 200 for valid prompt
      - returns enhanced prompts array
      - handles empty prompt with 400
      - validates prompt length
      - handles API errors gracefully
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

## INTEGRATION WITH OTHER BACO COMMANDS

When a baco.md file has been processed:
- `/analyze` should consider all features and constraints from baco.md
- `/orchestrate` should use the recommended team composition
- `/generate-prp` should incorporate all baco.md content
- Store the parsed information in "memory" for the session

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