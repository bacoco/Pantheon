# Pantheon Divine Council Refactoring - Detailed Todo List

## Phase 0: Install All MCP Servers (Priority: CRITICAL - DO FIRST!)

### 0.1 Install missing MCP servers
- [x] Install playwright MCP:
  ```bash
  npm install -g @playwright/mcp
  ```
- [x] Install context7 MCP (URL-based, no install needed)
- [x] Install claude-task-master (renamed to task-master-ai):
  ```bash
  npm install -g task-master-ai
  ```
- [x] Install shadcn-ui MCP:
  ```bash
  npm install -g shadcn-ui-mcp-server
  ```
- [x] Verify all installations with:
  ```bash
  # Test each MCP server
  npx @playwright/mcp --version
  npx task-master-ai --version
  npx shadcn-ui-mcp-server --version
  ```

### 0.2 Update .mcp.json if needed
- [x] After installation, verify .mcp.json commands are correct
- [x] Remove browsermcp from .mcp.json (not available)
- [x] Test each MCP server connection

### 0.3 Add installation to documentation
- [ ] Create MCP-SETUP.md with installation instructions
- [ ] Add to USER-GUIDE.md
- [ ] Update install-pantheon.sh to include MCP setup

## Phase 1: Fix MCP Tool References (Priority: HIGH)

### 1.1 Update Apollo's tools
- [ ] Replace `browsermcp` with `playwright` in apollo.md
- [ ] Verify all other MCP tool references are correct
- [ ] Add WebSearch tool for documentation lookup

### 1.2 Update all gods' MCP tools
- [ ] Daedalus: Verify `mcp__claude-flow__github_repo_analyze` works
- [ ] Zeus: Add `WebSearch` for researching similar projects
- [ ] Prometheus: Add `WebSearch` for market research
- [ ] All gods: Remove any `browsermcp` references

### 1.3 Create MCP usage tracking
- [ ] Add function to log MCP tool usage in chatroom files
- [ ] Format: `**[time]** - [God] used [MCP_tool] for [purpose]`
- [ ] Show results in chatroom documentation

## Phase 2: Restore Old Commands (Priority: HIGH)

### 2.1 Create /gods-init.md command
- [ ] Interactive project name prompt
- [ ] Project type selection (web app, API, CLI, etc.)
- [ ] Git initialization option (y/n)
- [ ] GitHub repo creation option (private/public/no)
- [ ] Create `/projects/[name]/` directory structure
- [ ] Initialize git if requested
- [ ] Create GitHub repo with `gh repo create`

### 2.2 Create /gods-plan.md command
- [ ] Load project context from directory
- [ ] Generate development plan based on pantheon.md
- [ ] Create PRD in `/projects/[name]/chatrooms/`
- [ ] Auto-commit with message "feat: add development plan"

### 2.3 Create /gods-execute.md command
- [ ] Generate PRP from PRD
- [ ] Option to implement immediately (y/n)
- [ ] If yes, call execute-prp with the generated PRP
- [ ] Track progress in chatroom files
- [ ] Auto-commit after each phase

### 2.4 Create /gods-validate.md command
- [ ] Check pantheon.md structure
- [ ] Verify all required sections present
- [ ] Suggest improvements

### 2.5 Create /gods-resume.md command
- [ ] List projects in `/projects/` directory
- [ ] Load saved state from `.claude/memory/projects/[name]-state.json`
- [ ] Continue from last phase

## Phase 3: Update Divine Council (Priority: HIGH)

### 3.1 Add project initialization to divine-council.md
- [ ] First prompt: "📁 What would you like to name your project?"
- [ ] Create `/projects/[name]/` directory
- [ ] Create `/projects/[name]/chatrooms/` subdirectory
- [ ] Ask: "🔧 Initialize git repository? (y/n)"
- [ ] Ask: "🌐 Create GitHub repository? (private/public/no)"
- [ ] Execute git init if requested
- [ ] Execute gh repo create if requested

