# Council with Visibility Workflow

This workflow ensures users can see what gods are doing during council sessions.

## ACTIVATION

Use this workflow when starting a divine council session to ensure maximum visibility.

## Implementation

### 1. Create Session Files

When starting a council:

```python
# Create main session file
timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
session_file = f"/chatrooms/council-session-{timestamp}.md"

# Write initial content
write_file(session_file, f"""
# Divine Council Session - {timestamp}

## Status: Active
## Phase: Discovery

### User Request
{user_request}

### Progress Log

**{time.now()}** - Council session started
**{time.now()}** - Beginning discovery phase...
""")
```

### 2. Write Progress Updates

As the council works:

```python
def update_progress(session_file, message):
    append_to_file(session_file, f"\n**{time.now()}** - {message}")
```

### 3. Document God Contributions

When a god is summoned:

```python
def document_god_work(god_name, contribution):
    god_file = f"/chatrooms/{god_name}-work-{timestamp}.md"
    write_file(god_file, f"""
# {god_name.title()} Contribution

## Timestamp: {time.now()}

### Analysis
{contribution}
""")
    
    # Also update main session file
    update_progress(session_file, f"{god_name} completed analysis - see {god_file}")
```

### 4. Show Users How to Monitor

After starting the council:

```
Council session started! 

📁 Monitoring your divine council:
- Main session: /chatrooms/council-session-{timestamp}.md
- Real-time updates are being written to this file
- Individual god contributions will appear in separate files

You can check progress with:
cat /chatrooms/council-session-{timestamp}.md

Or watch for updates:
tail -f /chatrooms/council-session-{timestamp}.md
```

## Example Visible Council Session

```markdown
# Divine Council Session - 20240129-143000

## Status: Active
## Phase: Architecture Planning

### User Request
I want to create a web app for AI image generation with iterative refinement

### Progress Log

**14:30:00** - Council session started
**14:30:01** - Beginning discovery phase...
**14:30:05** - User provided details about SD Flux and metaprompt system
**14:30:10** - Summoning Daedalus for architecture...
**14:30:12** - Daedalus analyzing technical requirements...
**14:30:15** - Daedalus completed analysis - see /chatrooms/daedalus-work-20240129-143000.md
**14:30:20** - Summoning Apollo for UX design...
**14:30:22** - Apollo designing mobile interface...
**14:30:25** - Apollo completed design - see /chatrooms/apollo-work-20240129-143000.md
**14:30:30** - Synthesizing PRD from all contributions...
**14:30:35** - PRD complete - see /chatrooms/final-prd.md
```

## Benefits

1. **Real-time visibility** - Users can see exactly what's happening
2. **Persistent record** - All work is saved in files
3. **Easy monitoring** - Simple commands to check progress
4. **Transparent process** - Know which god is doing what

## Usage in Commands

When implementing `/gods council`, use this pattern:

```javascript
// Start with visibility
const sessionFile = createSessionFile();
showMonitoringInstructions(sessionFile);

// Write updates as you work
updateProgress(sessionFile, "Starting discovery phase");

// When invoking sub-agents, tell them to write progress
const prompt = `
Start divine council session.
IMPORTANT: Write all progress to ${sessionFile}
Document each step clearly.
`;

Task("Council with visibility", prompt, "divine-council");
```

This ensures users always know what's happening!