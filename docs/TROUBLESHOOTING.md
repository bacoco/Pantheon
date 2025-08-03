# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Issue: "Command not recognized"

**Symptom:**
```bash
$ /gods plan feature
Error: Command '/gods' not recognized
```

**Solutions:**

1. **Check if you're in Claude Code:**
   - This system only works within Claude Code environment
   - Not a standalone CLI tool

2. **Verify .claude directory exists:**
   ```bash
   $ ls -la .claude/
   ```
   If missing, run:
   ```bash
   $ mkdir -p .claude/{agents,commands,configs,workflows}
   ```

3. **Ensure command file exists:**
   ```bash
   $ ls .claude/commands/
   ```

---

### 🔴 Issue: "Gemini validation not working"

**Symptom:**
```
Gemini command runs but provides generic response
```

**Solutions:**

1. **Include session context:**
   ```bash
   # Bad:
   gemini "Validate code"
   
   # Good:
   gemini "Validate auth implementation: JWT with RS256, Express middleware, bcrypt hashing. Check security and best practices."
   ```

2. **Provide enough context:**
   ```bash
   # Include actual code snippet
   gemini "Validate this auth middleware:
   ```javascript
   function authenticate(req, res, next) {
     const token = req.headers.authorization;
     // ... rest of code
   }
   ```"
   ```

3. **Check Gemini API limits:**
   - Free tier: 1000 requests/day
   - If exceeded, wait until reset or use Claude

---

### 🔴 Issue: "High costs despite using Gemini"

**Symptom:**
```
Session cost: $15.00 (expected: $3.00)
```

**Solutions:**

1. **Check routing configuration:**
   ```bash
   $ /workflow analyze --verbose
   
   # Look for:
   # - Claude used for validation (should be Gemini)
   # - Single validations (should be batched)
   ```

2. **Enable strict validation mode:**
   ```bash
   $ /validation-mode strict
   ```

3. **Use batch validation:**
   ```bash
   # Instead of:
   $ /validate file1
   $ /validate file2
   $ /validate file3
   
   # Use:
   $ /batch-validate files --list "file1,file2,file3"
   ```

4. **Review model routing:**
   ```json
   // Check ~/.claude-code-router/config.json
   {
     "WorkflowRouting": {
       "validation": "gemini,gemini-2.5-pro",  // Should be Gemini
       "creation": "claude,sonnet"              // Should be Claude
     }
   }
   ```

---

### 🔴 Issue: "Session state not persisting"

**Symptom:**
```
Previous context lost between commands
```

**Solutions:**

1. **Start a session:**
   ```bash
   $ /session start --type feature-development
   ```

2. **Save validation results:**
   ```bash
   $ /session save-validation --result "[paste gemini output]"
   ```

3. **Check session status:**
   ```bash
   $ /session status
   ```

4. **Resume interrupted session:**
   ```bash
   $ /session list
   $ /session resume [session-id]
   ```

---

### 🔴 Issue: "Batch validation too large"

**Symptom:**
```
Gemini: "Context too large, please reduce input"
```

**Solutions:**

1. **Split into smaller batches:**
   ```bash
   # Instead of 50 files:
   $ /batch-validate files --list "**/*.js"
   
   # Use chunks:
   $ /batch-validate files --list "src/auth/*.js"
   $ /batch-validate files --list "src/api/*.js"
   ```

2. **Use compression:**
   ```bash
   $ /batch-validate files --compress --list "large-files"
   ```

3. **Enable progressive validation:**
   ```bash
   $ /workflow progressive-validate
   # Level 1: Quick scan
   # Level 2: Detailed review
   # Level 3: Deep analysis
   ```

---

### 🔴 Issue: "Gemini writes code (shouldn't happen)"

**Symptom:**
```
Gemini provides code implementations instead of validation
```

**Solutions:**

1. **Use explicit validation prompts:**
   ```bash
   # Bad:
   gemini "Fix this code"
   
   # Good:
   gemini "VALIDATE ONLY (do not write code): Review this implementation for security issues"
   ```

2. **Use validation-specific gods:**
   ```bash
   $ @apollo-validator  # Configured to never write code
   $ @themis-validator  # Only compliance checking
   $ @argus-validator   # Security analysis only
   ```

---

### 🔴 Issue: "Export format not working"

**Symptom:**
```
$ /export validation --format json
Error: Invalid format or empty export
```

**Solutions:**

1. **Ensure validations exist:**
   ```bash
   $ /session status
   # Check "validation_results" count
   ```

2. **Specify output file:**
   ```bash
   $ /export validation --format json --output report.json
   ```

3. **Check format support:**
   ```bash
   $ /export formats
   # Lists all supported formats
   ```

---

## Performance Issues

### 🟡 Slow validation responses

**Diagnosis:**
```bash
$ /workflow benchmark --current
```

**Optimizations:**
1. Use Gemini Flash for simple validations
2. Enable caching: `/workflow cache-validation --ttl 24h`
3. Use parallel terminals for batch operations
4. Reduce validation frequency

### 🟡 Token limit warnings

**Monitor usage:**
```bash
$ /session cost --detailed
```

**Reduce tokens:**
1. Compress context: `/batch-validate --compress`
2. Remove comments: `/export --transform minify`
3. Use summaries instead of full code

---

## Configuration Issues

### 🔵 Router not finding config

**Check locations:**
```bash
$ ls ~/.claude-code-router/config.json
$ ls .claude/configs/
```

