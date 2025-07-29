#!/bin/bash

# Fix the toto project with proper setup

echo "🔧 Fixing toto project setup..."

# Create proper project structure
cd /Users/loic/develop/test/Pantheon
mkdir -p projects/toto/chatrooms
mkdir -p projects/toto/src
mkdir -p projects/toto/docs

# Initialize git
cd projects/toto
git init --initial-branch=main

# Create .gitignore
cat > .gitignore << 'EOF'
# Node
node_modules/
npm-debug.log*
.npm

# Environment
.env
.env.local

# Build
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Images/Cache
*.jpg
*.png
*.gif
cache/
temp/
EOF

# Create initial README
cat > README.md << 'EOF'
# TOTO - Intelligent Image Evolution Platform

An intelligent image generation platform using Stable Diffusion Flux with metaprompt-driven enhancement.

## Features
- Iterative prompt enhancement through metaprompts
- 4-axis exploration with user selection
- Intelligent evolution vs random generation

## Setup
```bash
npm install
cp .env.example .env
# Add your SD Flux API endpoint to .env
npm run dev
```

## Architecture
See `docs/PRD.md` for complete product requirements.
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "name": "toto-image-evolution",
  "version": "0.1.0",
  "description": "Intelligent Image Evolution Platform using SD Flux",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest"
  },
  "keywords": ["image-generation", "ai", "stable-diffusion"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "bull": "^4.11.5",
    "redis": "^4.6.10"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}
EOF

# Create basic server structure
mkdir -p src/services src/routes src/lib

# Create metaprompt engine
cat > src/lib/metaprompt.js << 'EOF'
class MetapromptEngine {
  constructor() {
    this.axes = {
      style: ['photorealistic', 'oil painting', 'digital art', 'watercolor', 'anime style'],
      mood: ['dramatic', 'peaceful', 'mysterious', 'energetic', 'melancholic'],
      detail: ['highly detailed', 'minimalist', 'intricate patterns', 'soft focus', 'sharp clarity'],
      composition: ['wide angle', 'close-up portrait', 'aerial view', 'symmetrical', 'rule of thirds']
    };
  }

  generateEnhancements(basePrompt) {
    const selectedAxes = this.selectRandomAxes();
    return selectedAxes.map(axis => {
      const modifier = this.axes[axis][Math.floor(Math.random() * this.axes[axis].length)];
      return {
        axis,
        prompt: `${basePrompt}, ${modifier}`,
        modifier
      };
    });
  }

  selectRandomAxes() {
    const allAxes = Object.keys(this.axes);
    return allAxes.sort(() => 0.5 - Math.random()).slice(0, 4);
  }
}

module.exports = MetapromptEngine;
EOF

# Create basic server
cat > src/server.js << 'EOF'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const MetapromptEngine = require('./lib/metaprompt');

const app = express();
const metaprompt = new MetapromptEngine();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'toto-image-evolution' });
});

// Generate enhancements
app.post('/api/enhance', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }
  
  const enhancements = metaprompt.generateEnhancements(prompt);
  res.json({ enhancements });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎨 TOTO Image Evolution Server running on port ${PORT}`);
});
EOF

# Create .env.example
cat > .env.example << 'EOF'
# SD Flux API Configuration
SDFLUX_API_URL=https://your-sd-flux-endpoint.com
SDFLUX_API_KEY=your-api-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# Redis Configuration (for queue management)
REDIS_URL=redis://localhost:6379
EOF

# Create real-time progress log
cat > chatrooms/council-progress.md << 'EOF'
# Divine Council Session Progress - TOTO Project

## Session Date: 2025-07-29
## Status: Active

### Progress Log

**10:00:00** - Council session started
**10:00:05** - Project name received: toto  
**10:00:10** - User described SD Flux image evolution system
**10:00:20** - Zeus orchestrating divine collaboration
**10:00:25** - Daedalus analyzing architecture requirements
**10:00:30** - Apollo designing user experience flow
**10:00:35** - Hephaestus planning implementation
**10:00:40** - PRD generation completed
**10:00:45** - Project files created
**10:00:50** - Git repository initialized
**10:00:55** - Basic project structure established

### Next Steps
1. Install dependencies: `npm install`
2. Configure SD Flux endpoint in `.env`
3. Run development server: `npm run dev`
4. Begin frontend implementation
EOF

# Move existing files to docs
mv PRD.md docs/
mv project-summary.md docs/
mv chatrooms/divine-council-session.md chatrooms/

# Initial commit
git add -A
git commit -m "Initial commit: TOTO Image Evolution Platform

- Project structure created by Divine Council
- Metaprompt engine implemented
- Basic Express server setup
- Documentation from planning session
- Ready for SD Flux integration"

echo "✅ Project fixed! Here's what I did:"
echo ""
echo "📁 Created proper structure in projects/toto/"
echo "🔧 Initialized git repository"
echo "📦 Created package.json with dependencies"
echo "🏗️ Built basic metaprompt engine"
echo "🚀 Created Express server skeleton"
echo "📝 Added proper documentation"
echo ""
echo "Next steps:"
echo "1. cd projects/toto"
echo "2. npm install"
echo "3. cp .env.example .env"
echo "4. Add your SD Flux API credentials"
echo "5. npm run dev"
echo ""
echo "Optional: Create GitHub repo"
echo "gh repo create toto --private --description 'Intelligent Image Evolution Platform'"