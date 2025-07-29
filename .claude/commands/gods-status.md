# Gods Status Command

Monitor divine council sessions and see what each god is doing.

## ACTIVATION

When the user types `/gods-status`, show the current state of any active divine council sessions.

## Purpose

This command provides visibility into:
- Which gods are currently active
- What they're working on
- Progress of the council session
- Generated artifacts

## Implementation

When invoked:

1. **Check for active sessions**:
   - Look for recent files in `/chatrooms/`
   - Show last modified times
   - Display current status

2. **Show progress**:
   ```
   ⚡ Divine Council Status
   
   Active Sessions:
   - council-session-2024-01-29.md (Last updated: 2 minutes ago)
   - architecture-council.md (Daedalus working...)
   - ux-design-council.md (Apollo designing...)
   
   Current Phase: Architecture Planning
   Gods Summoned: Zeus, Daedalus, Apollo
   
   To view progress:
   - Check /chatrooms/council-session-2024-01-29.md
   ```

3. **Provide file paths**:
   - Show users exactly where to find the work
   - Suggest using `cat` or reading the files

## Example Usage

```
User: /gods-status