# Pantheon Project Directory Guide

## Overview

Pantheon now creates dedicated project directories for each project, keeping your code organized and Pantheon system files separate.

## What Changed?

### Before
- Files created in current directory
- Mixed Pantheon files with project files
- Potential conflicts and confusion

### After  
- Each project gets its own directory
- Clean separation of concerns
- Multiple projects from one Pantheon installation

## How It Works

### 1. Project Initialization

When you run `/gods init`, the first question is now:

```
📁 What would you like to name your project?
   (This will create a directory with this name)
   
Project name: my-awesome-app
```

This creates:
```
./my-awesome-app/           # Your project directory
```

### 2. File Organization

All project files are created within the project directory:

```
my-awesome-app/
├── pantheon.md                 # Project definition
├── pantheon-prp-20250120.md   # Generated PRP
├── package.json           # Project dependencies
├── src/                   # Source code
│   ├── components/        # React components
│   ├── app/              # Next.js app directory
│   └── ...               # Other source files
└── ...                   # Other project files
```

### 3. Pantheon System Files

Pantheon's own files remain in the `.claude/` directory:

```
.claude/
├── commands/              # Command definitions
├── agents/               # Agent personas
├── lib/                  # Shared libraries
└── memory/               # Session states
    └── projects/         # Project-specific states
        └── my-awesome-app-state.json
```

## Benefits

1. **Clean Projects**: No Pantheon-specific files in your project
2. **Multiple Projects**: Manage many projects from one Pantheon
3. **Easy Deployment**: Project directories are ready to deploy
4. **Better Organization**: Clear separation of system and project

## Working with Projects

### Creating a New Project
```bash
/gods init
# Enter project name when prompted
# Pantheon creates directory automatically
```

### Resuming Work
```bash
/gods resume
# Shows: "Project: my-awesome-app/"
# Continues in the right directory
```

### Manual Commands
If running commands manually, remember the project directory:
```bash
# Files are created in project directory
Write("my-awesome-app/src/index.js", code)

# Commands run in project directory  
Bash("cd my-awesome-app && npm install")
```

## Migration Guide

### For Existing Projects
If you have an existing project without a directory:
1. Create a directory: `mkdir my-project`
2. Move files: `mv pantheon.md *.ts *.tsx package.json my-project/`
3. Continue with `/gods execute` from project root

### For New Projects
Just use `/gods init` - everything is handled automatically!

## FAQ

**Q: Can I change the project name later?**
A: Yes, just rename the directory. Update any hardcoded paths if needed.

**Q: What if the directory already exists?**
A: Pantheon will ask if you want to use the existing directory.

**Q: Can I have nested projects?**
A: Yes, but it's recommended to keep projects at the same level for clarity.

**Q: Where are session states stored?**
A: In `.claude/memory/projects/{project-name}-state.json`

## Best Practices

1. **Use descriptive project names**: `ai-chat-app` not `project1`
2. **One project per directory**: Don't mix multiple projects
3. **Keep Pantheon at parent level**: Run Pantheon from parent of project directories
4. **Check location**: Always verify you're in the right directory

## Example Workflow

```bash
# 1. Start in your development directory
cd ~/projects

# 2. Run Pantheon init
/gods init

# 3. Enter project name
Project name: recipe-finder

# 4. Pantheon creates directory
✅ Created project directory: ./recipe-finder/

# 5. Continue with setup...
# All files created in recipe-finder/

# 6. Later, to run the project:
cd recipe-finder && npm run dev
```

This approach keeps your projects clean, organized, and ready for deployment!