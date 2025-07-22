# Framework Detector for BACO

This library detects project frameworks and adjusts code generation accordingly.

## Overview

The framework detector analyzes project configuration files and existing code to:
- Identify the primary framework and version
- Detect build tools and package managers
- Determine project structure conventions
- Select appropriate templates and patterns
- Configure TypeScript/JavaScript preferences

## Detection Strategy

### 1. Configuration File Analysis

#### Package.json Detection
```typescript
interface FrameworkSignatures {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

const frameworkPatterns = {
  // Frontend Frameworks
  'next.js': {
    indicators: ['next', 'react', 'react-dom'],
    configFiles: ['next.config.js', 'next.config.mjs'],
    structure: 'app-router', // or 'pages-router'
    typescript: true // Check for @types/react
  },
  
  'react': {
    indicators: ['react', 'react-dom'],
    configFiles: ['vite.config.js', 'webpack.config.js'],
    buildTool: 'vite' | 'webpack' | 'create-react-app',
    typescript: '@types/react' in devDependencies
  },
  
  'vue': {
    indicators: ['vue', '@vue/core'],
    configFiles: ['vue.config.js', 'vite.config.js'],
    version: 2 | 3, // Based on package version
    typescript: 'typescript' in devDependencies
  },
  
  'angular': {
    indicators: ['@angular/core', '@angular/common'],
    configFiles: ['angular.json'],
    structure: 'standalone' | 'modules',
    typescript: true // Always TypeScript
  },
  
  // Backend Frameworks
  'express': {
    indicators: ['express'],
    typescript: '@types/express' in devDependencies,
    orm: 'mongoose' | 'prisma' | 'sequelize' | 'typeorm',
    structure: 'mvc' | 'routes' | 'modular'
  },
  
  'fastapi': {
    indicators: ['fastapi', 'uvicorn'],
    configFiles: ['pyproject.toml', 'requirements.txt'],
    orm: 'sqlalchemy' | 'tortoise-orm',
    async: true
  },
  
  'nest.js': {
    indicators: ['@nestjs/core', '@nestjs/common'],
    configFiles: ['nest-cli.json'],
    typescript: true,
    structure: 'modular'
  },
  
  // Full-Stack
  'remix': {
    indicators: ['@remix-run/node', '@remix-run/react'],
    configFiles: ['remix.config.js'],
    typescript: true
  },
  
  'nuxt': {
    indicators: ['nuxt', 'nuxt3'],
    configFiles: ['nuxt.config.ts', 'nuxt.config.js'],
    version: 2 | 3,
    typescript: 'nuxt.config.ts' exists
  }
};
```

### 2. Project Structure Detection

#### Directory Patterns
```typescript
const structurePatterns = {
  'next-app-router': {
    directories: ['app', 'public'],
    files: ['app/layout.tsx', 'app/page.tsx']
  },
  
  'next-pages-router': {
    directories: ['pages', 'public'],
    files: ['pages/_app.tsx', 'pages/index.tsx']
  },
  
  'express-mvc': {
    directories: ['controllers', 'models', 'routes', 'views'],
    files: ['app.js', 'server.js']
  },
  
  'express-modular': {
    directories: ['src/modules', 'src/common'],
    files: ['src/main.ts', 'src/app.ts']
  },
  
  'monorepo': {
    directories: ['packages', 'apps'],
    files: ['pnpm-workspace.yaml', 'lerna.json', 'nx.json']
  }
};
```

### 3. Build Tool Detection

```typescript
const buildTools = {
  'vite': {
    configFile: 'vite.config.js',
    scripts: { dev: 'vite', build: 'vite build' }
  },
  
  'webpack': {
    configFile: 'webpack.config.js',
    scripts: { build: 'webpack' }
  },
  
  'turbo': {
    configFile: 'turbo.json',
    scripts: { dev: 'turbo dev', build: 'turbo build' }
  },
  
  'nx': {
    configFile: 'nx.json',
    scripts: { affected: 'nx affected' }
  }
};
```

## Framework Detection Implementation

### Core Detector Function
```typescript
export async function detectFramework(projectPath: string): Promise<FrameworkInfo> {
  const frameworkInfo: FrameworkInfo = {
    primary: null,
    secondary: [],
    language: 'javascript',
    packageManager: 'npm',
    buildTool: null,
    structure: 'standard',
    features: []
  };

  // 1. Check package.json
  const packageJson = await readPackageJson(projectPath);
  if (packageJson) {
    frameworkInfo.packageManager = detectPackageManager(projectPath);
    frameworkInfo.primary = detectPrimaryFramework(packageJson);
    frameworkInfo.language = detectLanguage(packageJson);
    frameworkInfo.features = detectFeatures(packageJson);
  }

  // 2. Check project structure
  frameworkInfo.structure = await detectProjectStructure(projectPath);

  // 3. Check for monorepo
  if (await isMonorepo(projectPath)) {
    frameworkInfo.structure = 'monorepo';
    frameworkInfo.buildTool = detectMonorepoTool(projectPath);
  }

  // 4. Detect ORM/Database
  if (frameworkInfo.primary === 'express' || frameworkInfo.primary === 'nest.js') {
    frameworkInfo.orm = detectORM(packageJson);
  }

  return frameworkInfo;
}
```