**Create default config:**
```bash
$ /workflow init-config --defaults
```

### 🔵 Permissions errors

**Fix permissions:**
```bash
$ chmod -R 755 .claude/
$ chmod 644 .claude/configs/*.json
```

---

## Workflow Issues

### 🟣 Workflow gets stuck

**Reset workflow:**
```bash
$ /workflow reset --force
$ /session start --fresh
```

### 🟣 Validation loop

**Break the loop:**
```bash
$ /validation-mode optional
# Complete current task
$ /validation-mode strict  # Re-enable
```

---

## Quick Fixes

### Reset Everything
```bash
$ /workflow reset --all
$ /session cleanup
$ /cache clear
```

### Emergency Mode
```bash
$ /emergency-mode on
# Bypasses all validation
# Uses cheapest models
# Minimal features
```

### Safe Mode
```bash
$ /safe-mode on
# Extra confirmations
# No automatic actions
# Detailed logging
```

---

## Diagnostic Commands

### System Health Check
```bash
$ /health check

🏥 SYSTEM HEALTH
================
✅ Commands: OK
✅ Agents: OK
✅ Configs: OK
⚠️ Session: 2 orphaned
✅ Cache: OK (1.2MB)
✅ Exports: OK

Issues found: 1
Run: /health fix
```

### Debug Mode
```bash
$ /debug on

🐛 DEBUG MODE ACTIVE
- Verbose logging enabled
- API calls logged
- Timing information shown
- Token counts displayed
```

### Performance Profiling
```bash
$ /profile start
# ... do work ...
$ /profile stop

📊 PROFILE RESULTS
==================
Total time: 15m 23s
API calls: 23
- Claude: 8 (35%)
- Gemini: 15 (65%)
Token usage: 45,234
Cost: $2.34
Bottlenecks:
- Validation: 8m (52%)
- Suggested: Use batch validation
```

---

## Error Messages Decoder

| Error | Meaning | Solution |
|-------|---------|----------|
| `ERR_NO_SESSION` | No active session | `/session start` |
| `ERR_QUOTA_EXCEEDED` | API limit reached | Wait or switch model |
| `ERR_INVALID_WORKFLOW` | Workflow corrupted | `/workflow reset` |
| `ERR_CONTEXT_TOO_LARGE` | Too much data | Split into batches |
| `ERR_VALIDATION_TIMEOUT` | Validation took too long | Retry with smaller scope |
| `ERR_CACHE_FULL` | Cache limit reached | `/cache clean` |
| `ERR_EXPORT_FAILED` | Export generation failed | Check data exists |
| `ERR_CONFIG_INVALID` | Bad configuration | `/config validate` |

---

## Getting Help

### Self-Help Commands
```bash
$ /help                     # General help
$ /help [command]          # Command-specific help
$ /examples [command]      # Show examples
$ /docs [topic]           # Open documentation
```

### Check Documentation
```bash
$ /docs troubleshooting    # This guide
$ /docs examples          # Interactive examples
$ /docs api              # API reference
$ /docs workflows        # Workflow guide
```

### Community Resources
- GitHub Issues: Report bugs
- Discord: Real-time help
- Stack Overflow: Tag `pantheon-ai`

### Support Levels

**Level 1: Self-Service**
- Use `/help` commands
- Check this guide
- Try `/health fix`

**Level 2: Community**
- Discord community
- GitHub discussions
- Stack Overflow

**Level 3: Direct Support**
- GitHub issues for bugs
- Feature requests
- Critical problems

---

## Prevention Tips

### Best Practices to Avoid Issues

1. **Always start sessions** for multi-step work
2. **Use batch validation** instead of single validations
3. **Monitor costs** with `/session cost`
4. **Save work frequently** with exports
5. **Use templates** for consistent workflows
6. **Cache validation results** to avoid redundancy
7. **Check health regularly** with `/health check`

### Daily Checklist
```bash
# Start of day
$ /health check
$ /session cleanup
$ /cache optimize

# During work
$ /session start
$ /batch-validate
$ /session save

# End of day
$ /export session
$ /session close
$ /health check
```

---

## Recovery Procedures

### Recover Lost Session
```bash
$ /session recover --latest
# or
$ /session recover --date 2024-01-15
```

### Restore Configuration
```bash
$ /config restore --backup
# Lists available backups
$ /config restore --backup 2024-01-15-1400
```

### Rebuild Index
```bash
$ /workflow rebuild-index
$ /cache rebuild
```

---

## FAQ

**Q: Why isn't Gemini understanding my validation request?**
A: Include specific context and use structured prompts. Always mention it's for validation only.

**Q: Can I automate the Gemini CLI calls?**
A: The system is designed for manual control. Automation would bypass the transparency benefit.

**Q: Why are costs still high?**
A: Check if you're using batch validation and ensure routing is set to use Gemini for validation.

**Q: Session keeps timing out?**
A: Use `/session keepalive` during long tasks or adjust timeout in config.

**Q: Can I use other models?**
A: Yes, configure additional providers in `~/.claude-code-router/config.json`

---

## Quick Reference

```
Emergency Commands:
/emergency-mode on     - Bypass everything
/health fix           - Auto-fix issues
/workflow reset       - Clear stuck workflow
/cache clear          - Free up space
/session recover      - Restore lost work

Diagnostic Commands:
/health check         - System status
/debug on            - Enable debugging
/profile start       - Performance profiling
/workflow analyze    - Cost analysis
/session status      - Current state
```