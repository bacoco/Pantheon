# 🏛️ Pantheon GOD Ultimate - .claude Native Structure

Everything is now cleanly organized within the `.claude/` directory for seamless Claude Code integration.

## 📁 Directory Structure

```
.claude/
├── agents/                     # Pantheon Gods
│   ├── zeus.md                # Original gods
│   ├── apollo.md
│   ├── athena.md
│   ├── zeus-ultimate.md       # Enhanced with Divine Assembly
│   ├── apollo-enhanced.md     # Enhanced with UI analysis
│   └── mimesis.md             # New website cloning goddess
├── mcp-servers/               # MCP Server implementations
│   ├── ui-design-analyzer/   # 6 divine design tools
│   │   ├── server.ts
│   │   ├── package.json
│   │   └── dist/
│   └── divine-assembly/       # Expert orchestration
│       ├── server.ts
│       ├── package.json
│       └── dist/
├── experts/                   # Claude Code Studio agents (47)
│   ├── engineering/
│   ├── product/
│   ├── design/
│   ├── marketing/
│   ├── testing/
│   └── utilities/
├── CLAUDE.md                  # Main configuration
├── install.sh                 # One-command installer
└── README.md                  # This file
```

## 🚀 Quick Start

### 1. Install Everything
```bash
cd /path/to/your/project
.claude/install.sh
```

### 2. Add API Keys
```bash
# Edit the .env file
nano .claude/mcp-servers/ui-design-analyzer/.env

# Add your keys:
FIRECRAWL_API_KEY=fc-your-key-here
OPENAI_API_KEY=sk-your-key      # Optional
ANTHROPIC_API_KEY=sk-ant-your-key # Optional
```

### 3. Test
```javascript
// Test Divine Assembly
Task("zeus-ultimate", "List all available experts");

// Test UI Design Analysis
Task("apollo-enhanced", "Analyze stripe.com design system");

// Test Website Cloning
Task("mimesis", "Clone airbnb.com for co-working spaces");
```

## 🎯 Why .claude Structure?

**Benefits:**
- ✅ **Native Integration**: Works seamlessly with Claude Code
- ✅ **Clean Organization**: Everything in one standard location
- ✅ **Easy Updates**: Simple to maintain and upgrade
- ✅ **No Path Issues**: Relative paths from .claude root
- ✅ **Standard Practice**: Follows Claude Code conventions

## 🛠️ Components

### 1. Enhanced Gods (`agents/`)
- **zeus-ultimate.md**: Commands both gods and experts
- **apollo-enhanced.md**: Website design analysis
- **mimesis.md**: Website cloning and adaptation

### 2. MCP Servers (`mcp-servers/`)
- **UI Design Analyzer**: 6 tools for design extraction
- **Divine Assembly**: Orchestrates 47 expert agents

### 3. Expert Library (`experts/`)
47 specialized agents from Claude Code Studio:
- Engineering (12 experts)
- Product & Design (8 experts)
- Marketing (7 experts)
- Testing (5 experts)
- Utilities (5 experts)
- And more...

## 📝 Configuration

The `.claude.json` at project root:
```json
{
  "mcpServers": {
    "ui-design-analyzer": {
      "type": "stdio",
      "command": "node",
      "args": [".claude/mcp-servers/ui-design-analyzer/dist/server.js"]
    },
    "divine-assembly": {
      "type": "stdio",
      "command": "node",
      "args": [".claude/mcp-servers/divine-assembly/dist/server.js"]
    }
  }
}
```

## 🎮 Usage Examples

### Summon an Expert
```javascript
// Direct summoning
await summon_expert({
  expert_name: "frontend-developer",
  task_prompt: "Create a React dashboard component"
});

// Via Zeus
Task("zeus-ultimate", "Summon frontend-developer to build dashboard");
```

### Analyze a Website
```javascript
// Via Apollo
Task("apollo-enhanced", "Extract design system from figma.com");

// Direct tool
await firecrawl_scrape_design({ url: "https://figma.com" });
```

### Orchestrate Multiple Experts
```javascript
Task("zeus-ultimate", `
  Orchestrate:
  1. product-manager: Create PRD
  2. ui-designer: Design mockups
  3. frontend-developer: Implement UI
  4. test-writer: Create tests
`);
```

## 🔧 Maintenance

### Update Experts
```bash
# Pull latest from Claude Code Studio
cd /tmp
git clone https://github.com/arnaldo-delisio/claude-code-studio.git
cp -r claude-code-studio/agents/* /path/to/project/.claude/experts/
```

### Rebuild MCP Servers
```bash
# UI Design Analyzer
cd .claude/mcp-servers/ui-design-analyzer
npm run build

# Divine Assembly
cd ../divine-assembly
npm run build
```

### Check Status
```bash
# Count experts
find .claude/experts -name "*.md" | wc -l

# Check MCP servers
ls -la .claude/mcp-servers/*/dist/server.js

# Verify gods
ls -la .claude/agents/*ultimate*.md .claude/agents/*enhanced*.md
```

## 🎯 Best Practices

### Use Gods for Strategy
```javascript
Task("zeus-ultimate", "Plan the project architecture");
Task("athena", "Design the system");
```

### Use Experts for Execution
```javascript
await summon_expert({
  expert_name: "senior-software-engineer",
  task_prompt: "Implement the authentication service"
});
```

### Combine Both
```javascript
Task("zeus-ultimate", `
  1. Apollo analyzes reference sites
  2. Summon product-manager for PRD
  3. Summon engineers for implementation
  4. Oracle validates quality
`);
```

## 🚦 Troubleshooting

### MCP Server Not Found
```bash
# Check if built
ls .claude/mcp-servers/*/dist/

# If missing, rebuild
.claude/install.sh
```

### Experts Not Loading
```bash
# Check expert count
find .claude/experts -name "*.md" | wc -l

# If 0, clone Claude Code Studio
git clone https://github.com/arnaldo-delisio/claude-code-studio.git temp
cp -r temp/agents/* .claude/experts/
rm -rf temp
```

### API Key Issues
```bash
# Check .env file
cat .claude/mcp-servers/ui-design-analyzer/.env

# Verify Firecrawl key format (fc-xxx)
# Get key from https://firecrawl.dev
```

## 📊 Statistics

- **Total Files**: ~60 (all in .claude/)
- **Expert Agents**: 47
- **UI Tools**: 6
- **Enhanced Gods**: 3
- **MCP Servers**: 2
- **Zero External Dependencies**: Everything in .claude/

## 🎉 Summary

The `.claude/` structure provides:
1. **Clean Integration**: Native Claude Code structure
2. **Everything Included**: Gods, experts, and tools in one place
3. **Easy Maintenance**: Single directory to manage
4. **Standard Compliance**: Follows Claude Code best practices
5. **Production Ready**: Full error handling, caching, rate limiting

---

*"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."* - Applied to the .claude structure