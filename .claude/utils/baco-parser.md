# BACO Input Parser Instructions

This document provides instructions for parsing and validating `baco.in` files when BACO commands need them.

## ACTIVATION
When any BACO command needs to parse a `baco.in` file, follow these instructions.

## PARSING INSTRUCTIONS

### 1. Understanding the baco.in Structure

A valid `baco.in` file has:
- **YAML frontmatter** (optional) between `---` markers at the start
- **Markdown sections** with specific headers
- **Structured content** under each section

### 2. How to Parse Each Section

#### YAML Frontmatter
Look for content between opening and closing `---` markers:
- Extract: version, project_type, author, created_at, tags
- If missing, assume version: 1.0

#### FEATURE Sections
Find all lines starting with `## FEATURE:`:
- The feature name follows the colon
- Description is the content until the next ## heading
- Look for priority markers: [HIGH PRIORITY], [MEDIUM PRIORITY], [LOW PRIORITY]
- Look for "Dependencies:" followed by comma-separated feature names
- Default priority is "medium" if not specified

#### EXAMPLES Section
Find the `## EXAMPLES:` section:
- Each bullet point (`-`) represents an example
- Format: `- \`filepath\`: description`
- Also look for inline code blocks with triple backticks

#### DOCUMENTATION Section
Find the `## DOCUMENTATION:` section:
- Each bullet point is a documentation link
- Format: `- \`URL\`: optional description` or just `- URL`

#### CONSTRAINTS Section
Find the `## CONSTRAINTS:` section:
- Each bullet point is a technical constraint
- These are requirements the solution must meet

#### OTHER CONSIDERATIONS Section
Find the `## OTHER CONSIDERATIONS:` section:
- Free-form text with additional context
- Everything until the next section or end of file

### 3. Validation Rules

Check for these issues and report them clearly:

1. **Frontmatter Validation**:
   - Must be valid YAML syntax
   - Version format should be "X.Y" (e.g., "1.0")

2. **Feature Validation**:
   - At least one FEATURE section must exist
   - Feature names should be on the same line as `## FEATURE:`
   - Dependencies must reference existing feature names

3. **Example Validation**:
   - File paths should be relative (not starting with /)
   - Note which example files don't exist (warning, not error)

4. **General Structure**:
   - Sections should follow markdown heading format
   - No duplicate feature names

### 4. Error Messages

Provide helpful, specific error messages:

**For YAML errors:**
"❌ YAML frontmatter error: [specific issue]
💡 Tip: Make sure your frontmatter starts and ends with '---' on separate lines"

**For missing features:**
"❌ No FEATURE sections found
💡 Tip: Add at least one feature with `## FEATURE: Your Feature Name`"

**For dependency errors:**
"❌ Feature 'X' depends on unknown feature 'Y'
💡 Tip: Check that 'Y' is defined as a feature in your file"

**For file path issues:**
"⚠️ Warning: Example file 'X' uses absolute path
💡 Tip: Use relative paths like './examples/file.py'"

### 5. Successful Parse Output

When successfully parsed, organize the information as:

```
{
  "frontmatter": {
    "version": "1.0",
    "project_type": "Web Application",
    "author": "Name"
  },
  "features": [
    {
      "title": "Feature Name",
      "description": "Feature description",
      "priority": "high|medium|low",
      "dependencies": ["Other Feature"]
    }
  ],
  "examples": [
    {
      "path": "./examples/file.py",
      "description": "What this shows"
    }
  ],
  "documentation": [
    {
      "url": "https://...",
      "title": "Optional title"
    }
  ],
  "constraints": [
    "Constraint 1",
    "Constraint 2"
  ],
  "other_considerations": "Additional text..."
}
```

## AUTO-DISCOVERY HINTS

When examples section is empty or sparse:
- Suggest looking for example files in common directories:
  - `examples/`, `samples/`, `tests/`, `src/examples/`
- Mention that BACO can work without examples but they help maintain consistency

## USAGE IN COMMANDS

When a command needs to parse baco.in:
1. First check if the content has already been shared
2. If not, ask: "Please share your baco.in file content so I can analyze it"
3. Parse according to these instructions
4. Report any validation issues with helpful suggestions
5. If valid, proceed with the command's purpose

Remember: This is prompt-based parsing using your understanding, not code execution!