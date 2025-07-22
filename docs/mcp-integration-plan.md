# MCP Integration Plan for BACO

This document outlines the formal plan for integrating the Model Context Protocol (MCP) into the BACO project, enabling agents to use external, stateful tools.

## 1. Core Goal

The primary objective is to create a unified, prompt-based interface that allows BACO agents to securely and reliably interact with external tools (MCPs) like a web browser, screenshot utility, or task manager. This will transform agents from instruction-followers into autonomous problem-solvers.

## 2. Implementation Strategy

The integration will be executed by creating a series of new markdown files within the `.claude/` directory, staying true to BACO's pure prompt-based philosophy.

### Step 1: Create the MCP Integration Library
- **File:** `.claude/lib/mcp-integration.md`
- **Purpose:** This will be the central hub for all MCP logic. It will define the core prompts for how to connect to an MCP server, list available tools, and execute a tool with specific arguments.
- **Content:**
  - Instructions for connecting to the MCP server (e.g., reading a config file for the server address).
  - Prompts for formatting a tool-use request.
  - Logic for parsing the JSON response from a tool.

### Step 2: Define MCP Tool Interfaces
- **Directory:** `.claude/tools/`
- **Purpose:** Each file in this directory will define a specific tool available via MCP.
- **Example (`.claude/tools/screenshot.md`):
  ```markdown
  # Tool: Screenshot
  ## Description
  Captures a screenshot of a given URL.
  ## Arguments
  - `url`: (string, required) The URL to capture.
  - `full_page`: (boolean, optional) Whether to capture the full page.
  ## Returns
  - `image_path`: (string) The local path to the saved screenshot.
  ```

### Step 3: Create MCP-Aware Commands
- **File:** `.claude/commands/mcp.md`
- **Purpose:** A new user-facing command to manage and interact with MCP.
- **Subcommands:**
  - `/mcp list`: Lists all available tools from the connected server.
  - `/mcp use [tool] [args]`: Allows the user to directly invoke a tool.
  - `/mcp status`: Shows the connection status to the MCP server.

### Step 4: Update Agent Definitions
- **Files:** All agent files in `.claude/agents/`
- **Purpose:** To grant specific agents permission to use specific tools.
- **Example (in `ui-healer.md`):
  ```markdown
  ## Tools
  You have access to the following tools via MCP. You must use them when necessary to complete your tasks.
  - `screenshot`: To capture the visual state of the UI.
  - `browser`: To analyze the inspiration URLs.
  ```

### Step 5: Add MCP Server Configuration
- **File:** `.claude/settings.local.json` (or a new `.baco/mcp.json`)
- **Purpose:** To store the connection details for the MCP server.
- **Content:**
  ```json
  {
    "mcp_server_url": "http://localhost:8080/mcp"
  }
  ```

### Step 6: Create Documentation and Examples
- **File:** `docs/mcp-usage-guide.md`
- **Purpose:** To provide clear instructions for users and developers on how to use and extend the MCP integration.
- **Content:**
  - How to connect to an MCP server.
  - How to grant agents tool access.
  - An example workflow, such as the UI Healer using the screenshot tool.
