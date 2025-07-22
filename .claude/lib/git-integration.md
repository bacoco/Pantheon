# Git Integration for BACO

This library provides automated Git operations for BACO workflows and project initialization.

## Overview

Git integration enables:
- Automatic repository initialization
- Commit tracking for each phase
- Branch management strategies
- Pull request creation
- Git workflow automation

## Core Functions

### Repository Initialization
```typescript
interface GitInitOptions {
  projectPath: string;
  initialBranch?: string;
  gitignoreTemplate?: string;
  readmeContent?: string;
  firstCommitMessage?: string;
}

async function initializeGitRepo(options: GitInitOptions): Promise<GitResult> {
  const { projectPath, initialBranch = 'main' } = options;
  
  // Check if already a git repo
  if (await isGitRepo(projectPath)) {
    return { success: true, message: 'Already a git repository' };
  }
  
  // Initialize repo
  await exec(`git init --initial-branch=${initialBranch}`, { cwd: projectPath });
  
  // Create .gitignore
  if (options.gitignoreTemplate) {
    await createGitignore(projectPath, options.gitignoreTemplate);
  }
  
  // Create README
  if (options.readmeContent) {
    await createReadme(projectPath, options.readmeContent);
  }
  
  // Initial commit
  await exec('git add -A', { cwd: projectPath });
  await exec(`git commit -m "${options.firstCommitMessage || 'Initial commit'}"`, { 
    cwd: projectPath 
  });
  
  return { success: true, message: 'Repository initialized' };
}
```

### Phase-Based Commits
```typescript
interface PhaseCommitOptions {
  projectPath: string;
  phase: string;
  changes: string[];
  commitMessage?: string;
}

async function commitPhase(options: PhaseCommitOptions): Promise<GitResult> {
  const { projectPath, phase, changes } = options;
  
  // Generate commit message
  const message = options.commitMessage || generatePhaseCommitMessage(phase, changes);
  
  // Stage changes
  await exec('git add -A', { cwd: projectPath });
  
  // Check if there are changes
  const status = await exec('git status --porcelain', { cwd: projectPath });
  if (!status.stdout.trim()) {
    return { success: true, message: 'No changes to commit' };
  }
  
  // Commit with descriptive message
  await exec(`git commit -m "${message}"`, { cwd: projectPath });
  
  // Tag important phases
  if (isImportantPhase(phase)) {
    await exec(`git tag -a "phase-${phase}" -m "Completed ${phase}"`, { 
      cwd: projectPath 
    });
  }
  
  return { success: true, message: `Committed phase: ${phase}` };
}

function generatePhaseCommitMessage(phase: string, changes: string[]): string {
  const templates = {
    'project-init': 'Initialize project structure and configuration',
    'dependencies': 'Add project dependencies and package configuration',
    'architecture': 'Implement core architecture and structure',
    'features': `Implement features: ${changes.slice(0, 3).join(', ')}`,
    'testing': 'Add comprehensive test suite',
    'documentation': 'Add project documentation',
    'optimization': 'Optimize performance and code quality'
  };
  
  return templates[phase] || `Complete ${phase} phase`;
}
```

### Branch Management
```typescript
interface BranchStrategy {
  type: 'feature' | 'gitflow' | 'github-flow' | 'custom';
  mainBranch: string;
  developBranch?: string;
  featurePrefix?: string;
  releasePrefix?: string;
}

class GitBranchManager {
  constructor(private strategy: BranchStrategy) {}
  
  async createFeatureBranch(
    projectPath: string,
    featureName: string
  ): Promise<string> {
    const branchName = this.generateBranchName('feature', featureName);
    
    // Ensure we're on the base branch
    const baseBranch = this.strategy.developBranch || this.strategy.mainBranch;
    await exec(`git checkout ${baseBranch}`, { cwd: projectPath });
    
    // Create and checkout new branch
    await exec(`git checkout -b ${branchName}`, { cwd: projectPath });
    
    return branchName;
  }
  
  async mergeBranch(
    projectPath: string,
    sourceBranch: string,
    targetBranch: string,
    options: { squash?: boolean; noFf?: boolean } = {}
  ): Promise<GitResult> {
    // Checkout target branch
    await exec(`git checkout ${targetBranch}`, { cwd: projectPath });
    
    // Merge with options
    const mergeFlags = [
      options.squash && '--squash',
      options.noFf && '--no-ff'
    ].filter(Boolean).join(' ');
    
    await exec(`git merge ${mergeFlags} ${sourceBranch}`, { cwd: projectPath });
    
    return { success: true, message: `Merged ${sourceBranch} into ${targetBranch}` };
  }
  
  private generateBranchName(type: string, name: string): string {
    const prefix = this.strategy[`${type}Prefix`] || type;
    const sanitized = name.toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    
    return `${prefix}/${sanitized}`;
  }
}
```

