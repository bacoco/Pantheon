# GitHub Operations Tool (GitHub MCP)

This tool provides comprehensive GitHub repository management capabilities for version control, collaboration, and project management.

## ACTIVATION

When agents need to interact with GitHub repositories, manage code, or coordinate development workflows, use this tool.

## Capabilities

- **Repository management**: Create, clone, fork repositories
- **Branch operations**: Create, merge, delete branches
- **Pull requests**: Create, review, merge PRs
- **Issue tracking**: Create, update, label issues
- **Project management**: Milestones, projects, releases
- **Code review**: Comments, suggestions, approvals
- **Security**: Vulnerability scanning, secret scanning

## Configuration

```yaml
tool:
  name: github
  type: mcp_server
  config:
    auth: "token_from_env"
    api_version: "v3"
    
capabilities:
  repository:
    operations: ["create", "clone", "fork", "delete", "archive"]
    visibility: ["public", "private", "internal"]
    
  collaboration:
    features: ["issues", "pull_requests", "discussions", "wiki"]
    permissions: ["read", "write", "admin"]
    
  automation:
    workflows: ["actions", "webhooks", "apps"]
    checks: ["status", "ci", "security"]
```

## Usage Patterns

### Repository Operations

```javascript
// Create a new repository
const repo = await mcp.github.createRepository({
  name: "my-project",
  description: "Project description",
  private: false,
  autoInit: true,
  gitignore: "Node",
  license: "MIT"
});

// Clone repository locally
const clone = await mcp.github.clone({
  repo: "owner/repo",
  path: "./projects/repo",
  depth: 1 // Shallow clone
});

// Fork repository
const fork = await mcp.github.fork({
  repo: "original-owner/repo",
  organization: "my-org" // Optional
});
```

### Branch Management

```javascript
// Create feature branch
const branch = await mcp.github.createBranch({
  repo: "owner/repo",
  branch: "feature/new-feature",
  from: "main"
});

// Create pull request
const pr = await mcp.github.createPullRequest({
  repo: "owner/repo",
  title: "Add new feature",
  body: "## Description\nThis PR adds...\n\n## Changes\n- Added X\n- Fixed Y",
  head: "feature/new-feature",
  base: "main",
  draft: false,
  labels: ["enhancement", "needs-review"]
});

// Merge pull request
const merge = await mcp.github.mergePullRequest({
  repo: "owner/repo",
  number: pr.number,
  method: "squash", // or "merge", "rebase"
  commitTitle: "feat: Add new feature (#123)",
  deleteHeadBranch: true
});
```

### Issue Management

```javascript
// Create issue
const issue = await mcp.github.createIssue({
  repo: "owner/repo",
  title: "Bug: Component not rendering",
  body: "## Description\n...\n## Steps to reproduce\n...",
  labels: ["bug", "priority-high"],
  assignees: ["username"],
  milestone: 1
});

// Update issue
await mcp.github.updateIssue({
  repo: "owner/repo",
  number: issue.number,
  state: "closed",
  labels: ["bug", "fixed"]
});

// Add comment
await mcp.github.addComment({
  repo: "owner/repo",
  issue: issue.number,
  body: "Fixed in #124"
});
```

## Agent-Specific Usage

### Daedalus (Architect)

```javascript
// Create Architecture Decision Record
async function createADR(decision) {
  // Create ADR file
  const adrContent = `# ${decision.title}

## Status
${decision.status}

## Context
${decision.context}

## Decision
${decision.decision}

## Consequences
${decision.consequences}
`;

  // Create file in repository
  await mcp.github.createFile({
    repo: "owner/repo",
    path: `docs/adr/${decision.number}-${decision.slug}.md`,
    message: `docs: Add ADR-${decision.number} ${decision.title}`,
    content: Buffer.from(adrContent).toString('base64'),
    branch: "main"
  });

  // Create issue for discussion
  await mcp.github.createIssue({
    repo: "owner/repo",
    title: `ADR-${decision.number}: ${decision.title}`,
    body: `New architecture decision record created. [View ADR](docs/adr/${decision.number}-${decision.slug}.md)`,
    labels: ["architecture", "decision"]
  });
}

// Analyze repository structure
async function analyzeRepository(repo) {
  // Get repository tree
  const tree = await mcp.github.getTree({
    repo: repo,
    recursive: true
  });
  
  // Analyze structure
  const analysis = {
    structure: categorizeFiles(tree),
    patterns: detectPatterns(tree),
    dependencies: await analyzeDependencies(repo),
    architecture: inferArchitecture(tree)
  };
  
  return analysis;
}
```

### Hephaestus (Developer)

