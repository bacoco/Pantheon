# pnpm Workspace Template

## Template ID: pnpm-workspace
## Description: Sets up a pnpm workspace monorepo structure
## Tags: monorepo, pnpm, workspace

## Files

### pnpm-workspace.yaml
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'
```

### package.json (root)
```json
{
  "name": "{{workspaceName}}",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@8.14.0",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo build --filter='./packages/*' && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.1",
    "@types/node": "^20.11.0",
    "prettier": "^3.2.4",
    "turbo": "^1.11.3",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

### .gitignore
```gitignore
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Production
build
dist
.next
out

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Local env files
.env*.local
.env

# Turbo
.turbo

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
```

### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

### tsconfig.json (root)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "dom", "dom.iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": true,
    "jsx": "preserve",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "newLine": "lf",
    "incremental": true
  },
  "exclude": ["node_modules", "dist", "build", ".next", ".turbo"]
}
```

### packages/tsconfig/base.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "composite": false,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "inlineSources": false,
    "isolatedModules": true,
    "moduleResolution": "node",
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true
  },
  "exclude": ["node_modules"]
}
```

### packages/tsconfig/nextjs.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  "compilerOptions": {
    "allowJs": true,
    "declaration": false,
    "declarationMap": false,
    "incremental": true,
    "jsx": "preserve",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "noEmit": true,
    "resolveJsonModule": true,
    "strict": true,
    "target": "es5"
  }
}
```

### packages/tsconfig/react-library.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "React Library",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2015", "DOM"],
    "module": "ESNext",
    "target": "es6"
  }
}
```

### packages/tsconfig/package.json
```json
{
  "name": "@{{scope}}/tsconfig",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "files": ["base.json", "nextjs.json", "react-library.json"]
}
```

### .changeset/config.json
```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### .vscode/settings.json
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "eslint.workingDirectories": [
    {
      "mode": "auto"
    }
  ]
}
```

## Structure

```
{{workspaceName}}/
├── apps/
│   └── .gitkeep
├── packages/
│   └── tsconfig/
│       ├── base.json
│       ├── nextjs.json
│       ├── react-library.json
│       └── package.json
├── .changeset/
│   └── config.json
├── .vscode/
│   └── settings.json
├── pnpm-workspace.yaml
├── package.json
├── turbo.json
├── tsconfig.json
├── .gitignore
├── .prettierrc
└── README.md
```

## Usage

1. **Initialize workspace**:
   ```bash
   pnpm install
   ```

2. **Create a new app**:
   ```bash
   cd apps
   pnpm create next-app@latest my-app --typescript --tailwind --app
   ```

3. **Create a new package**:
   ```bash
   cd packages
   mkdir ui-components
   cd ui-components
   pnpm init
   ```

4. **Add workspace dependency**:
   ```json
   {
     "dependencies": {
       "@{{scope}}/ui-components": "workspace:*"
     }
   }
   ```

5. **Run all apps in dev mode**:
   ```bash
   pnpm dev
   ```

## Features

- **Turborepo** for build orchestration and caching
- **Changesets** for version management
- **TypeScript** configurations for different project types
- **pnpm workspaces** for efficient dependency management
- **Shared ESLint and Prettier** configurations
- **VS Code** integration