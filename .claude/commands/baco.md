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

### `/baco` (no subcommand)
Show available subcommands and check for baco.md file:
- If baco.md exists: "📄 Found baco.md file. Run `/baco plan` to generate a development plan."
- If no baco.md: "No baco.md file found. Run `/baco init` to create one."

### `/baco init`
Create a template baco.md file by outputting the following content:

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
3. Generate a comprehensive development plan including:
   - Detected coding conventions (based on described examples)
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

👥 Recommended Team:
   • Winston (Architect): System design and architecture
     Reason: Required for all projects
   • [Other agents based on requirements]

🚀 Features Implementation Plan:

1. [Feature Name] [PRIORITY]
   Dependencies: [if any]
   Relevant Examples: [matching examples]
   Steps:
      1. [Specific implementation step]
      2. [Another step]

📅 Implementation Phases:

Phase 1: Foundation
Features: [features with no dependencies]
Duration: [estimate]

[Additional phases...]

💡 Next Steps:
   1. Review and adjust the plan if needed
   2. Run '/baco execute' to start implementation
   3. Or use '/generate-prp' to create a detailed PRP
```

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

4. Save the generated PRP with timestamp (tell user to save it as `baco-prp-[timestamp].md`)

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