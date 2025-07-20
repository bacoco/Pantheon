# Testing the New BACO Workflow

This document demonstrates how to test the new baco.in-based workflow.

## Step 1: Create a baco.in file

Run the following command in Claude Code:
```
/baco init
```

This creates a template `baco.in` file that you can customize.

## Step 2: Example baco.in Content

Here's a simple example for a task management API:

```yaml
---
version: 1.0
project_type: "REST API"
author: "Test User"
---

## FEATURE: User Management

Basic user registration and authentication system with:
- User registration with email/password
- Login with JWT token generation
- User profile management

[HIGH PRIORITY]

## FEATURE: Task CRUD Operations

Allow authenticated users to manage their tasks:
- Create new tasks with title and description
- List all tasks for a user
- Update task status
- Delete tasks

Dependencies: User Management

## EXAMPLES:

- `./examples/express-auth.js`: Express.js authentication pattern
- `./examples/mongoose-crud.js`: Mongoose CRUD operations

## DOCUMENTATION:

- `https://expressjs.com/`: Express.js framework
- `https://mongoosejs.com/`: Mongoose ODM

## CONSTRAINTS:

- Use MongoDB for data storage
- JWT tokens must expire in 24 hours
- All endpoints must validate input
- Response time must be under 100ms

## OTHER CONSIDERATIONS:

This API will be consumed by a React frontend application.
Consider CORS configuration and consistent error response format.
```

## Step 3: Validate the File

```
/baco validate
```

Expected output:
- ✅ baco.in is valid!
- Summary of features, examples, documentation, and constraints

## Step 4: Generate Development Plan

```
/baco plan
```

This will:
1. Parse the baco.in file
2. Analyze feature complexity
3. Determine team composition
4. Generate implementation phases
5. Display a comprehensive development plan

## Step 5: Execute the Plan

```
/baco execute
```

This will trigger:
- Agent orchestration based on team composition
- PRP generation with full context
- Implementation guidance

## Testing Error Handling

### Test 1: Missing baco.in
Try running `/baco plan` without a baco.in file.

Expected: Error message with suggestion to run `/baco init`

### Test 2: Invalid YAML
Create a baco.in with invalid YAML frontmatter:
```yaml
---
version: 1.0
  project_type: "API"  # Invalid indentation
---
```

Expected: YAML parsing error with line number and fix suggestions

### Test 3: No Features
Create a baco.in without any FEATURE sections.

Expected: Validation error requiring at least one feature

### Test 4: Invalid Dependencies
Create features with dependencies that don't exist:
```
## FEATURE: Feature A
Dependencies: Feature X  # Feature X doesn't exist
```

Expected: Validation error about unknown dependency

## Integration Testing

### Test with Existing Commands

1. Create a valid baco.in file
2. Run `/analyze` - it should consider constraints from baco.in
3. Run `/orchestrate` - it should use team composition from baco.in
4. Run `/generate-prp` - it should incorporate baco.in content

## Expected Benefits

1. **Structured Input**: No more forgetting important details
2. **Reusability**: baco.in files can be versioned and shared
3. **Comprehensive Context**: All project info in one place
4. **Better Results**: More context leads to better AI output

## Troubleshooting

If commands don't recognize baco.in:
1. Ensure you're in the directory containing baco.in
2. Check file is named exactly `baco.in` (lowercase)
3. Validate the file syntax with `/baco validate`

## Feedback

After testing, consider:
- Is the workflow intuitive?
- Are error messages helpful?
- Does the plan match expectations?
- Is the generated code better with structured input?

This new workflow represents a significant improvement in how BACO handles complex projects by providing a "simpler steering wheel" while maintaining all the power of the underlying engine.