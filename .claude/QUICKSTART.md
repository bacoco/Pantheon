# 🚀 Pantheon GOD Ultimate - Quick Start Guide

## Current Status

The system is ready with the following components:

### ✅ What's Working
1. **Enhanced Gods** - All deployed in `.claude/agents/`
   - Zeus Ultimate (with Divine Assembly powers)
   - Apollo Enhanced (with UI analysis)
   - Mimesis (website cloning)
   - 12+ original gods

2. **Expert Library** - 47 agents in `.claude/experts/`
   - Engineering experts
   - Product/Design experts
   - Marketing experts
   - Testing experts

3. **Documentation** - Complete guides in `.claude/docs/`

### ⚠️ MCP Servers (Optional Setup)
The MCP servers require additional dependencies. They're optional for basic god usage.

## Quick Usage (No Setup Required)

### Use the Gods Directly
```javascript
// These work immediately:
Task("zeus", "Plan a project architecture")
Task("athena", "Design system structure")
Task("hephaestus", "Build a feature")
Task("apollo", "Review code quality")
```

### Use Enhanced Gods
```javascript
Task("zeus-ultimate", "Orchestrate project with experts")
// Note: Expert summoning requires MCP server setup
```

## Optional: MCP Server Setup

If you want the full UI design analysis and expert summoning capabilities:

### 1. Simplified Installation
```bash
# For UI Design Analyzer (without Firecrawl)
cd .claude/mcp-servers/ui-design-analyzer
mv package.json package-full.json
mv package-simple.json package.json
npm install
npm run build
```

### 2. For Divine Assembly
```bash
cd ../divine-assembly
npm install
npm run build
```

### 3. Update .claude.json
Already configured - just restart Claude Code.

## What You Can Do Right Now

### 1. Basic God Orchestration
```javascript
Task("zeus", "Help me build a todo app")
Task("athena", "Design the architecture")
Task("hephaestus", "Implement the backend")
```

### 2. Documentation & Planning
```javascript
Task("thoth", "Write a PRD for my project")
Task("calliope", "Document the API")
Task("hermes", "Explain this code")
```

### 3. Quality & Security
```javascript
Task("apollo", "Review my code")
Task("argus", "Check for security issues")
Task("oracle", "Validate the implementation")
```

## Advanced Features (Requires MCP Setup)

### Website Design Analysis
```javascript
// Requires Firecrawl API key
Task("apollo-enhanced", "Analyze stripe.com design")
```

### Expert Summoning
```javascript
// Requires Divine Assembly MCP server
await summon_expert({
  expert_name: "senior-software-engineer",
  task_prompt: "Design microservices"
})
```

## Troubleshooting

### Issue: Package not found errors
**Solution**: Use the simplified package.json provided

### Issue: Firecrawl not working
**Solution**: The system works without it - UI analysis features will be limited

### Issue: Expert summoning not working
**Solution**: Gods still work independently - use Task() directly

## Summary

The Pantheon GOD system is fully functional for:
- ✅ All original gods (Zeus, Athena, Apollo, etc.)
- ✅ Basic orchestration and planning
- ✅ Code generation and review
- ✅ Documentation and communication

Optional advanced features (require setup):
- ⚠️ Website design analysis (needs Firecrawl API)
- ⚠️ Expert summoning (needs MCP server running)
- ⚠️ Website cloning (needs Firecrawl API)

**You can start using the gods immediately without any additional setup!**