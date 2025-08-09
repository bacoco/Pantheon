# Plan to Remove All Gemini References

## Files Requiring Modification

### 1. Core Configuration Files
- `.claude/settings.json` - Remove Gemini model preferences
- `.claude/configs/model-routing.json` - Remove Gemini routing rules
- `.claude/configs/cost-tracking.json` - Remove Gemini cost tracking
- `.claude/configs/tool-permissions.json` - Remove Gemini permissions

### 2. God Definition Files  
- Remove Gemini model references from:
  - zeus.md
  - apollo.md
  - athena.md
  - hephaestus.md
  - argus.md
  - themis.md
  - calliope.md
  - iris.md

### 3. Command Files
- `.claude/commands/gods.md` - Remove Gemini CLI integration
- `.claude/commands/model-management.md` - Remove multi-model management
- `.claude/commands/validation.md` - Remove Gemini validation routing
- `.claude/commands/workflow-orchestration.md` - Remove Gemini workflow

### 4. Documentation
- `.claude/CLAUDE.md` - Remove model routing documentation

### 5. Workflows & Templates
- `.claude/workflows/optimized-workflows.md`
- `.claude/templates/output-formats.json`
- `.claude/state/templates/feature-dev.json`
- `.claude/state/session-manager.md`

## Key Changes

### settings.json
Remove:
- `validationProvider: "gemini"`
- All Gemini model preferences
- Model routing configurations

Keep:
- Basic Claude configuration
- Divine council settings
- Tool permissions

### God Files
Remove:
- References to "Gemini FREE"
- Model routing comments
- Cost optimization via Gemini

Replace with:
- Pure Claude implementation
- Single model approach
- Focus on Task() tool usage

### Commands
Transform:
- `/gods` command to pure Claude
- Remove CLI integration instructions
- Remove cost comparison tables

## Benefits After Removal

1. **Simpler Architecture**: One model, one system
2. **Clearer Documentation**: No routing complexity
3. **Easier Maintenance**: No multi-model coordination
4. **Better Performance**: No context switching
5. **Consistent Behavior**: Same model throughout

## Implementation Approach

1. Update settings.json first (core configuration)
2. Clean god definition files
3. Simplify command documentation
4. Update workflows
5. Test everything works with pure Claude

## Testing After Changes

Run these commands to verify:
- "Zeus, build a test app"
- "Oracle, review requirements"
- "Divine council, orchestrate project"
- Task("apollo", "test")
- Task("hermes", "status")

All should work with pure Claude Code Task() tool.