```javascript
// Create feature branch and PR workflow
async function implementFeature(feature) {
  // Create feature branch
  const branch = await mcp.github.createBranch({
    repo: feature.repo,
    branch: `feature/${feature.id}`,
    from: "develop"
  });
  
  // Make changes (after local development)
  await mcp.github.createCommit({
    repo: feature.repo,
    branch: branch.name,
    message: `feat: ${feature.description}`,
    files: feature.files
  });
  
  // Create pull request
  const pr = await mcp.github.createPullRequest({
    repo: feature.repo,
    title: `feat: ${feature.title}`,
    body: generatePRBody(feature),
    head: branch.name,
    base: "develop",
    draft: feature.isDraft || false
  });
  
  // Request reviews
  await mcp.github.requestReviewers({
    repo: feature.repo,
    number: pr.number,
    reviewers: feature.reviewers || ["lead-dev"],
    teamReviewers: ["qa-team"]
  });
  
  return pr;
}

// Handle code review feedback
async function handleReviewFeedback(pr, feedback) {
  // Create commits addressing feedback
  for (const item of feedback.items) {
    await mcp.github.createCommit({
      repo: pr.repo,
      branch: pr.head.ref,
      message: `fix: Address review feedback - ${item.summary}`,
      files: item.changes
    });
    
    // Reply to review comment
    await mcp.github.replyToReviewComment({
      repo: pr.repo,
      pullRequest: pr.number,
      comment: item.commentId,
      body: `Fixed in ${item.commitSha}`
    });
  }
  
  // Request re-review
  await mcp.github.requestReview({
    repo: pr.repo,
    number: pr.number,
    reviewers: feedback.reviewers
  });
}
```

### Themis (QA)

```javascript
// Create test report issue
async function createTestReport(testRun) {
  const report = formatTestReport(testRun);
  
  // Create issue with test results
  const issue = await mcp.github.createIssue({
    repo: testRun.repo,
    title: `Test Report: ${testRun.name} - ${testRun.status}`,
    body: report,
    labels: ["testing", testRun.status],
    assignees: testRun.failures.length > 0 ? ["dev-team"] : []
  });
  
  // Link to PR if applicable
  if (testRun.pullRequest) {
    await mcp.github.linkIssueToPR({
      repo: testRun.repo,
      issue: issue.number,
      pullRequest: testRun.pullRequest
    });
  }
  
  // Create issues for failures
  for (const failure of testRun.failures) {
    await mcp.github.createIssue({
      repo: testRun.repo,
      title: `Test Failure: ${failure.test}`,
      body: formatFailure(failure),
      labels: ["bug", "test-failure"],
      assignees: [failure.owner]
    });
  }
  
  return issue;
}

// Track test coverage
async function updateTestCoverage(repo, coverage) {
  // Update coverage badge
  await mcp.github.updateFile({
    repo: repo,
    path: "README.md",
    message: "chore: Update test coverage badge",
    content: updateCoverageBadge(coverage),
    branch: "main"
  });
  
  // Create coverage report
  await mcp.github.createFile({
    repo: repo,
    path: `coverage/report-${Date.now()}.json`,
    message: "test: Add coverage report",
    content: JSON.stringify(coverage, null, 2),
    branch: "main"
  });
}
```

### Aegis (Security)

```javascript
// Security audit workflow
async function performSecurityAudit(repo) {
  // Enable security features
  await mcp.github.enableSecurityFeatures({
    repo: repo,
    features: [
      "vulnerability-alerts",
      "automated-security-fixes",
      "secret-scanning",
      "code-scanning"
    ]
  });
  
  // Get vulnerability report
  const vulnerabilities = await mcp.github.getVulnerabilities({
    repo: repo,
    severity: ["critical", "high", "medium"]
  });
  
  // Create security issues
  for (const vuln of vulnerabilities) {
    const issue = await mcp.github.createIssue({
      repo: repo,
      title: `Security: ${vuln.advisory.summary}`,
      body: formatSecurityIssue(vuln),
      labels: ["security", `severity-${vuln.severity}`],
      assignees: ["security-team"]
    });
    
    // Create fix PR if available
    if (vuln.automatedFix) {
      await mcp.github.createPullRequest({
        repo: repo,
        title: `fix(security): ${vuln.advisory.summary}`,
        body: `Automated security fix for ${vuln.package}`,
        head: vuln.automatedFix.branch,
        base: "main",
        labels: ["security", "automated"]
      });
    }
  }
  
  return vulnerabilities;
}
```

### Prometheus (PM)

