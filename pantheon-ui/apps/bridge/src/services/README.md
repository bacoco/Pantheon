# Pantheon Service

The Pantheon Service provides backend functionality for managing and executing Pantheon (Beyond Automated Context Orchestrator) commands.

## Overview

The Pantheon service handles:
- Reading command markdown files from `.claude/commands/`
- Parsing and executing Pantheon commands
- Managing file system operations for `/pantheon init`
- Checking if `.claude` directory exists in the working directory

## API

### Class: `PantheonService`

```typescript
const pantheonService = new PantheonService(workingDirectory?: string);
```

### Methods

#### `checkClaudeDirectory(): Promise<boolean>`
Check if `.claude` directory exists in the working directory.

#### `initPantheon(): Promise<CommandResult>`
Initialize Pantheon in the working directory. Creates the `.claude` directory structure with default files.

#### `loadCommands(): Promise<Map<string, BacoCommand>>`
Load all available commands from the commands directory.

#### `getCommand(commandName: string): Promise<BacoCommand | null>`
Get a specific command by name.

#### `executeCommand(commandLine: string): Promise<CommandResult>`
Parse and execute a Pantheon command. Handles special commands like `/pantheon init`.

#### `listCommands(): Promise<string[]>`
List all available command names.

#### `getStatus(): Promise<any>`
Get comprehensive Pantheon system status including initialization state and file counts.

## Directory Structure

When initialized, Pantheon creates the following structure:

```
.claude/
├── README.md
├── commands/
│   └── help.md
├── agents/
├── memory/
│   └── patterns.json
├── templates/
└── workflows/
```

## REST API Endpoints

The service is exposed through the following REST endpoints:

### `GET /api/pantheon/status`
Get Pantheon system status.

### `POST /api/pantheon/init`
Initialize Pantheon in the current directory.

### `GET /api/pantheon/commands`
List all available Pantheon commands with descriptions.

### `GET /api/pantheon/commands/:name`
Get a specific command by name.

### `POST /api/pantheon/execute`
Execute a Pantheon command.

**Request Body:**
```json
{
  "command": "/help"
}
```

### `POST /api/pantheon/workspace`
Change Pantheon working directory.

**Request Body:**
```json
{
  "directory": "/path/to/project"
}
```

## Usage Example

```typescript
import { PantheonService } from './pantheon-service.js';

// Initialize service
const pantheon = new PantheonService('/path/to/project');

// Check if Pantheon is initialized
const isInitialized = await pantheon.checkClaudeDirectory();

// Initialize if needed
if (!isInitialized) {
  await pantheon.initPantheon();
}

// Execute a command
const result = await pantheon.executeCommand('/help');
console.log(result.output);
```

## Command Format

Pantheon commands are markdown files with the following structure:

```markdown
# /command-name Command

## ACTIVATION
Description of when this command activates.

## OUTPUT FORMAT
Description or example of the output format.

## INSTRUCTIONS
1. Step-by-step instructions
2. For executing the command

## METADATA (optional)
\```yaml
metadata:
  category: analysis
  version: 1.0.0
  dependencies: [other-command]
\```
```

## Error Handling

The service provides comprehensive error handling:
- Returns structured `CommandResult` objects with success/error status
- Logs errors using Winston logger
- Validates command existence before execution
- Checks initialization state before operations