### Package Manager Detection
```typescript
function detectPackageManager(projectPath: string): PackageManager {
  if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(projectPath, 'package-lock.json'))) return 'npm';
  if (fs.existsSync(path.join(projectPath, 'bun.lockb'))) return 'bun';
  return 'npm'; // default
}
```

## Framework-Specific Configurations

### Next.js Configuration
```typescript
const nextjsConfig = {
  'app-router': {
    structure: {
      'src/app': ['layout.tsx', 'page.tsx', 'error.tsx', 'loading.tsx'],
      'src/components': [],
      'src/lib': [],
      'public': []
    },
    tsconfig: {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        jsx: 'preserve',
        plugins: [{ name: 'next' }]
      }
    }
  }
};
```

### Express Configuration
```typescript
const expressConfig = {
  'typescript': {
    structure: {
      'src': ['app.ts', 'server.ts'],
      'src/routes': [],
      'src/controllers': [],
      'src/models': [],
      'src/middleware': [],
      'src/utils': [],
      'src/types': []
    },
    tsconfig: {
      compilerOptions: {
        target: 'es2020',
        module: 'commonjs',
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true
      }
    }
  }
};
```

## Integration with BACO

### Template Selection Based on Framework
```typescript
export function selectTemplatesForFramework(
  framework: FrameworkInfo,
  features: string[]
): TemplateSelection[] {
  const templates: TemplateSelection[] = [];

  // Base framework templates
  switch (framework.primary) {
    case 'next.js':
      if (features.includes('forms')) {
        templates.push({
          name: 'dynamic-form-app-router',
          customization: { typescript: framework.language === 'typescript' }
        });
      }
      break;
      
    case 'express':
      if (features.includes('auth')) {
        templates.push({
          name: 'jwt-auth-express',
          customization: { 
            typescript: framework.language === 'typescript',
            orm: framework.orm
          }
        });
      }
      if (features.includes('crud')) {
        templates.push({
          name: 'rest-api-crud',
          customization: { orm: framework.orm }
        });
      }
      break;
  }

  // Always include error handling
  templates.push({
    name: framework.primary?.includes('react') || framework.primary?.includes('next')
      ? 'react-error-boundary'
      : 'global-error-handler'
  });

  return templates;
}
```

### Code Style Adjustment
```typescript
export function adjustCodeStyle(
  code: string,
  framework: FrameworkInfo
): string {
  let adjusted = code;

  // Import style
  if (framework.language === 'typescript' && framework.primary === 'express') {
    // Convert to ES modules if needed
    adjusted = adjusted.replace(
      /const (\w+) = require\(['"](.+)['"]\)/g,
      'import $1 from \'$2\''
    );
  }

  // File extensions
  if (framework.language === 'typescript') {
    adjusted = adjusted.replace(/\.js'/g, '.ts\'');
    adjusted = adjusted.replace(/\.jsx'/g, '.tsx\'');
  }

  // Framework-specific patterns
  if (framework.primary === 'next.js' && framework.structure === 'app-router') {
    // Add 'use client' directive where needed
    if (code.includes('useState') || code.includes('useEffect')) {
      adjusted = '\'use client\';\n\n' + adjusted;
    }
  }

  return adjusted;
}
```

## Project Initialization

### Scaffold Project Structure
```typescript
export async function scaffoldProject(
  projectPath: string,
  framework: FrameworkInfo
): Promise<void> {
  const config = getFrameworkConfig(framework);
  
  // Create directories
  for (const [dir, files] of Object.entries(config.structure)) {
    const dirPath = path.join(projectPath, dir);
    await fs.mkdir(dirPath, { recursive: true });
    
    // Create initial files
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const content = getInitialFileContent(framework, file);
      await fs.writeFile(filePath, content);
    }
  }
  
  // Create configuration files
  if (framework.language === 'typescript') {
    await createTsConfig(projectPath, config.tsconfig);
  }
  
  // Create environment files
  await createEnvFiles(projectPath, framework);
  
  // Create ignore files
  await createGitignore(projectPath, framework);
}
```

## Usage in BACO Commands

### During `/baco init`
```typescript
// After user provides project details
const framework = await detectFramework(projectPath);

// If no framework detected, ask user
if (!framework.primary) {
  framework.primary = await promptFrameworkSelection();
}

// Scaffold project
await scaffoldProject(projectPath, framework);

// Store in session
session.framework = framework;
```

### During `/baco execute`
```typescript
// Use framework info for template selection
const templates = selectTemplatesForFramework(
  session.framework,
  parsedFeatures
);

// Adjust generated code
for (const file of generatedFiles) {
  file.content = adjustCodeStyle(file.content, session.framework);
}
```

## Best Practices

1. **Always detect before generating** - Never assume framework
2. **Respect existing structure** - Don't override user's setup
3. **Provide sensible defaults** - But allow customization
4. **Version awareness** - Handle framework version differences
5. **Migration support** - Help upgrade between versions