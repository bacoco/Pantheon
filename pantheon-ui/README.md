# Pantheon UI - Chat Interface for Pantheon

A modern web-based chat interface for Pantheon (Beyond Automated Context Orchestrator) that provides an intuitive way to interact with Claude Code Max while maintaining all its powerful capabilities.

## 🎯 Vision

Transform Pantheon from a CLI-based tool to a modern web interface that:
- Provides an intuitive chat-based interaction model
- Visualizes project structure and progress in real-time
- Maintains full Claude Code Max capabilities
- Offers better UX for both technical and non-technical users
- Enables easier project management and multi-project workflows

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser UI    │────▶│  API Bridge      │────▶│  Claude Code    │
│  (React/Vite)   │◀────│ (Node.js/Express)│◀────│   (CLI Mode)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
       HTTP                  WebSocket               Child Process
```

## 📁 Project Structure

```
baco-ui/
├── apps/
│   ├── web/                 # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utilities and API client
│   │   │   └── pages/       # Main application pages
│   │   └── package.json
│   │
│   └── bridge/              # Node.js backend server
│       ├── src/
│       │   ├── api/         # REST API endpoints
│       │   ├── claude/      # Claude Code integration layer
│       │   ├── websocket/   # Real-time communication
│       │   └── index.ts     # Server entry point
│       └── package.json
│
├── packages/
│   ├── ui/                  # Shared UI component library
│   └── types/               # Shared TypeScript definitions
│
└── docs/                    # Documentation
```

## 🚀 Features

### Phase 1: MVP (Weeks 1-2)
- ✨ **Chat Interface**: Natural language interaction with Pantheon
- 🔄 **Real-time Updates**: Live streaming of command output
- 📝 **Command Execution**: Support for all Pantheon commands
- 🎯 **Natural Language Processing**: Convert chat to Pantheon commands

### Phase 2: Enhanced (Weeks 3-4)
- 📁 **Project Explorer**: Visual file tree with Git status
- 📊 **Progress Tracking**: Visual indicators for task completion
- 🐳 **Docker Integration**: Container status and management
- 🔍 **Code Preview**: View generated files inline

### Phase 3: Advanced (Weeks 5-6)
- 🚀 **Multi-Project Support**: Manage multiple Pantheon projects
- 🛠️ **Command Builder**: Visual command construction
- ⚙️ **Settings Panel**: Configure preferences and Claude Code path
- 📱 **Responsive Design**: Mobile and tablet support

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Zustand** - State management
- **Socket.io-client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.io** - WebSocket server
- **SQLite** - Session storage
- **Child Process** - Claude Code execution

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Claude Code CLI installed and configured
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/bacoco/Pantheon.git
cd Pantheon
git checkout baco-ui

# Navigate to baco-ui directory
cd baco-ui

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Configuration

Create a `.env` file in the `apps/bridge` directory:

```env
CLAUDE_CODE_PATH=/usr/local/bin/claude
PORT=3001
DATABASE_PATH=./sessions.db
```

## 🧪 Development

### Running the Frontend
```bash
cd apps/web
pnpm dev
# Opens at http://localhost:5173
```

### Running the Backend
```bash
cd apps/bridge
pnpm dev
# API server at http://localhost:3001
```

### Building for Production
```bash
# From root directory
pnpm build

# Start production servers
pnpm start
```

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Submit a pull request

## 🎯 Roadmap

- [x] Initial project setup
- [ ] Basic chat interface
- [ ] Claude Code bridge implementation
- [ ] Real-time output streaming
- [ ] File explorer component
- [ ] Docker integration
- [ ] Multi-project support
- [ ] VS Code extension
- [ ] Collaborative features

## 📄 License

This project is part of Pantheon and follows the same license.

## 🙏 Acknowledgments

- Inspired by [Vibe Kanban](https://github.com/skorokithakis/vibe-kanban) architecture
- Built with Claude Code Max integration in mind
- Designed for the Pantheon community

---

*Building the future of AI-assisted development, one chat at a time* 🚀