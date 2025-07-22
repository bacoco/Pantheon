# User Preferences Configuration System

## Overview
This library defines how BACO stores and manages user preferences for git, GitHub, and development workflows. Preferences are stored at session level with smart defaults.

## Default Preferences

### Git & Commit Preferences
```yaml
git:
  auto_commit: true              # Commit automatically after phases
  test_before_commit: true       # Run tests before commits
  test_mode: "strict"           # strict | relaxed | skip
  commit_style: "conventional"   # conventional | simple | detailed
  branch_strategy: "main"        # main | feature | gitflow
```

### GitHub Preferences
```yaml
github:
  create_repo_default: true      # Offer GitHub repo creation
  visibility: "private"          # private | public
  push_strategy: "direct"        # direct | pr
  auto_push: false              # Push automatically after completion
  generate_readme: true          # Create professional README
```

### Development Preferences
```yaml
development:
  framework_detection: "auto"    # auto | manual
  dependency_install: "auto"     # auto | manual | skip
  live_preview: true            # Offer live preview after completion
  error_handling: "interactive"  # interactive | strict | continue
```

## Session-Level Storage

Preferences are maintained during a BACO session:

```
Current Session Preferences:
{
  "project_name": "my-app",
  "project_path": "./my-app",
  "git": {
    "auto_commit": true,
    "test_mode": "strict",
    "commits_created": 12
  },
  "github": {
    "repo_created": true,
    "repo_url": "https://github.com/user/my-app"
  }
}
```

## Preference Detection & Learning

### Initial Project Setup
When `/baco init` runs, detect preferences from:
1. User's GitHub profile (public/private tendency)
2. Existing projects in directory
3. Git global config
4. Previous BACO sessions

### Progressive Preference Learning
Track user choices to suggest better defaults:
```
User History:
- Always chooses private repos → Default to private
- Often skips tests → Suggest relaxed mode
- Prefers feature branches → Default to feature strategy
- Uses TypeScript → Prefer TS templates
```

## Preference Commands

### `/preferences show`
Display current session preferences:
```
📋 Current BACO Preferences
═══════════════════════════

Git Settings:
• Auto-commit: ON
• Test mode: strict
• Test before commit: YES
• Commit style: conventional

GitHub Settings:
• Default visibility: private
• Push strategy: direct
• Auto-create repo: YES

Development:
• Framework detection: auto
• Live preview: YES
```

### `/preferences set [key] [value]`
Update a specific preference:
```
/preferences set github.visibility public
✅ Updated: GitHub repos will be public by default

/preferences set git.test_mode relaxed
✅ Updated: Tests will run in relaxed mode
```

### `/preferences reset`
Reset to default preferences:
```
/preferences reset
⚠️ Reset all preferences to defaults? (y/n)
```

## Smart Defaults by Context

### Solo Developer Mode (Default)
```yaml
git:
  branch_strategy: "main"
  push_strategy: "direct"
  test_mode: "relaxed"
```

### Team Project Mode
Detected when:
- Multiple contributors in git log
- Existing PR workflow
- Branch protection rules

```yaml
git:
  branch_strategy: "feature"
  push_strategy: "pr"
  test_mode: "strict"
```

### Prototype Mode
Detected when:
- Project name contains "test", "demo", "poc"
- No existing tests
- Rapid iteration pattern

```yaml
git:
  auto_commit: true
  test_mode: "skip"
  commit_style: "simple"
```

## Integration with Commands

### During `/baco init`
```
Based on your preferences:
• Private repository (change with: /preferences set github.visibility public)
• Auto-commit enabled (disable: /git auto-commit off)
• Strict testing (relax: /git test-mode relaxed)
```

### During `/baco execute`
Use preferences to pre-select options:
```
Git options (based on your preferences):
☑ Initialize Git repository (auto_commit: true)
☑ Commit after each phase (auto_commit: true)
☑ Run tests before commits (test_mode: strict)
☐ Create feature branch (branch_strategy: main)
☐ Push to GitHub after completion (auto_push: false)
```

### During `/gh create`
Apply GitHub preferences:
```
Creating repository with your preferences:
• Visibility: private (your default)
• Branch: main
• README: Yes
```

## Preference Inheritance

### Project-Level Override
If a project has specific needs:
```
# In project directory, detect:
- .baco-preferences.yml
- package.json with baco config
- .github/workflows (implies strict mode)
```

### Global Preferences (Future)
Could read from:
```
~/.baco/preferences.yml
~/.config/baco/preferences.yml
```

## Preference Validation

### Valid Values
```javascript
const validPreferences = {
  "git.auto_commit": [true, false],
  "git.test_mode": ["strict", "relaxed", "skip"],
  "git.commit_style": ["conventional", "simple", "detailed"],
  "github.visibility": ["private", "public"],
  "github.push_strategy": ["direct", "pr"]
};
```

### Type Checking
Ensure preference values match expected types:
- Booleans: true/false
- Enums: predefined string values
- Numbers: within valid ranges

## Preference Persistence (Session Only)

During a BACO session:
```
Session State:
{
  "preferences": { ... },
  "preference_history": [
    { "timestamp": "...", "key": "git.test_mode", "old": "strict", "new": "relaxed" }
  ],
  "project_preferences": {
    "./my-app": { "test_mode": "skip" }
  }
}
```

## User Experience

### First-Time User
```
Welcome to BACO! Let's set up your preferences:

1. How do you usually work?
   • Solo developer (recommended)
   • Team environment
   • Just experimenting

2. Repository visibility preference?
   • Private (recommended)
   • Public
   • Ask each time

3. How strict about tests?
   • Run tests, block on failure (strict)
   • Run tests, warn on failure (relaxed)
   • I'll handle tests manually (skip)

✅ Preferences configured! You can change these anytime with /preferences
```

### Returning User
```
Welcome back! Using your preferences from last session:
• Private repos
• Auto-commit enabled
• Relaxed test mode

Start with: /baco init
```

## Best Practices

1. **Don't Overwhelm**: Only show preferences when relevant
2. **Smart Defaults**: Most users shouldn't need to change anything
3. **Easy Overrides**: Make it simple to change for current operation
4. **Clear Impact**: Show how preferences affect behavior
5. **Respect Choices**: Remember user preferences within session

## Examples in Action

### Auto-Commit Preference
```
# With auto_commit: true (default)
Phase 1 complete!
🧪 Running tests... ✅ Passed
📝 Committing: "feat: implement authentication (Phase 1/4)"
✅ Committed automatically

# With auto_commit: false
Phase 1 complete!
🧪 Running tests... ✅ Passed
💡 Ready to commit. Run: /git commit
```

### Test Mode Preference
```
# With test_mode: "strict" (default)
🧪 Running tests...
❌ 2 tests failed!
Cannot continue. Fix tests or change mode: /git test-mode relaxed

# With test_mode: "relaxed"
🧪 Running tests...
⚠️ 2 tests failed (continuing anyway)
📝 Committing with [WIP] prefix
```

Remember: Preferences enhance the BACO experience by reducing repetitive choices while maintaining full user control.