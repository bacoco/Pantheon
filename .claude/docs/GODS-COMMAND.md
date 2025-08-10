# /gods - One Command for Everything

## Usage

```bash
/gods [request]
```

That's it. One command does everything.

## Examples

### Complete Project Flow

```bash
# Start a new project
/gods create a todo app with user authentication

# This automatically:
# 1. Thoth creates PRD
# 2. Athena designs architecture  
# 3. Iris designs UI
# 4. Hephaestus builds it
# 5. Apollo tests it
# 6. Calliope documents it
# 7. Githeus commits and pushes
```

### Individual Tasks

```bash
# Chat/Research
/gods explain JWT tokens

# Requirements
/gods write PRD for e-commerce platform

# Design
/gods design login page UI

# Build
/gods implement user registration

# Test
/gods test authentication endpoints

# Fix
/gods debug token expiration issue

# Review
/gods review security implementation

# Documentation
/gods document API endpoints

# Git Operations
/gods commit these changes
/gods push to GitHub
```

### Smart Routing

The `/gods` command automatically knows what to do:

| Your Request | Gods Invoked |
|-------------|--------------|
| "chat about X" | Hermes researches |
| "PRD for X" | Thoth writes specs |
| "design X" | Iris creates UI |
| "plan X" | Athena architects |
| "build X" | Hephaestus codes |
| "test X" | Apollo validates |
| "fix X" | Hephaestus repairs |
| "review X" | Oracle approves |
| "document X" | Calliope writes |
| "commit X" | Githeus saves |
| "push X" | Githeus deploys |
| "do everything for X" | Zeus orchestrates all |

## Implementation

### In Your Code

When you type `/gods`, it's actually running:

```javascript
function handleGodsCommand(request) {
  // Smart detection of intent
  const intent = detectIntent(request);
  
  // Route to appropriate god(s)
  switch(intent) {
    case 'chat': 
      return Task("Hermes", request);
    
    case 'prd':
      return Task("Thoth", request);
    
    case 'design':
      return Task("Iris", request);
      
    case 'build':
      return Task("Hephaestus", request);
      
    case 'test':
      return Task("Apollo", request);
      
    case 'complete_project':
      // Chain all gods
      await Task("Thoth", "Create PRD: " + request);
      await Task("Athena", "Design architecture");
      await Task("Iris", "Design UI");
      await Task("Hephaestus", "Build implementation");
      await Task("Apollo", "Test everything");
      await Task("Calliope", "Write documentation");
      await Task("Githeus", "Commit and push");
      return "✅ Project complete!";
  }
}
```

## Workflows

### Full Project Development

```bash
/gods create a blog platform with comments
```

Automatically runs:
1. **Thoth**: Creates complete PRD
2. **Athena**: Designs system architecture
3. **Iris**: Creates UI mockups
4. **Hephaestus**: Implements everything
5. **Apollo**: Writes and runs tests
6. **Oracle**: Reviews quality
7. **Calliope**: Generates documentation
8. **Githeus**: Commits with meaningful message
9. **Githeus**: Pushes to GitHub

### Quick Fix

```bash
/gods fix the login bug and push
```

Automatically runs:
1. **Hermes**: Researches the issue
2. **Hephaestus**: Fixes the bug
3. **Apollo**: Tests the fix
4. **Githeus**: Commits and pushes

### Design Sprint

```bash
/gods design new dashboard
```

Automatically runs:
1. **Iris**: Creates UI design
2. **Athena**: Reviews architecture impact
3. **Calliope**: Documents design decisions

## Advanced Usage

### Chaining

```bash
/gods build auth system then test it then push
```

### Specific God Override

```bash
/gods @apollo comprehensive security testing
/gods @zeus orchestrate payment integration
```

### Batch Operations

```bash
/gods review all code, fix issues, update docs, and push
```

## Configuration

The `/gods` command is configured in `.claude/hooks.json` and uses smart pattern matching to determine intent.

## Benefits

1. **One Command**: No need to remember multiple commands
2. **Smart Routing**: Automatically picks the right god(s)
3. **Complete Workflows**: Can handle entire project lifecycles
4. **Natural Language**: Just describe what you want
5. **Automatic Chaining**: Gods work together seamlessly

## Quick Reference

```bash
# Do everything
/gods create [project description]

# Specific tasks
/gods chat [topic]
/gods prd [project]
/gods design [feature]
/gods build [component]
/gods test [code]
/gods fix [bug]
/gods docs [topic]
/gods commit
/gods push

# Complete workflow
/gods do everything for [project]
```

That's it. One command. Infinite possibilities. The gods handle the rest.