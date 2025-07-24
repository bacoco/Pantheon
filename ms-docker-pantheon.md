# Pantheon: Architectural Vision & Technical Specification

This document outlines the complete architectural vision for Pantheon, an AI-powered developer assistant. It has evolved from a simple containerized tool to a competitive, hybrid architecture designed for a superior user experience, drawing inspiration from market leaders like GitHub Copilot and Cursor.

## 1. Product Vision: The Hybrid Interaction Model

Pantheon will provide a seamless, in-editor experience by supporting two distinct, complementary workflows. This hybrid model allows Pantheon to be both a powerful project scaffolder and an interactive, real-time coding partner.

### Workflow A: The Git-Flow Operator (for Large-Scale Tasks)

For large-scale operations like scaffolding a new service, generating a full feature module, or performing project-wide refactors, Pantheon acts as an automated Git operator.

*   **User Action**: A developer runs a command in the terminal, e.g., `gods scaffold:service "user-auth-api"`.
*   **Pantheon Action**: The backend engine clones the user's repository, runs the `claude` CLI to generate the necessary files, and pushes the result back as a new, clean commit.
*   **User Experience**: The developer sees a new commit in their Git history, which they can review, comment on, or revert. This provides a clear, version-controlled audit trail for major changes.

### Workflow B: The In-Editor Assistant (for Interactive Tasks)

For fine-grained, real-time tasks like refactoring a function, adding documentation, or fixing a bug, Pantheon acts as an interactive assistant directly within the VS Code editor.

*   **User Action**: A developer highlights a block of code, right-clicks, and selects a command like "Pantheon: Add Docstrings".
*   **Pantheon Action**: The backend engine receives the code snippet, runs `claude`, and returns a structured "diff" of the proposed change.
*   **User Experience**: The developer is presented with a real-time diff view inside their editor, showing the original code and the AI's suggestion side-by-side. They can **Accept** or **Reject** the change with a single click. The change is only applied if they accept, keeping them in full control.

## 2. The Secure Two-Container Architecture

To protect Pantheon's core intellectual property (the proprietary `.md` prompts) while providing a rich user environment, the system is split into two distinct services managed by Docker Compose.

![Pantheon Architecture Diagram](https://i.imgur.com/eZ5Q8rC.png) *A proper diagram should be created and linked here.*

### Service 1: The User IDE (`code-server`)

This is the environment the user interacts with.

*   **Contains**: `code-server`, a sophisticated VS Code extension for Pantheon, and a simple `gods` CLI wrapper.
*   **Does NOT Contain**: Any proprietary `.md` prompts or the `claude` CLI itself.
*   **Responsibility**: To provide the user interface (editor, terminal), capture user intent, and communicate with the backend engine.

### Service 2: The Pantheon Engine (Secure Backend)

This container is a locked-down, headless service that the user never directly accesses.

*   **Contains**: All proprietary `.claude` `.md` files, the `claude` CLI (securely authenticated), and the core API server.
*   **Responsibility**: To manage the `claude` process, execute prompts, interact with Git repositories, and serve responses to the User IDE.

## 3. Technical Implementation

### The Pantheon Engine API

The core of the backend is an API server (e.g., using FastAPI or Express) with intelligent endpoints:

*   `POST /execute/git-flow`: Receives a high-level command and a Git repository URL. It performs the clone/generate/commit/push workflow and returns a success or failure message.
*   `POST /execute/interactive-diff`: Receives a command and a code snippet. It runs `claude` and returns a JSON object representing the proposed code change (e.g., `{ "filePath": "...", "oldCode": "...", "newCode": "..." }`).

### The VS Code Extension

This is the heart of the user experience. It is responsible for:

*   Contributing commands to the right-click context menu and the command palette.
*   Sending requests to the appropriate Pantheon Engine API endpoint.
*   Rendering the interactive diff view when receiving a response from the `/interactive-diff` endpoint.
*   Applying the changes to the local file system when the user clicks "Accept".

### Docker Configuration

The entire system is orchestrated with a `docker-compose.yml` file.

```yaml
# docker-compose.yml
version: '3.8'

services:
  # The user's interactive environment
  ide:
    build:
      context: ./ide # Contains Dockerfile for code-server and the extension
    ports:
      - "8080:8080"
    volumes:
      # Mount the user's local project code into the IDE
      - ./projects:/home/coder/projects

  # The secure backend engine
  pantheon-engine:
    build:
      context: ./engine # Contains Dockerfile for the API, claude, and prompts
    environment:
      - GITHUB_SSH_KEY=${GITHUB_SSH_KEY} # For cloning/pushing repos
      # Other necessary secrets
    volumes:
      # Persist claude authentication tokens
      - claude-auth:/root/.claude

volumes:
  claude-auth:
```

This architecture provides a secure, scalable, and highly competitive platform for Pantheon, positioning it as a top-tier AI developer assistant.