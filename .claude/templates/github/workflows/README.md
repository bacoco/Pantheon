# GitHub Actions Workflow Templates

This directory contains GitHub Actions workflow templates for various project types. These templates are automatically selected and customized by BACO based on your project configuration.

## Available Templates

### 🟢 Language-Specific Templates

#### `node.js.yml`
- **For:** Node.js/JavaScript/TypeScript projects
- **Detection:** `package.json` exists
- **Features:**
  - Multiple Node.js version testing (16.x, 18.x, 20.x)
  - Dependency caching
  - Linting, testing, and coverage
  - TypeScript checking (if applicable)
  - Build artifact generation

#### `python.yml`
- **For:** Python projects
- **Detection:** `requirements.txt` or `pyproject.toml`
- **Features:**
  - Multiple Python version testing (3.8 - 3.12)
  - Dependency caching
  - Linting (flake8), formatting (black), type checking (mypy)
  - Security scanning (safety, bandit)
  - Package building

#### `go.yml`
- **For:** Go projects
- **Detection:** `go.mod` exists
- **Features:**
  - Multiple Go version testing
  - Cross-platform builds
  - Format and vet checks
  - Race condition detection
  - golangci-lint integration

#### `rust.yml`
- **For:** Rust projects
- **Detection:** `Cargo.toml` exists
- **Features:**
  - Multi-OS testing (Linux, Windows, macOS)
  - Stable, beta, and nightly Rust
  - Clippy and rustfmt checks
  - Code coverage with tarpaulin
  - Security audit

### 🐳 Infrastructure Templates

#### `docker.yml`
- **For:** Projects with Docker support
- **Detection:** `Dockerfile` or `docker-compose.yml`
- **Features:**
  - Multi-platform builds (amd64, arm64)
  - GitHub Container Registry integration
  - Vulnerability scanning with Trivy
  - Semantic versioning tags

### 🔧 Generic Template

#### `generic.yml`
- **For:** Any project type
- **Features:**
  - Auto-detects project type
  - Runs appropriate tests
  - Super-linter integration
  - Security scanning
  - Flexible deployment options

## Template Selection Logic

When BACO creates a GitHub repository, it:

1. **Detects Project Type**
   - Checks for language-specific files
   - Identifies framework markers
   - Looks for build tool configurations

2. **Selects Template**
   ```
   if package.json exists → node.js.yml
   elif requirements.txt exists → python.yml
   elif go.mod exists → go.yml
   elif Cargo.toml exists → rust.yml
   elif Dockerfile exists → docker.yml + language template
   else → generic.yml
   ```

3. **Customizes Template**
   - Removes unused jobs
   - Adjusts version matrices
   - Configures deployment targets
   - Sets up secrets references

## Customization Points

Each template includes placeholders that BACO customizes:

- `[PROJECT_NAME]` - Your project name
- `[DEPLOY_TARGET]` - Deployment destination
- `[TEST_COMMAND]` - Project-specific test command
- `[BUILD_COMMAND]` - Project-specific build command

## Integration with BACO

When you run `/gh create`, BACO will:

1. Create `.github/workflows/` directory in your project
2. Select the appropriate template(s)
3. Customize based on your project structure
4. Include the workflow in the initial commit

Example:
```yaml
# Created by BACO based on detected Node.js project
name: CI/CD
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
# ... customized workflow content
```

## Manual Selection

To manually specify a workflow template:
```
/preferences set github.workflow_template "node.js"
```

Or during project creation:
```
/gh create --workflow python
```

## Best Practices

1. **Start Simple**: Use the default template selection
2. **Customize Later**: Edit workflows as your project grows
3. **Keep Secrets Secure**: Use GitHub Secrets for sensitive data
4. **Monitor Usage**: Check Actions minutes consumption
5. **Cache Wisely**: Use caching to speed up builds

## Common Modifications

### Adding deployment
```yaml
deploy:
  needs: [test, build]
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to production
      run: |
        # Your deployment commands
```

### Adding notifications
```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Matrix testing expansion
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [16, 18, 20]
```

Remember: These templates provide a solid foundation. Customize them as your project evolves!