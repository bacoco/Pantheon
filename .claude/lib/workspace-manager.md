# Workspace Manager for BACO

This library manages package creation, configuration updates, and dependency handling within monorepos.

## Overview

The workspace manager provides:
- Package creation within workspaces
- Workspace configuration updates
- Cross-package dependency management
- Shared configuration setup
- Build orchestration integration

## Core Functions

### 1. Package Creation

```typescript
interface CreatePackageOptions {
  name: string;
  type: 'app' | 'lib' | 'tool' | 'config';
  monorepoInfo: MonorepoInfo;
  template?: string;
  description?: string;
  scope?: string;
  dependencies?: string[];
  features?: PackageFeatures;
}

interface PackageFeatures {
  typescript?: boolean;
  testing?: boolean;
  linting?: boolean;
  buildTool?: 'vite' | 'webpack' | 'esbuild' | 'rollup' | 'tsc';
  framework?: string;
}

export async function createPackage(options: CreatePackageOptions): Promise<CreatePackageResult> {
  const { monorepoInfo, name, type, scope } = options;
  
  // 1. Determine package location
  const packagePath = getPackagePath(monorepoInfo, name, type);
  
  // 2. Create package directory
  await fs.mkdir(packagePath, { recursive: true });
  
  // 3. Generate package.json
  const packageJson = generatePackageJson(options);
  await fs.writeFile(
    path.join(packagePath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // 4. Update workspace configuration
  await updateWorkspaceConfig(monorepoInfo, packagePath);
  
  // 5. Create initial structure
  await createPackageStructure(packagePath, options);
  
  // 6. Setup shared configs if needed
  if (options.features?.typescript || options.features?.linting) {
    await setupSharedConfigs(monorepoInfo, packagePath, options);
  }
  
  // 7. Install dependencies
  await installPackageDependencies(monorepoInfo, packagePath);
  
  return {
    success: true,
    packagePath,
    packageName: packageJson.name,
    nextSteps: generateNextSteps(monorepoInfo, options)
  };
}
```

### 2. Package Path Resolution

```typescript
function getPackagePath(monorepoInfo: MonorepoInfo, name: string, type: PackageType): string {
  const root = monorepoInfo.root;
  
  switch (monorepoInfo.type) {
    case 'nx':
      const nxDir = type === 'app' ? 'apps' : 'libs';
      return path.join(root, nxDir, name);
    
    case 'turborepo':
    case 'pnpm':
    case 'yarn-workspaces':
      const turboDir = type === 'app' ? 'apps' : 'packages';
      return path.join(root, turboDir, name);
    
    case 'lerna':
      return path.join(root, 'packages', name);
    
    case 'rush':
      return path.join(root, 'projects', name);
    
    default:
      return path.join(root, 'packages', name);
  }
}
```

### 3. Package.json Generation

```typescript
function generatePackageJson(options: CreatePackageOptions): PackageJson {
  const { name, scope, type, description, monorepoInfo } = options;
  const packageName = scope ? `@${scope}/${name}` : name;
  
  const basePackageJson: PackageJson = {
    name: packageName,
    version: type === 'app' ? '0.1.0' : '0.0.1',
    private: type === 'app',
    description: description || `${type} package for ${name}`,
    license: 'MIT'
  };
  
  // Add type-specific fields
  switch (type) {
    case 'lib':
      Object.assign(basePackageJson, {
        main: './dist/index.js',
        module: './dist/index.mjs',
        types: './dist/index.d.ts',
        files: ['dist'],
        scripts: {
          build: 'tsup src/index.ts --format cjs,esm --dts',
          dev: 'tsup src/index.ts --format cjs,esm --dts --watch',
          test: 'vitest'
        }
      });
      break;
    
    case 'app':
      Object.assign(basePackageJson, {
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
          test: 'vitest'
        }
      });
      break;
    
    case 'config':
      Object.assign(basePackageJson, {
        main: 'index.js',
        files: ['*.js', '*.json', '*.ts']
      });
      break;
  }
  
  // Add workspace-specific fields
  if (monorepoInfo.type === 'nx') {
    basePackageJson.nx = {
      tags: [type]
    };
  }
  
  return basePackageJson;
}
```

### 4. Workspace Configuration Updates

