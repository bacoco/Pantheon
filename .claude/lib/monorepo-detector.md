# Monorepo Detector for BACO

This library provides comprehensive monorepo detection and analysis capabilities.

## Overview

The monorepo detector identifies:
- Monorepo tool type (npm/yarn/pnpm workspaces, Nx, Lerna, Rush, Turborepo)
- Workspace configuration and structure
- Existing packages and applications
- Shared configuration patterns
- Dependency management approach

## Detection Functions

### 1. Main Detection Function

```typescript
interface MonorepoInfo {
  type: 'npm-workspaces' | 'yarn-workspaces' | 'pnpm' | 'nx' | 'lerna' | 'rush' | 'turborepo' | null;
  root: string;
  configFile: string;
  packages: PackageInfo[];
  workspacePatterns: string[];
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'rush';
  features: MonorepoFeatures;
}

interface PackageInfo {
  name: string;
  path: string;
  type: 'app' | 'lib' | 'tool' | 'config';
  version?: string;
  dependencies?: string[];
}

interface MonorepoFeatures {
  sharedConfigs: boolean;
  buildCaching: boolean;
  taskOrchestration: boolean;
  versionManagement: boolean;
  publishingSupport: boolean;
}

export async function detectMonorepo(projectPath: string): Promise<MonorepoInfo | null> {
  // Check for monorepo indicators
  const checks = [
    checkNxWorkspace,
    checkPnpmWorkspace,
    checkYarnWorkspaces,
    checkNpmWorkspaces,
    checkLerna,
    checkRush,
    checkTurborepo
  ];
  
  for (const check of checks) {
    const result = await check(projectPath);
    if (result) return result;
  }
  
  return null;
}
```

### 2. Tool-Specific Detectors

#### Nx Detection
```typescript
async function checkNxWorkspace(projectPath: string): Promise<MonorepoInfo | null> {
  const nxJsonPath = path.join(projectPath, 'nx.json');
  const workspaceJsonPath = path.join(projectPath, 'workspace.json');
  
  if (fs.existsSync(nxJsonPath)) {
    const nxConfig = JSON.parse(fs.readFileSync(nxJsonPath, 'utf8'));
    const packages = await findNxProjects(projectPath);
    
    return {
      type: 'nx',
      root: projectPath,
      configFile: 'nx.json',
      packages,
      workspacePatterns: ['apps/*', 'libs/*', 'packages/*'],
      packageManager: detectNxPackageManager(projectPath),
      features: {
        sharedConfigs: true,
        buildCaching: true,
        taskOrchestration: true,
        versionManagement: false,
        publishingSupport: true
      }
    };
  }
  
  return null;
}

async function findNxProjects(root: string): Promise<PackageInfo[]> {
  const projects: PackageInfo[] = [];
  const projectDirs = ['apps', 'libs', 'packages'];
  
  for (const dir of projectDirs) {
    const dirPath = path.join(root, dir);
    if (fs.existsSync(dirPath)) {
      const subdirs = fs.readdirSync(dirPath);
      for (const subdir of subdirs) {
        const projectPath = path.join(dirPath, subdir);
        const projectJson = path.join(projectPath, 'project.json');
        
        if (fs.existsSync(projectJson)) {
          const config = JSON.parse(fs.readFileSync(projectJson, 'utf8'));
          projects.push({
            name: config.name || subdir,
            path: path.relative(root, projectPath),
            type: dir === 'apps' ? 'app' : 'lib',
            version: config.version
          });
        }
      }
    }
  }
  
  return projects;
}
```

#### pnpm Workspace Detection
```typescript
async function checkPnpmWorkspace(projectPath: string): Promise<MonorepoInfo | null> {
  const workspaceYaml = path.join(projectPath, 'pnpm-workspace.yaml');
  
  if (fs.existsSync(workspaceYaml)) {
    const content = fs.readFileSync(workspaceYaml, 'utf8');
    const workspace = yaml.parse(content);
    const packages = await findWorkspacePackages(projectPath, workspace.packages);
    
    return {
      type: 'pnpm',
      root: projectPath,
      configFile: 'pnpm-workspace.yaml',
      packages,
      workspacePatterns: workspace.packages || [],
      packageManager: 'pnpm',
      features: {
        sharedConfigs: true,
        buildCaching: false,
        taskOrchestration: false,
        versionManagement: false,
        publishingSupport: true
      }
    };
  }
  
  return null;
}
```

#### Yarn Workspaces Detection
```typescript
async function checkYarnWorkspaces(projectPath: string): Promise<MonorepoInfo | null> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.workspaces) {
      const patterns = Array.isArray(packageJson.workspaces) 
        ? packageJson.workspaces 
        : packageJson.workspaces.packages || [];
      
      const packages = await findWorkspacePackages(projectPath, patterns);
      
      return {
        type: 'yarn-workspaces',
        root: projectPath,
        configFile: 'package.json',
        packages,
        workspacePatterns: patterns,
        packageManager: 'yarn',
        features: {
          sharedConfigs: true,
          buildCaching: false,
          taskOrchestration: false,
          versionManagement: false,
          publishingSupport: true
        }
      };
    }
  }
  
  return null;
}
```

