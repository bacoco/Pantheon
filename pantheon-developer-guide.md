# Pantheon: Developer Implementation Guide

**Version: 1.0**

This document provides the detailed technical specifications and setup instructions required to build and run the Pantheon application. It is intended for developers responsible for implementing the system.

## 1. Architectural Overview

Pantheon is a hybrid AI coding assistant built on a secure, two-container architecture.

-   **The User IDE**: A `code-server` environment where the developer works. It contains a sophisticated VS Code extension that acts as the frontend.
-   **The Pantheon Engine**: A headless backend service that securely stores all proprietary prompts, manages the `claude` CLI, and executes AI and Git operations via a private API.

The two services communicate via a REST API. This design ensures that Pantheon's core IP is never exposed to the user's environment, while providing a seamless, interactive user experience.

## 2. Prerequisites

Ensure the following tools are installed on your local machine:
-   Docker
-   Docker Compose
-   Node.js (v18+) and npm
-   An SSH client (e.g., `ssh-keygen`)

## 3. Project Directory Structure

Create the following directory and file structure. This is the complete monorepo layout.

```
/pantheon/
├── .env
├── docker-compose.yml
├── projects/               # This directory will be mounted for user code
└── services/
    ├── ide/
    │   ├── Dockerfile
    │   └── extension/
    │       ├── extension.js
    │       └── package.json
    └── engine/
        ├── Dockerfile
        ├── main.py
        ├── requirements.txt
        └── prompts/          # Your secret .md prompts go here
            ├── refactor.md
            └── scaffold_service.md
```

## 4. Docker Configuration

These are the complete, copy-pasteable configuration files.

### 4.1. `docker-compose.yml` (Root Directory)

This file orchestrates the two services.

```yaml
version: '3.8'

services:
  # The user's interactive VS Code environment
  ide:
    build:
      context: ./services/ide
    ports:
      - "8080:8080" # Expose VS Code to the host machine
    volumes:
      # Mount the user's local project code into the IDE
      - ./projects:/home/coder/projects
    # The IDE needs to know how to reach the engine
    environment:
      - PANTHEON_ENGINE_URL=http://engine:5000
    depends_on:
      - engine
    restart: always

  # The secure backend engine
  engine:
    build:
      context: ./services/engine
    # The engine port is NOT exposed to the host for security
    # It is only accessible from the 'ide' container
    environment:
      # Pass the SSH key from the .env file into the container
      - GITHUB_SSH_KEY=${GITHUB_SSH_KEY}
    volumes:
      # Persist claude authentication tokens across restarts
      - claude-auth:/root/.claude
    restart: always

volumes:
  claude-auth:
```

### 4.2. `services/ide/Dockerfile`

This builds the user's VS Code environment.

```dockerfile
FROM codercom/code-server:latest

USER root

# Install Node.js and npm for the VS Code extension
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Copy the extension source code into the container
COPY ./extension /home/coder/pantheon-extension

# Install the extension's dependencies
RUN cd /home/coder/pantheon-extension && npm install

# Switch to the standard user
USER coder

# Install the extension into VS Code
# This command makes the extension available to the user
RUN code-server --install-extension /home/coder/pantheon-extension

# Start code-server, pointing to the user's project directory
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "/home/coder/projects"]
```

### 4.3. `services/engine/Dockerfile`

This builds the secure backend API.

```dockerfile
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install system dependencies: git for cloning, ssh for auth
RUN apt-get update && apt-get install -y git openssh-client

# Copy the Python requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the API server code and the secret prompts
COPY main.py .
COPY ./prompts ./prompts

# TODO: Add installation for the claude CLI here
# RUN curl -fsSL https://claude.ai/install.sh | sh || true

# Expose the internal port for the API server
EXPOSE 5000

# The command to run the API server
CMD ["flask", "run", "--host=0.0.0.0"]
```

## 5. Backend API Specification (Pantheon Engine)

### 5.1. `services/engine/requirements.txt`

```
Flask
```

### 5.2. `services/engine/main.py` (Skeleton)

This is the initial Flask server code with `TODO` markers for implementation.