### Pull Request Support
```typescript
interface PROptions {
  title: string;
  body: string;
  sourceBranch: string;
  targetBranch: string;
  labels?: string[];
  assignees?: string[];
  reviewers?: string[];
}

async function createPullRequest(
  projectPath: string,
  options: PROptions
): Promise<GitResult> {
  // Detect platform (GitHub, GitLab, Bitbucket)
  const platform = await detectGitPlatform(projectPath);
  
  switch (platform) {
    case 'github':
      return createGitHubPR(projectPath, options);
    case 'gitlab':
      return createGitLabMR(projectPath, options);
    default:
      return { 
        success: false, 
        message: 'Pull request creation requires GitHub CLI or GitLab CLI' 
      };
  }
}

async function createGitHubPR(
  projectPath: string,
  options: PROptions
): Promise<GitResult> {
  // Check if gh CLI is available
  const ghAvailable = await checkCommand('gh');
  if (!ghAvailable) {
    return { 
      success: false, 
      message: 'GitHub CLI (gh) not found. Install from https://cli.github.com' 
    };
  }
  
  // Push current branch
  await exec(`git push -u origin ${options.sourceBranch}`, { cwd: projectPath });
  
  // Create PR using gh CLI
  const prCommand = [
    'gh pr create',
    `--title "${options.title}"`,
    `--body "${options.body}"`,
    `--base ${options.targetBranch}`,
    options.labels?.length && `--label ${options.labels.join(',')}`,
    options.assignees?.length && `--assignee ${options.assignees.join(',')}`,
    options.reviewers?.length && `--reviewer ${options.reviewers.join(',')}`
  ].filter(Boolean).join(' ');
  
  const result = await exec(prCommand, { cwd: projectPath });
  
  return { 
    success: true, 
    message: 'Pull request created',
    data: { url: result.stdout.trim() }
  };
}
```

## Workflow Integration

### BACO Command Integration
```typescript
// In /baco execute command
async function executeWithGit(prpFile: string, options: BacoOptions) {
  const projectPath = options.projectPath;
  
  // Initialize git if requested
  if (options.git) {
    await initializeGitRepo({
      projectPath,
      gitignoreTemplate: detectGitignoreTemplate(projectPath),
      readmeContent: generateReadme(projectPath),
      firstCommitMessage: 'Initial project setup by BACO'
    });
  }
  
  // Execute PRP phases
  for (const phase of phases) {
    const result = await executePhase(phase);
    
    // Commit after each phase if git is enabled
    if (options.git && result.changes.length > 0) {
      await commitPhase({
        projectPath,
        phase: phase.name,
        changes: result.changes,
        commitMessage: phase.commitMessage
      });
    }
  }
}
```

### Workflow Git Integration
```typescript
// In workflow engine
class WorkflowGitIntegration {
  async executeWithGit(workflow: Workflow, options: WorkflowOptions) {
    const branchManager = new GitBranchManager(options.branchStrategy);
    
    // Create feature branch if requested
    if (options.featureBranch) {
      const branchName = await branchManager.createFeatureBranch(
        options.projectPath,
        workflow.name
      );
    }
    
    // Execute workflow with commits
    for (const phase of workflow.phases) {
      const result = await executePhase(phase);
      
      // Commit phase results
      if (result.artifacts.length > 0) {
        await commitPhase({
          projectPath: options.projectPath,
          phase: phase.name,
          changes: result.artifacts.map(a => a.path)
        });
      }
    }
    
    // Create PR if requested
    if (options.createPR) {
      await createPullRequest(options.projectPath, {
        title: `Complete ${workflow.name}`,
        body: generatePRBody(workflow, results),
        sourceBranch: branchName,
        targetBranch: options.targetBranch || 'main'
      });
    }
  }
}
```

## Git Templates

### .gitignore Templates
```typescript
const gitignoreTemplates = {
  node: `
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Testing
coverage/
.nyc_output/

# Logs
logs/
*.log
`,
  
  python: `
# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
eggs/
.eggs/
*.egg-info/
*.egg

# Virtual environments
venv/
ENV/
env/

# IDEs
.vscode/
.idea/
*.swp
.DS_Store

# Testing
.coverage
htmlcov/
.pytest_cache/
`,
  
  general: `
# OS files
.DS_Store
Thumbs.db

# Editor files
*.swp
*.swo
*~
.idea/
.vscode/

# Logs
*.log
logs/

# Environment
.env
.env.local
`
};
```

### Commit Message Templates
```typescript
const commitTemplates = {
  feature: (name: string, description: string) => `feat: ${name}

${description}

Created by BACO workflow`,
  
  fix: (issue: string, solution: string) => `fix: ${issue}

${solution}

Resolves: #issue`,
  
  docs: (what: string) => `docs: ${what}

Updated documentation for better clarity`,
  
  refactor: (what: string, why: string) => `refactor: ${what}

${why}

No functional changes`,
  
  test: (what: string) => `test: add tests for ${what}

Improve test coverage and reliability`
};
```

## Usage Examples

### Initialize Git in New Project
```typescript
await initializeGitRepo({
  projectPath: './my-project',
  initialBranch: 'main',
  gitignoreTemplate: 'node',
  readmeContent: '# My Project\n\nCreated with BACO',
  firstCommitMessage: 'Initial commit - BACO project setup'
});
```

### Feature Branch Workflow
```typescript
const branchManager = new GitBranchManager({
  type: 'github-flow',
  mainBranch: 'main',
  featurePrefix: 'feature'
});

// Create feature branch
const branch = await branchManager.createFeatureBranch(
  './my-project',
  'user-authentication'
);

// ... do work ...

// Create PR
await createPullRequest('./my-project', {
  title: 'Add user authentication',
  body: 'Implements JWT-based authentication system',
  sourceBranch: branch,
  targetBranch: 'main',
  labels: ['enhancement', 'security']
});
```

## Best Practices

1. **Atomic Commits**: Each phase should be a single, logical commit
2. **Meaningful Messages**: Use descriptive commit messages
3. **Branch Strategy**: Choose appropriate branching strategy for project
4. **Regular Commits**: Commit completed work frequently
5. **PR Descriptions**: Include comprehensive PR descriptions

The Git Integration library enables BACO to manage version control seamlessly throughout the development workflow.