```javascript
// Project management
async function manageProject(project) {
  // Create milestone
  const milestone = await mcp.github.createMilestone({
    repo: project.repo,
    title: project.version,
    description: project.goals,
    dueDate: project.deadline
  });
  
  // Create project board
  const board = await mcp.github.createProject({
    repo: project.repo,
    name: `${project.name} - ${project.version}`,
    body: project.description,
    template: "automated_kanban"
  });
  
  // Create epics as issues
  for (const epic of project.epics) {
    const issue = await mcp.github.createIssue({
      repo: project.repo,
      title: `Epic: ${epic.title}`,
      body: formatEpic(epic),
      labels: ["epic", epic.priority],
      milestone: milestone.number,
      project: board.id
    });
    
    // Create sub-tasks
    for (const task of epic.tasks) {
      await mcp.github.createIssue({
        repo: project.repo,
        title: task.title,
        body: `Part of #${issue.number}\n\n${task.description}`,
        labels: ["task"],
        milestone: milestone.number,
        assignees: task.assignees
      });
    }
  }
  
  return { milestone, board };
}
```

### Athena (PO)

```javascript
// User story management
async function createUserStories(stories) {
  const created = [];
  
  for (const story of stories) {
    // Create user story issue
    const issue = await mcp.github.createIssue({
      repo: story.repo,
      title: story.title,
      body: `## User Story
${story.asA}
${story.iWant}
${story.soThat}

## Acceptance Criteria
${story.acceptanceCriteria.map(ac => `- [ ] ${ac}`).join('\n')}

## Definition of Done
${story.definitionOfDone.map(dod => `- [ ] ${dod}`).join('\n')}`,
      labels: ["user-story", `points-${story.points}`],
      milestone: story.sprint
    });
    
    created.push(issue);
  }
  
  // Update backlog project
  await mcp.github.updateProject({
    repo: stories[0].repo,
    project: "product-backlog",
    addIssues: created.map(i => i.number)
  });
  
  return created;
}
```

## Advanced Features

### Automated Workflows

```javascript
// Set up GitHub Actions
async function setupCICD(repo) {
  // Create workflow file
  const workflow = `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - run: npm ci
    - run: npm test
    - run: npm run build
`;

  await mcp.github.createFile({
    repo: repo,
    path: ".github/workflows/ci.yml",
    message: "ci: Add CI/CD pipeline",
    content: Buffer.from(workflow).toString('base64')
  });
}

// Monitor workflow runs
async function monitorWorkflows(repo) {
  const runs = await mcp.github.getWorkflowRuns({
    repo: repo,
    status: "in_progress"
  });
  
  const monitoring = [];
  
  for (const run of runs) {
    monitoring.push({
      id: run.id,
      workflow: run.name,
      status: run.status,
      conclusion: run.conclusion,
      duration: calculateDuration(run),
      url: run.html_url
    });
  }
  
  return monitoring;
}
```

### Release Management

```javascript
// Create release
async function createRelease(repo, version) {
  // Generate changelog
  const changelog = await generateChangelog(repo, version);
  
  // Create release
  const release = await mcp.github.createRelease({
    repo: repo,
    tagName: `v${version}`,
    name: `Release ${version}`,
    body: changelog,
    draft: false,
    prerelease: version.includes('-'),
    targetCommitish: "main"
  });
  
  // Upload assets
  if (version.assets) {
    for (const asset of version.assets) {
      await mcp.github.uploadReleaseAsset({
        repo: repo,
        release: release.id,
        name: asset.name,
        data: asset.data
      });
    }
  }
  
  return release;
}
```

### Collaboration Features

```javascript
// Code review automation
async function automateCodeReview(pr) {
  // Run automated checks
  const checks = await runAutomatedChecks(pr);
  
  // Post review comments
  const comments = [];
  
  for (const check of checks.failures) {
    const comment = await mcp.github.createReviewComment({
      repo: pr.repo,
      pullRequest: pr.number,
      path: check.file,
      line: check.line,
      body: check.message
    });
    comments.push(comment);
  }
  
  // Submit review
  await mcp.github.submitReview({
    repo: pr.repo,
    pullRequest: pr.number,
    event: checks.failures.length > 0 ? "REQUEST_CHANGES" : "APPROVE",
    body: formatReviewSummary(checks)
  });
  
  return { checks, comments };
}
```

## Error Handling

```javascript
// Robust GitHub operations
async function safeGitHubOperation(operation, retries = 3) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Handle rate limiting
      if (error.status === 403 && error.headers['x-ratelimit-remaining'] === '0') {
        const resetTime = error.headers['x-ratelimit-reset'];
        const waitTime = resetTime * 1000 - Date.now();
        console.log(`Rate limited. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Handle conflicts
      if (error.status === 409) {
        console.log("Conflict detected, attempting to resolve...");
        // Implement conflict resolution logic
        continue;
      }
      
      // Retry on server errors
      if (error.status >= 500) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}
```

## Best Practices

1. **Use fine-grained tokens** with minimal required permissions
2. **Handle rate limits** gracefully with exponential backoff
3. **Cache API responses** when appropriate
4. **Use webhooks** for real-time updates instead of polling
5. **Batch operations** when possible to reduce API calls
6. **Implement proper error handling** for network issues
7. **Follow GitHub flow** or Git flow consistently
8. **Automate repetitive tasks** with GitHub Actions

This tool provides comprehensive GitHub integration capabilities for all aspects of repository management and collaboration.