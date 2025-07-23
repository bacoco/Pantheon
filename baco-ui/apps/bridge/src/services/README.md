# BACO Service

The BACO Service provides backend functionality for managing and executing BACO (Beyond Automated Context Orchestrator) commands.

## Overview

The BACO service handles:
- Reading command markdown files from `.claude/commands/`
- Parsing and executing BACO commands
- Managing file system operations for `/baco init`
- Checking if `.claude` directory exists in the working directory

## API

### Class: `BacoService`

```typescript
const bacoService = new BacoService(workingDirectory?: string);
```

### Methods

#### `checkClaudeDirectory(): Promise<boolean>`
Check if `.claude` directory exists in the working directory.

#### `initBaco(): Promise<CommandResult>`
Initialize BACO in the working directory. Creates the `.claude` directory structure with default files.

#### `loadCommands(): Promise<Map<string, BacoCommand>>`
Load all available commands from the commands directory.

#### `getCommand(commandName: string): Promise<BacoCommand | null>`
Get a specific command by name.

#### `executeCommand(commandLine: string): Promise<CommandResult>`
Parse and execute a BACO command. Handles special commands like `/baco init`.

#### `listCommands(): Promise<string[]>`
List all available command names.

#### `getStatus(): Promise<any>`
Get comprehensive BACO system status including initialization state and file counts.

## Directory Structure

When initialized, BACO creates the following structure:

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

### `GET /api/baco/status`
Get BACO system status.

### `POST /api/baco/init`
Initialize BACO in the current directory.

### `GET /api/baco/commands`
List all available BACO commands with descriptions.

### `GET /api/baco/commands/:name`
Get a specific command by name.

### `POST /api/baco/execute`
Execute a BACO command.

**Request Body:**
```json
{
  "command": "/help"
}
```

### `POST /api/baco/workspace`
Change BACO working directory.

**Request Body:**
```json
{
  "directory": "/path/to/project"
}
```

## Usage Example

```typescript
import { BacoService } from './baco-service.js';

// Initialize service
const baco = new BacoService('/path/to/project');

// Check if BACO is initialized
const isInitialized = await baco.checkClaudeDirectory();

// Initialize if needed
if (!isInitialized) {
  await baco.initBaco();
}

// Execute a command
const result = await baco.executeCommand('/help');
console.log(result.output);
```

## Command Format

BACO commands are markdown files with the following structure:

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