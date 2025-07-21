# Node.js .gitignore template

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Production builds
dist/
dist-ssr/
build/
out/
.next/
.nuxt/
.cache/
.parcel-cache/

# Development
*.local
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Testing
coverage/
.nyc_output/
*.lcov

# TypeScript
*.tsbuildinfo
*.tsc-*

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# Editor directories and files
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
*.swp
*.swo
*~

# Optional npm cache directory
.npm/

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Temporary files
tmp/
temp/
*.tmp

# Package manager files
package-lock.json
yarn.lock
pnpm-lock.yaml