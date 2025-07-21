# Nx Package Template

## Template ID: nx-package
## Description: Creates a new library or application in an Nx workspace
## Tags: monorepo, nx, package

## Package Types

### React Library

#### project.json
```json
{
  "name": "{{packageName}}",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "{{packagePath}}/src",
  "projectType": "library",
  "tags": ["scope:{{scope}}", "type:ui"],
  "targets": {
    "build": {
      "executor": "@nx/rollup:rollup",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/{{packagePath}}",
        "tsConfig": "{{packagePath}}/tsconfig.lib.json",
        "project": "{{packagePath}}/package.json",
        "entryFile": "{{packagePath}}/src/index.ts",
        "external": ["react", "react-dom"],
        "rollupConfig": "@nx/react/plugins/bundle-rollup",
        "compiler": "babel",
        "assets": [
          {
            "glob": "{{packagePath}}/README.md",
            "input": ".",
            "output": "."
          }
        ]
      }
    },
    "lint": {
      "executor": "@nx/linter:eslint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": ["{{packagePath}}/**/*.{ts,tsx,js,jsx}"]
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{{packagePath}}"],
      "options": {
        "jestConfig": "{{packagePath}}/jest.config.ts",
        "passWithNoTests": true
      },
      "configurations": {
        "ci": {
          "ci": true,
          "codeCoverage": true
        }
      }
    },
    "storybook": {
      "executor": "@nx/storybook:storybook",
      "options": {
        "port": 4400,
        "configDir": "{{packagePath}}/.storybook"
      },
      "configurations": {
        "ci": {
          "quiet": true
        }
      }
    }
  }
}
```

#### package.json
```json
{
  "name": "@{{scope}}/{{packageName}}",
  "version": "0.0.1",
  "main": "./index.js",
  "types": "./index.d.ts",
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

#### tsconfig.json
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "allowJs": false,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ]
}
```

#### tsconfig.lib.json
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "declaration": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": [
    "jest.config.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.tsx",
    "src/**/*.test.tsx"
  ]
}
```

#### jest.config.ts
```typescript
export default {
  displayName: '{{packageName}}',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/{{packagePath}}',
};
```

#### src/index.ts
```typescript
export * from './lib/{{packageName}}';
```

#### src/lib/{{packageName}}.tsx
```typescript
import React from 'react';

export interface {{PackageName}}Props {
  children?: React.ReactNode;
}

export function {{PackageName}}({ children }: {{PackageName}}Props) {
  return (
    <div>
      <h1>Welcome to {{PackageName}}!</h1>
      {children}
    </div>
  );
}

export default {{PackageName}};
```

#### src/lib/{{packageName}}.spec.tsx
```typescript
import { render } from '@testing-library/react';
import { {{PackageName}} } from './{{packageName}}';

describe('{{PackageName}}', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<{{PackageName}} />);
    expect(baseElement).toBeTruthy();
  });
});
```

### Node Library

#### project.json
```json
{
  "name": "{{packageName}}",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "{{packagePath}}/src",
  "projectType": "library",
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/{{packagePath}}",
        "main": "{{packagePath}}/src/index.ts",
        "tsConfig": "{{packagePath}}/tsconfig.lib.json",
        "assets": ["{{packagePath}}/*.md"]
      }
    },
    "lint": {
      "executor": "@nx/linter:eslint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": ["{{packagePath}}/**/*.ts"]
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{{packagePath}}"],
      "options": {
        "jestConfig": "{{packagePath}}/jest.config.ts",
        "passWithNoTests": true
      }
    }
  },
  "tags": ["scope:{{scope}}", "type:util"]
}
```

#### src/index.ts
```typescript
export * from './lib/{{packageName}}';
```

#### src/lib/{{packageName}}.ts
```typescript
export function {{camelCase packageName}}(): string {
  return '{{packageName}}';
}
```

#### src/lib/{{packageName}}.spec.ts
```typescript
import { {{camelCase packageName}} } from './{{packageName}}';

describe('{{camelCase packageName}}', () => {
  it('should work', () => {
    expect({{camelCase packageName}}()).toEqual('{{packageName}}');
  });
});
```

### Next.js App

#### project.json
```json
{
  "name": "{{appName}}",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "{{appPath}}",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/next:build",
      "outputs": ["{options.outputPath}"],
      "defaultConfiguration": "production",
      "options": {
        "outputPath": "dist/{{appPath}}"
      },
      "configurations": {
        "development": {
          "outputPath": "{{appPath}}"
        },
        "production": {}
      }
    },
    "serve": {
      "executor": "@nx/next:server",
      "defaultConfiguration": "development",
      "options": {
        "buildTarget": "{{appName}}:build",
        "dev": true
      },
      "configurations": {
        "development": {
          "buildTarget": "{{appName}}:build:development",
          "dev": true
        },
        "production": {
          "buildTarget": "{{appName}}:build:production",
          "dev": false
        }
      }
    },
    "lint": {
      "executor": "@nx/linter:eslint",
      "outputs": ["{options.outputFile}"],
      "options": {
        "lintFilePatterns": ["{{appPath}}/**/*.{ts,tsx,js,jsx}"]
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{{appPath}}"],
      "options": {
        "jestConfig": "{{appPath}}/jest.config.ts",
        "passWithNoTests": true
      }
    }
  },
  "tags": ["scope:{{scope}}", "type:app"]
}
```

#### next.config.js
```javascript
//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
```

## Usage

### Creating a React Library
```bash
nx g @nx/react:library {{packageName}} --directory={{scope}}/{{packageName}} --style=css --unitTestRunner=jest
```

### Creating a Node Library
```bash
nx g @nx/js:library {{packageName}} --directory={{scope}}/{{packageName}} --unitTestRunner=jest
```

### Creating a Next.js App
```bash
nx g @nx/next:app {{appName}} --directory=apps/{{appName}} --style=css
```

### Adding Dependencies Between Packages
```typescript
// In an app or library
import { MyComponent } from '@{{scope}}/ui-components';
import { utils } from '@{{scope}}/shared-utils';
```

### Running Commands
```bash
# Build a specific package
nx build {{packageName}}

# Test with coverage
nx test {{packageName}} --coverage

# Run affected tests
nx affected:test

# Serve an app
nx serve {{appName}}

# Build everything
nx run-many --target=build --all
```

## Features

- **Project boundaries** enforced with tags
- **Incremental builds** with Nx caching
- **Dependency graph** visualization
- **Code generators** for consistent structure
- **Shared configurations** across packages