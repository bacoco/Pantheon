# Command Output Parsing Patterns

## Overview
This library provides parsing patterns for command outputs to extract structured information from CLI tools.

## GitHub CLI (`gh`) Outputs

### `gh auth status`
**Command**: `gh auth status`

**Output Format**:
```
github.com
  ✓ Logged in to github.com as USERNAME (keyring)
  - Active account: true
  - Git operations protocol: https
  - Token: gho_****
  - Token scopes: 'gist', 'read:org', 'repo', 'workflow'
```

**Parsing Pattern**:
- Look for line containing "Logged in to github.com as"
- Extract USERNAME between "as " and " ("
- Authentication status: Look for "✓ Logged in"

**Example Parse**:
```
If output contains "✓ Logged in to github.com as bacoco":
  username = "bacoco"
  authenticated = true
```

### `gh repo create`
**Command**: `gh repo create [name] [flags]`

**Output Format**:
```
✓ Created repository owner/repo-name on GitHub
  https://github.com/owner/repo-name
```

**Parsing Pattern**:
- Look for line starting with "https://github.com/"
- This line contains the full repository URL
- Extract owner and repo name from URL path

**Example Parse**:
```
If line = "https://github.com/bacoco/my-project":
  url = "https://github.com/bacoco/my-project"
  owner = "bacoco"
  repo = "my-project"
```

### `gh repo view --json`
**Command**: `gh repo view --json name,owner,url,defaultBranchRef,isPrivate`

**Output Format**: Valid JSON
```json
{
  "name": "repo-name",
  "owner": {"login": "owner-name"},
  "url": "https://github.com/owner/repo",
  "defaultBranchRef": {"name": "main"},
  "isPrivate": false
}
```

**Parsing Pattern**:
- Parse as standard JSON
- Access nested fields using dot notation
- Handle missing fields gracefully

## Git Command Outputs

### `git status -sb`
**Command**: `git status -sb`

**Output Formats**:
```
## main...origin/main [ahead 2]
## main...origin/main [behind 3]
## main...origin/main [ahead 2, behind 1]
## main
```

**Parsing Pattern**:
- First line shows branch tracking info
- Extract numbers after "ahead" and "behind"
- No brackets = no tracking or up to date
- Parse branch names before and after "..."

**Status Detection**:
```
[ahead X] only → Can push safely
[behind Y] only → Need to pull first
[ahead X, behind Y] → Branch diverged
No brackets → Up to date or no upstream
```

### `git remote -v`
**Command**: `git remote -v`

**Output Format**:
```
origin  https://github.com/user/repo.git (fetch)
origin  https://github.com/user/repo.git (push)
```

**Parsing Pattern**:
- Each line: [remote-name] [url] ([type])
- Look for "origin" remote
- Extract URL for push/fetch operations
- No output = no remotes configured

### `git log --oneline -n 5`
**Command**: `git log --oneline -n 5`

**Output Format**:
```
a1b2c3d feat: add new feature
e4f5g6h fix: resolve bug
i7j8k9l docs: update README
```

**Parsing Pattern**:
- Each line: [short-hash] [commit message]
- First 7 chars = commit hash
- Rest = commit message
- Can extract commit type from conventional commits

## Test Command Detection

### NPM/Node.js Projects
**Detection**: `package.json` exists

**Test Command Check**:
```bash
# Check if test script exists
cat package.json | grep -q '"test":'
```

**Common Patterns**:
- `npm test`
- `npm run test`
- `yarn test`
- `pnpm test`

### Python Projects
**Detection**: `requirements.txt` or `pyproject.toml` exists

**Test Command Check**:
```bash
# Check for test directory
ls -d tests/ test/ 2>/dev/null
# Check for test files
ls test_*.py *_test.py 2>/dev/null
```

**Common Patterns**:
- `pytest`
- `python -m pytest`
- `python -m unittest`
- `tox`

### Rust Projects
**Detection**: `Cargo.toml` exists

**Test Command**: Always `cargo test`

### Go Projects
**Detection**: `go.mod` exists

**Test Command**: Always `go test ./...`

## Error Output Patterns

### Test Failures
**NPM Test Output**:
```
Test Suites: 2 failed, 3 passed, 5 total
Tests:       4 failed, 16 passed, 20 total
```

**Parsing Pattern**:
- Look for "failed" in output
- Extract numbers before "failed"
- If any number > 0, tests failed

### Build Errors
**Common Patterns**:
- Exit code != 0
- Output contains "ERROR:", "Error:", "FAILED"
- TypeScript: "error TS"
- ESLint: "problems ("

## Usage Examples

### Parsing GitHub Authentication
```
When checking auth status:
1. Run: gh auth status
2. Look for "✓ Logged in to github.com as "
3. If found: 
   - Extract username
   - Set authenticated = true
4. If not found:
   - Set authenticated = false
   - Guide user to run: gh auth login
```

### Parsing Git Push Safety
```
When checking if safe to push:
1. Run: git fetch origin
2. Run: git status -sb
3. Parse output:
   - If contains "[ahead" but not "behind" → Safe
   - If contains "behind" → Not safe
   - If no brackets → Check if remote exists
```

### Detecting Test Command
```
When detecting test command for a project:
1. Check project type files (package.json, requirements.txt, etc.)
2. Based on type, check for test configuration
3. Return appropriate command or null if none found
4. Cache result for session
```

## Best Practices

1. **Always check exit codes** - Commands may fail silently
2. **Handle missing output** - Commands may return empty
3. **Use specific patterns** - Avoid broad matches
4. **Cache parsed results** - Avoid re-parsing same output
5. **Provide fallbacks** - Have defaults for common cases

## Common Pitfalls

1. **Localization** - Some git commands may output in different languages
2. **Version differences** - Output format may vary by tool version
3. **Platform differences** - Windows vs Unix line endings
4. **Partial matches** - Ensure patterns are specific enough

Remember: These patterns help BACO understand command outputs to provide intelligent assistance.