```typescript
async function updateWorkspaceConfig(monorepoInfo: MonorepoInfo, packagePath: string): Promise<void> {
  switch (monorepoInfo.type) {
    case 'pnpm':
      await updatePnpmWorkspace(monorepoInfo.root, packagePath);
      break;
    
    case 'yarn-workspaces':
    case 'npm-workspaces':
      await updatePackageJsonWorkspaces(monorepoInfo.root, packagePath);
      break;
    
    case 'nx':
      await updateNxWorkspace(monorepoInfo.root, packagePath);
      break;
    
    case 'lerna':
      // Lerna uses glob patterns, usually no update needed
      break;
    
    case 'rush':
      await updateRushJson(monorepoInfo.root, packagePath);
      break;
  }
}

async function updatePnpmWorkspace(root: string, packagePath: string): Promise<void> {
  const workspacePath = path.join(root, 'pnpm-workspace.yaml');
  const content = await fs.readFile(workspacePath, 'utf8');
  const workspace = yaml.parse(content);
  
  const relativePath = path.relative(root, packagePath);
  const pattern = path.dirname(relativePath) + '/*';
  
  if (!workspace.packages.includes(pattern) && !workspace.packages.includes(relativePath)) {
    // Add specific path if pattern doesn't cover it
    workspace.packages.push(relativePath);
    await fs.writeFile(workspacePath, yaml.stringify(workspace));
  }
}
```

### 5. Dependency Management

```typescript
interface WorkspaceDependency {
  name: string;
  version: string;
  type: 'workspace' | 'external';
}

export async function addWorkspaceDependency(
  monorepoInfo: MonorepoInfo,
  targetPackage: string,
  dependency: string,
  options: { dev?: boolean; peer?: boolean } = {}
): Promise<void> {
  const targetPath = await findPackagePath(monorepoInfo, targetPackage);
  const depPath = await findPackagePath(monorepoInfo, dependency);
  
  if (!targetPath || !depPath) {
    throw new Error(`Package not found: ${!targetPath ? targetPackage : dependency}`);
  }
  
  const packageJsonPath = path.join(targetPath, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  
  // Determine dependency version based on monorepo type
  const depVersion = getWorkspaceDependencyVersion(monorepoInfo, dependency);
  
  // Add to appropriate dependency section
  const depKey = options.peer ? 'peerDependencies' : options.dev ? 'devDependencies' : 'dependencies';
  packageJson[depKey] = packageJson[depKey] || {};
  packageJson[depKey][dependency] = depVersion;
  
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function getWorkspaceDependencyVersion(monorepoInfo: MonorepoInfo, depName: string): string {
  switch (monorepoInfo.type) {
    case 'pnpm':
      return 'workspace:*';
    
    case 'yarn-workspaces':
      if (monorepoInfo.packageManager === 'yarn' && getYarnVersion() >= 2) {
        return 'workspace:*';
      }
      return '*'; // Yarn 1.x uses * for workspace deps
    
    case 'npm-workspaces':
      return '*';
    
    case 'nx':
      return '*'; // Nx uses TypeScript paths for imports
    
    default:
      return 'file:../' + depName;
  }
}
```

### 6. Shared Configuration Setup

```typescript
export async function setupSharedConfigs(
  monorepoInfo: MonorepoInfo,
  packagePath: string,
  options: CreatePackageOptions
): Promise<void> {
  const root = monorepoInfo.root;
  
  // Check for existing shared configs
  const sharedConfigs = await findSharedConfigs(root);
  
  if (options.features?.typescript) {
    if (sharedConfigs.typescript) {
      // Extend existing config
      await createTsConfig(packagePath, {
        extends: path.relative(packagePath, sharedConfigs.typescript)
      });
    } else {
      // Create package-specific config
      await createTsConfig(packagePath);
    }
  }
  
  if (options.features?.linting) {
    if (sharedConfigs.eslint) {
      // Create minimal config extending shared
      await createEslintConfig(packagePath, {
        extends: path.relative(packagePath, sharedConfigs.eslint)
      });
    } else {
      // Create full config
      await createEslintConfig(packagePath);
    }
  }
}

async function findSharedConfigs(root: string): Promise<SharedConfigs> {
  const configs: SharedConfigs = {};
  
  // Look for shared config packages
  const configPaths = [
    'packages/config',
    'packages/shared-config',
    'config',
    'tools/config'
  ];
  
  for (const configPath of configPaths) {
    const fullPath = path.join(root, configPath);
    if (await fs.exists(fullPath)) {
      // Check for specific configs
      if (await fs.exists(path.join(fullPath, 'tsconfig.json'))) {
        configs.typescript = path.join(fullPath, 'tsconfig.json');
      }
      if (await fs.exists(path.join(fullPath, 'eslint.config.js'))) {
        configs.eslint = path.join(fullPath, 'eslint.config.js');
      }
    }
  }
  
  // Also check root
  if (await fs.exists(path.join(root, 'tsconfig.base.json'))) {
    configs.typescript = path.join(root, 'tsconfig.base.json');
  }
  
  return configs;
}
```