```python
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/execute/git-flow', methods=['POST'])
def execute_git_flow():
    """
    Handles large-scale tasks by committing changes to a Git repo.
    """
    data = request.get_json()
    repo_url = data.get('repoUrl')
    user_command = data.get('command')

    if not repo_url or not user_command:
        return jsonify({"error": "repoUrl and command are required"}), 400

    # TODO:
    # 1. Use the GITHUB_SSH_KEY to clone the repo_url into a /tmp directory.
    # 2. Read the appropriate prompt from the ./prompts directory.
    # 3. Execute the `claude` CLI with the prompt and user_command.
    # 4. Direct claude's output to generate files inside the cloned repo.
    # 5. Run `git add`, `git commit`, and `git push`.
    # 6. Clean up the temporary directory.

    print(f"Received git-flow command: {user_command} for repo: {repo_url}")
    
    # Return a success message
    return jsonify({
        "status": "success",
        "message": f"Successfully executed command and pushed to {repo_url}"
    }), 200

@app.route('/execute/interactive-diff', methods=['POST'])
def execute_interactive_diff():
    """
    Handles real-time, in-editor code generation tasks.
    """
    data = request.get_json()
    code_snippet = data.get('code')
    user_command = data.get('command')
    file_path = data.get('filePath')

    if not code_snippet or not user_command:
        return jsonify({"error": "code and command are required"}), 400

    # TODO:
    # 1. Read the appropriate prompt from the ./prompts directory (e.g., refactor.md).
    # 2. Execute the `claude` CLI, providing the prompt and the user's code_snippet.
    # 3. Capture the output from claude. This is the new, suggested code.

    print(f"Received interactive command: {user_command}")

    # For now, return a dummy diff response
    suggested_code = "# This is the new code suggested by Pantheon\n" + code_snippet.replace("def", "def new_")

    return jsonify({
        "status": "success",
        "diff": {
            "filePath": file_path,
            "originalCode": code_snippet,
            "suggestedCode": suggested_code
        }
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

## 6. Frontend Specification (VS Code Extension)

### 6.1. `services/ide/extension/package.json`

```json
{
  "name": "pantheon-assistant",
  "displayName": "Pantheon AI Assistant",
  "version": "0.1.0",
  "description": "AI assistant for large-scale scaffolding and in-editor code generation.",
  "main": "./extension.js",
  "engines": {
    "vscode": "^1.75.0"
  },
  "activationEvents": [
    "onStartupFinished"
  ],
  "contributes": {
    "commands": [
      {
        "command": "pantheon.refactor",
        "title": "Pantheon: Refactor Selection"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "when": "editorHasSelection",
          "command": "pantheon.refactor",
          "group": "1_modification"
        }
      ]
    }
  },
  "dependencies": {
    "axios": "^1.6.8"
  }
}
```

### 6.2. `services/ide/extension/extension.js` (Skeleton)

```javascript
const vscode = require('vscode');
const axios = require('axios');

// The URL for the backend engine, accessible from within the IDE container
const PANTHEON_API_URL = process.env.PANTHEON_ENGINE_URL || 'http://engine:5000';

function activate(context) {
    console.log('Pantheon extension is now active!');

    let refactorCommand = vscode.commands.registerCommand('pantheon.refactor', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor.");
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (!selectedText) {
            vscode.window.showInformationMessage("Please select code to refactor.");
            return;
        }

        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Pantheon is thinking...",
                cancellable: true
            }, async (progress, token) => {
                // Make API call to the backend engine
                const response = await axios.post(`${PANTHEON_API_URL}/execute/interactive-diff`, {
                    command: "refactor",
                    code: selectedText,
                    filePath: editor.document.uri.fsPath
                });

                const diff = response.data.diff;

                // TODO: Implement the Diff View
                // This is a complex part. For now, we will just replace the text.
                // A real implementation would create a custom webview to show a side-by-side diff.
                
                const userResponse = await vscode.window.showInformationMessage(
                    `Pantheon suggests a change.`,
                    { modal: true },
                    "Accept", "Reject"
                );

                if (userResponse === "Accept") {
                    editor.edit(editBuilder => {
                        editBuilder.replace(selection, diff.suggestedCode);
                    });
                    vscode.window.showInformationMessage("Changes applied!");
                }
            });
        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage(`Pantheon Error: ${error.message}`);
        }
    });

    context.subscriptions.push(refactorCommand);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
```

## 7. Environment & Secrets Management

Sensitive information is managed via a `.env` file in the project root.

1.  **Create the `.env` file:**
    ```
    touch .env
    ```
2.  **Generate an SSH Key:** Create a new, dedicated SSH key for Pantheon to interact with GitHub. **Do not use your personal SSH key.**
    ```bash
    # When prompted, save the key to a file like ~/.ssh/pantheon_github
    ssh-keygen -t ed25519 -C "pantheon-engine@your-email.com"
    ```
3.  **Add Key to `.env` file:** Copy the *private key* content into the `.env` file. It must be a single line with `\n` for newlines.
    ```
    # .env
    GITHUB_SSH_KEY="-----BEGIN OPENSSH PRIVATE KEY-----\n...your key content...\n-----END OPENSSH PRIVATE KEY-----\n"
    ```
4.  **Add Deploy Key to GitHub:** Copy the *public key* (`~/.ssh/pantheon_github.pub`) and add it as a "Deploy Key" with "Allow write access" in the settings of the GitHub repository you want Pantheon to work on.

## 8. Running the Project

1.  Ensure all files from the directory structure are created with the content above.
2.  Complete the secrets setup in the `.env` file.
3.  From the root directory of the project, run:
    ```bash
    docker-compose up --build
    ```
4.  Wait for both services to build and start.
5.  Open your web browser and navigate to **http://localhost:8080**. You should see the VS Code interface.
6.  Open a terminal inside VS Code and test the extension by selecting code and running the "Pantheon: Refactor Selection" command.