### 3.2 Add real-time progress tracking
- [ ] Create `/projects/[name]/chatrooms/council-progress.md`
- [ ] Update every major action:
  - Project directory created
  - Git initialized
  - GitHub repo created
  - God summoned
  - God completed task
  - PRD generation started
  - PRP generation started
- [ ] Show command: `tail -f /projects/[name]/chatrooms/council-progress.md`

### 3.3 Add MCP tool usage logging
- [ ] When god uses MCP tool, log it:
  ```markdown
  **14:30:15** - Daedalus used mcp__claude-flow__github_repo_analyze
  Analyzing: https://github.com/example/similar-project
  Found: WebSocket architecture with Redis pub/sub
  ```

### 3.4 Add user clarification prompts
- [ ] During council, gods can ask for clarification
- [ ] Write questions to `/projects/[name]/chatrooms/clarifications-needed.md`
- [ ] Format:
  ```markdown
  ## Clarification Needed
  
  **Apollo asks**: Should the UI be mobile-first or desktop-first?
  **Daedalus asks**: Do you need real-time updates or is polling acceptable?
  ```

## Phase 4: Generic PRD/PRP Generation (Priority: MEDIUM)

### 4.1 Remove template-based approach
- [ ] Delete example image app references
- [ ] Make council ask about specific project details
- [ ] Generate PRD based on actual user requirements

### 4.2 Dynamic god summoning
- [ ] Based on project type, summon relevant gods:
  - Web app: Zeus, Daedalus, Apollo, Hephaestus
  - API: Zeus, Daedalus, Hephaestus, Aegis
  - CLI tool: Zeus, Daedalus, Hephaestus
  - Library: Zeus, Daedalus, Themis

### 4.3 Custom PRD sections
- [ ] Adapt PRD structure to project type
- [ ] Include project-specific requirements
- [ ] Add technology recommendations based on research

## Phase 5: Git Integration (Priority: MEDIUM)

### 5.1 Auto-commit workflow
- [ ] After project init: "Initial commit"
- [ ] After PRD: "docs: add product requirements"
- [ ] After PRP: "docs: add implementation blueprint"
- [ ] After each implementation phase: "feat: implement [phase]"

### 5.2 GitHub integration
- [ ] Use `gh auth status` to check authentication
- [ ] Guide user through `gh auth login` if needed
- [ ] Create repo with description from project
- [ ] Add README.md with project overview

## Phase 6: Visibility Improvements (Priority: HIGH)

### 6.1 Update /gods command
- [ ] Show subcommands: council, init, plan, execute, validate, resume, status
- [ ] Each subcommand shows clear purpose

### 6.2 Improve council visibility
- [ ] Show monitoring instructions immediately:
  ```
  📁 Project: /projects/[name]/
  📊 Monitor: tail -f /projects/[name]/chatrooms/council-progress.md
  ❓ Questions: cat /projects/[name]/chatrooms/clarifications-needed.md
  ```

### 6.3 Session state management
- [ ] Save state to `.claude/memory/projects/[name]-state.json`
- [ ] Include: current phase, completed tasks, git status, generated files

## Phase 7: Web Search Integration (Priority: LOW)

### 7.1 Add WebSearch to research tasks
- [ ] When researching architectures: search for best practices
- [ ] When designing UI: search for similar apps
- [ ] When choosing tech: search for comparisons

### 7.2 Add playwright for visual research
- [ ] Replace browsermcp with playwright in Apollo
- [ ] Capture screenshots of reference UIs
- [ ] Save to `/projects/[name]/chatrooms/references/`

## Implementation Order:

1. **Immediate fixes** (Phase 1): Fix MCP references
2. **Core functionality** (Phase 2-3): Restore old commands and update council
3. **Project features** (Phase 4-5): Generic generation and git
4. **Enhancements** (Phase 6-7): Visibility and web search

## Success Criteria:

- [ ] User can run `/gods init` and get project directory with git
- [ ] Divine council shows real-time progress
- [ ] MCP tool usage is logged and visible
- [ ] Gods can request clarification from user
- [ ] PRD/PRP are project-specific, not template-based
- [ ] All commits happen automatically
- [ ] User can monitor progress in real-time