#### Turborepo Detection
```typescript
async function checkTurborepo(projectPath: string): Promise<MonorepoInfo | null> {
  const turboJsonPath = path.join(projectPath, 'turbo.json');
  
  if (fs.existsSync(turboJsonPath)) {
    const turboConfig = JSON.parse(fs.readFileSync(turboJsonPath, 'utf8'));
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
    
    // Turborepo uses workspace patterns from package manager
    const patterns = packageJson.workspaces || ['apps/*', 'packages/*'];
    const packages = await findWorkspacePackages(projectPath, patterns);
    
    return {
      type: 'turborepo',
      root: projectPath,
      configFile: 'turbo.json',
      packages,
      workspacePatterns: Array.isArray(patterns) ? patterns : patterns.packages || [],
      packageManager: detectPackageManager(projectPath),
      features: {
        sharedConfigs: true,
        buildCaching: true,
        taskOrchestration: true,
        versionManagement: false,
        publishingSupport: false
      }
    };
  }
  
  return null;
}
```

### 3. Workspace Package Discovery

```typescript
async function findWorkspacePackages(root: string, patterns: string[]): Promise<PackageInfo[]> {
  const packages: PackageInfo[] = [];
  
  for (const pattern of patterns) {
    const matches = glob.sync(pattern, { cwd: root });
    
    for (const match of matches) {
      const packagePath = path.join(root, match);
      const packageJsonPath = path.join(packagePath, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        packages.push({
          name: packageJson.name,
          path: match,
          type: detectPackageType(packageJson, match),
          version: packageJson.version,
          dependencies: extractLocalDependencies(packageJson, packages)
        });
      }
    }
  }
  
  return packages;
}

function detectPackageType(packageJson: any, packagePath: string): 'app' | 'lib' | 'tool' | 'config' {
  // Apps typically have build/start scripts and no main/module exports
  if (packageJson.scripts?.start || packageJson.scripts?.dev) {
    return 'app';
  }
  
  // Config packages often have specific names
  if (packagePath.includes('config') || packageJson.name?.includes('config')) {
    return 'config';
  }
  
  // Tools have bin entries
  if (packageJson.bin) {
    return 'tool';
  }
  
  // Libraries export code
  if (packageJson.main || packageJson.module || packageJson.exports) {
    return 'lib';
  }
  
  return 'lib'; // Default to library
}
```

### 4. Monorepo Context Analysis

```typescript
export async function analyzeMonorepoContext(projectPath: string): Promise<MonorepoContext> {
  const monorepoInfo = await detectMonorepo(projectPath);
  
  if (!monorepoInfo) {
    // Check if we're inside a monorepo package
    const parentInfo = await findMonorepoRoot(projectPath);
    if (parentInfo) {
      return {
        isMonorepo: true,
        isRoot: false,
        currentPackage: detectCurrentPackage(projectPath, parentInfo),
        monorepoInfo: parentInfo
      };
    }
    
    return {
      isMonorepo: false,
      isRoot: false,
      currentPackage: null,
      monorepoInfo: null
    };
  }
  
  return {
    isMonorepo: true,
    isRoot: true,
    currentPackage: null,
    monorepoInfo
  };
}

async function findMonorepoRoot(startPath: string): Promise<MonorepoInfo | null> {
  let currentPath = startPath;
  
  // Walk up directory tree looking for monorepo indicators
  while (currentPath !== path.dirname(currentPath)) {
    const info = await detectMonorepo(currentPath);
    if (info) return info;
    
    currentPath = path.dirname(currentPath);
  }
  
  return null;
}
```

## Usage in BACO Commands

### Integration with /baco init

```typescript
// In /baco init command
const monorepoContext = await analyzeMonorepoContext(process.cwd());

if (monorepoContext.isMonorepo) {
  if (monorepoContext.isRoot) {
    // At monorepo root
    console.log(`🏗️ Detected ${monorepoContext.monorepoInfo.type} monorepo`);
    console.log(`📦 Found ${monorepoContext.monorepoInfo.packages.length} existing packages`);
    
    // Offer options to create new package or work at root
  } else {
    // Inside a package
    console.log(`📦 Working in package: ${monorepoContext.currentPackage.name}`);
    console.log(`🏗️ Part of ${monorepoContext.monorepoInfo.type} monorepo`);
    
    // Offer to create feature within current package
  }
}
```

### Workspace Pattern Helpers

```typescript
export function getWorkspacePattern(type: string, category: 'app' | 'lib' | 'tool'): string {
  const patterns = {
    'nx': {
      app: 'apps',
      lib: 'libs',
      tool: 'tools'
    },
    'pnpm': {
      app: 'apps',
      lib: 'packages',
      tool: 'packages'
    },
    'turborepo': {
      app: 'apps',
      lib: 'packages',
      tool: 'packages'
    },
    default: {
      app: 'packages',
      lib: 'packages',
      tool: 'packages'
    }
  };
  
  return patterns[type]?.[category] || patterns.default[category];
}

export function generatePackageName(baseName: string, scope?: string): string {
  if (scope) {
    return `@${scope}/${baseName}`;
  }
  return baseName;
}
```

## Best Practices

1. **Always check parent directories** - Users might run BACO from within a package
2. **Respect existing conventions** - Use the monorepo's established patterns
3. **Handle missing configs gracefully** - Some monorepos use minimal configuration
4. **Support incremental adoption** - Allow adding monorepo support to existing projects
5. **Preserve tool-specific features** - Don't override Nx generators, Turbo tasks, etc.

## Error Handling

```typescript
export async function safeDetectMonorepo(projectPath: string): Promise<MonorepoInfo | null> {
  try {
    return await detectMonorepo(projectPath);
  } catch (error) {
    console.warn('⚠️ Error detecting monorepo structure:', error.message);
    return null;
  }
}
```

This detector provides the foundation for BACO's monorepo support, enabling intelligent project creation and management within complex workspace structures.