### 7. Build Orchestration Integration

```typescript
export async function setupBuildOrchestration(
  monorepoInfo: MonorepoInfo,
  packageName: string,
  buildConfig: BuildConfig
): Promise<void> {
  switch (monorepoInfo.type) {
    case 'nx':
      await setupNxBuild(monorepoInfo.root, packageName, buildConfig);
      break;
    
    case 'turborepo':
      await setupTurboBuild(monorepoInfo.root, packageName, buildConfig);
      break;
    
    case 'rush':
      await setupRushBuild(monorepoInfo.root, packageName, buildConfig);
      break;
    
    default:
      // For other monorepo types, just ensure scripts are in package.json
      await ensureBuildScripts(monorepoInfo, packageName, buildConfig);
  }
}

async function setupTurboBuild(root: string, packageName: string, config: BuildConfig): Promise<void> {
  const turboPath = path.join(root, 'turbo.json');
  const turboConfig = JSON.parse(await fs.readFile(turboPath, 'utf8'));
  
  // Add package-specific pipeline if needed
  if (config.customPipeline) {
    turboConfig.pipeline = turboConfig.pipeline || {};
    turboConfig.pipeline[`${packageName}#build`] = {
      dependsOn: ['^build'],
      outputs: config.outputs || ['dist/**']
    };
  }
  
  await fs.writeFile(turboPath, JSON.stringify(turboConfig, null, 2));
}
```

### 8. Cross-Package Reference Helpers

```typescript
export function generateImportPath(
  fromPackage: string,
  toPackage: string,
  monorepoInfo: MonorepoInfo
): string {
  if (monorepoInfo.type === 'nx') {
    // Nx uses TypeScript paths
    return toPackage;
  }
  
  // For others, use package name directly
  return toPackage;
}

export async function setupTypeScriptPaths(
  monorepoInfo: MonorepoInfo,
  packageName: string
): Promise<void> {
  if (monorepoInfo.type !== 'nx') {
    // Setup TypeScript path mappings for non-Nx monorepos
    const rootTsConfig = path.join(monorepoInfo.root, 'tsconfig.json');
    
    if (await fs.exists(rootTsConfig)) {
      const tsConfig = JSON.parse(await fs.readFile(rootTsConfig, 'utf8'));
      
      tsConfig.compilerOptions = tsConfig.compilerOptions || {};
      tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {};
      
      // Add path mapping
      tsConfig.compilerOptions.paths[packageName] = [
        `./packages/${packageName}/src/index.ts`
      ];
      
      await fs.writeFile(rootTsConfig, JSON.stringify(tsConfig, null, 2));
    }
  }
}
```

## Usage Examples

### Creating a React Component Library

```typescript
await createPackage({
  name: 'ui-components',
  type: 'lib',
  scope: 'myapp',
  monorepoInfo: detectedMonorepo,
  description: 'Shared React component library',
  features: {
    typescript: true,
    testing: true,
    linting: true,
    buildTool: 'tsup',
    framework: 'react'
  },
  dependencies: ['react', 'react-dom']
});
```

### Adding Cross-Package Dependencies

```typescript
// Add shared UI library to app
await addWorkspaceDependency(
  monorepoInfo,
  '@myapp/web-app',
  '@myapp/ui-components'
);

// The import in the app would be:
// import { Button } from '@myapp/ui-components';
```

## Best Practices

1. **Respect monorepo conventions** - Use existing patterns for package locations
2. **Leverage shared configs** - Don't duplicate configuration unnecessarily  
3. **Use workspace protocols** - Ensure proper dependency resolution
4. **Setup build orchestration** - Integrate with existing build tools
5. **Maintain consistency** - Follow naming conventions and structure patterns

This workspace manager enables BACO to seamlessly create and manage packages within any monorepo structure.