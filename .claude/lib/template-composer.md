# Template Composer for BACO

This library handles the composition of multiple templates, resolves import paths, and automatically pairs code templates with their corresponding test templates.

## Overview

The template composer solves three critical issues:
1. **Template Composition**: Seamlessly integrates multiple templates that need to work together
2. **Import Path Resolution**: Fixes relative imports when templates are combined
3. **Test Template Pairing**: Automatically selects appropriate test templates for code templates

## Template Composition Architecture

### 1. Template Metadata Structure

```typescript
interface TemplateMetadata {
  id: string;
  name: string;
  category: 'auth' | 'crud' | 'api' | 'ui' | 'data' | 'error' | 'test';
  tags: string[];
  dependencies?: string[]; // Other template IDs this depends on
  conflicts?: string[]; // Template IDs that conflict with this one
  testTemplate?: string; // ID of corresponding test template
  mergeStrategy?: 'replace' | 'append' | 'merge' | 'wrap';
  targetFiles: TargetFile[];
}

interface TargetFile {
  path: string;
  type: 'new' | 'modify' | 'extend';
  section?: string; // For partial modifications
  importPath?: string; // Override import path
}

// Example metadata
const jwtAuthMetadata: TemplateMetadata = {
  id: 'jwt-auth-express',
  name: 'JWT Authentication for Express',
  category: 'auth',
  tags: ['authentication', 'jwt', 'express', 'security'],
  testTemplate: 'jwt-auth-testing',
  mergeStrategy: 'merge',
  targetFiles: [
    { path: 'src/middleware/auth.ts', type: 'new' },
    { path: 'src/routes/auth.ts', type: 'new' },
    { path: 'src/app.ts', type: 'modify', section: 'middleware' },
    { path: 'src/types/auth.ts', type: 'new' }
  ]
};
```

### 2. Template Composition Engine

```typescript
export class TemplateComposer {
  private templates: Map<string, Template> = new Map();
  private metadata: Map<string, TemplateMetadata> = new Map();
  private compositionGraph: DependencyGraph = new DependencyGraph();
  
  async composeTemplates(
    templateIds: string[],
    context: CompositionContext
  ): Promise<ComposedResult> {
    // 1. Load templates and metadata
    const templates = await this.loadTemplates(templateIds);
    
    // 2. Resolve dependencies and check conflicts
    const resolved = this.resolveDependencies(templates);
    this.checkConflicts(resolved);
    
    // 3. Build composition order
    const order = this.compositionGraph.topologicalSort(resolved);
    
    // 4. Create file map for composition
    const fileMap = new Map<string, FileComposition>();
    
    // 5. Apply templates in order
    for (const templateId of order) {
      const template = this.templates.get(templateId)!;
      const metadata = this.metadata.get(templateId)!;
      
      await this.applyTemplate(template, metadata, fileMap, context);
    }
    
    // 6. Resolve import paths
    this.resolveImportPaths(fileMap, context);
    
    // 7. Generate test files
    const testFiles = await this.generateTests(fileMap, resolved);
    
    // 8. Merge test files into result
    for (const [path, content] of testFiles) {
      fileMap.set(path, { content, type: 'test' });
    }
    
    return {
      files: fileMap,
      dependencies: this.collectDependencies(resolved),
      warnings: this.collectWarnings(fileMap)
    };
  }
  
  private async applyTemplate(
    template: Template,
    metadata: TemplateMetadata,
    fileMap: Map<string, FileComposition>,
    context: CompositionContext
  ): Promise<void> {
    for (const target of metadata.targetFiles) {
      const content = await this.processTemplateContent(
        template,
        target,
        context
      );
      
      if (target.type === 'new') {
        // Create new file
        fileMap.set(target.path, {
          content,
          type: 'code',
          imports: this.extractImports(content),
          exports: this.extractExports(content)
        });
      } else if (target.type === 'modify') {
        // Modify existing file
        const existing = fileMap.get(target.path);
        if (existing) {
          existing.content = this.mergeContent(
            existing.content,
            content,
            metadata.mergeStrategy,
            target.section
          );
        }
      } else if (target.type === 'extend') {
        // Extend existing file
        const existing = fileMap.get(target.path);
        if (existing) {
          existing.content = this.extendContent(
            existing.content,
            content,
            target.section
          );
        }
      }
    }
  }
}
```

### 3. Import Path Resolution

```typescript
interface ImportResolver {
  resolve(
    fileMap: Map<string, FileComposition>,
    context: CompositionContext
  ): void;
}

export class SmartImportResolver implements ImportResolver {
  resolve(
    fileMap: Map<string, FileComposition>,
    context: CompositionContext
  ): void {
    // Build export map
    const exportMap = this.buildExportMap(fileMap);
    
    // Process each file
    for (const [filePath, composition] of fileMap) {
      if (composition.type !== 'code') continue;
      
      // Parse imports
      const imports = this.parseImports(composition.content);
      
      // Resolve each import
      for (const imp of imports) {
        if (imp.isRelative) {
          const resolved = this.resolveRelativePath(
            filePath,
            imp.path,
            exportMap,
            context
          );
          
          if (resolved !== imp.path) {
            composition.content = composition.content.replace(
              imp.original,
              imp.original.replace(imp.path, resolved)
            );
          }
        }
      }
      
      // Add missing imports
      const missingImports = this.findMissingImports(
        composition,
        exportMap,
        context
      );
      
      if (missingImports.length > 0) {
        composition.content = this.addImports(
          composition.content,
          missingImports
        );
      }
    }
  }
  
  private resolveRelativePath(
    fromFile: string,
    importPath: string,
    exportMap: Map<string, ExportInfo>,
    context: CompositionContext
  ): string {
    // Calculate absolute path from relative import
    const fromDir = path.dirname(fromFile);
    const absolutePath = path.resolve(fromDir, importPath);
    
    // Check if file exists in our file map
    const normalizedPath = this.normalizePath(absolutePath);
    
    // Find the actual file that exports what we need
    for (const [filePath, exports] of exportMap) {
      if (this.pathsMatch(normalizedPath, filePath)) {
        // Calculate new relative path
        return this.calculateRelativePath(fromFile, filePath);
      }
    }
    
    // If not found, check for common patterns
    return this.resolveCommonPatterns(fromFile, importPath, context);
  }
  
  private resolveCommonPatterns(
    fromFile: string,
    importPath: string,
    context: CompositionContext
  ): string {
    // Handle common import patterns
    const patterns = [
      // Barrel imports
      { pattern: /^\.\.\/(\w+)$/, replacement: '../$1/index' },
      // Type imports
      { pattern: /^\.\.\/types$/, replacement: '../types/index' },
      // Shared utilities
      { pattern: /^\.\.\/utils$/, replacement: '../shared/utils' },
      // Config imports
      { pattern: /^\.\.\/config$/, replacement: '../config/index' }
    ];
    
    for (const { pattern, replacement } of patterns) {
      if (pattern.test(importPath)) {
        return importPath.replace(pattern, replacement);
      }
    }
    
    return importPath;
  }
}
```

### 4. Test Template Pairing

```typescript
interface TestTemplateMatcher {
  findTestTemplate(
    codeTemplate: TemplateMetadata,
    availableTemplates: TemplateMetadata[]
  ): TemplateMetadata | null;
}

export class SmartTestMatcher implements TestTemplateMatcher {
  private testPatterns = [
    { category: 'api', testCategories: ['api-test', 'integration-test'] },
    { category: 'ui', testCategories: ['component-test', 'ui-test'] },
    { category: 'auth', testCategories: ['auth-test', 'security-test'] },
    { category: 'crud', testCategories: ['crud-test', 'api-test'] },
    { category: 'data', testCategories: ['data-test', 'unit-test'] }
  ];
  
  findTestTemplate(
    codeTemplate: TemplateMetadata,
    availableTemplates: TemplateMetadata[]
  ): TemplateMetadata | null {
    // 1. Check explicit test template mapping
    if (codeTemplate.testTemplate) {
      return availableTemplates.find(t => t.id === codeTemplate.testTemplate) || null;
    }
    
    // 2. Find by matching tags
    const testTemplates = availableTemplates.filter(t => t.category === 'test');
    
    // Score each test template
    const scored = testTemplates.map(test => ({
      template: test,
      score: this.calculateMatchScore(codeTemplate, test)
    }));
    
    // Sort by score and return best match
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0]?.score > 0 ? scored[0].template : null;
  }
  
  private calculateMatchScore(
    code: TemplateMetadata,
    test: TemplateMetadata
  ): number {
    let score = 0;
    
    // Check category mapping
    const pattern = this.testPatterns.find(p => p.category === code.category);
    if (pattern && test.tags.some(tag => pattern.testCategories.includes(tag))) {
      score += 10;
    }
    
    // Check tag overlap
    const commonTags = code.tags.filter(tag => test.tags.includes(tag));
    score += commonTags.length * 5;
    
    // Check name similarity
    if (test.name.toLowerCase().includes(code.name.toLowerCase())) {
      score += 3;
    }
    
    // Framework matching
    const codeFramework = code.tags.find(tag => 
      ['express', 'fastapi', 'next.js', 'react'].includes(tag)
    );
    if (codeFramework && test.tags.includes(codeFramework)) {
      score += 8;
    }
    
    return score;
  }
}

export class TestGenerator {
  private testMatcher: TestTemplateMatcher;
  private templateEngine: TemplateEngine;
  
  async generateTests(
    fileMap: Map<string, FileComposition>,
    templates: TemplateMetadata[]
  ): Promise<Map<string, string>> {
    const testFiles = new Map<string, string>();
    const testTemplates = templates.filter(t => t.category === 'test');
    
    // For each code template used
    for (const template of templates) {
      if (template.category === 'test') continue;
      
      // Find matching test template
      const testTemplate = this.testMatcher.findTestTemplate(
        template,
        testTemplates
      );
      
      if (!testTemplate) {
        console.warn(`No test template found for ${template.name}`);
        continue;
      }
      
      // Generate test files
      const testContent = await this.generateTestContent(
        template,
        testTemplate,
        fileMap
      );
      
      // Determine test file paths
      const testPaths = this.determineTestPaths(template, fileMap);
      
      for (const [testPath, content] of testContent) {
        testFiles.set(testPath, content);
      }
    }
    
    return testFiles;
  }
  
  private determineTestPaths(
    template: TemplateMetadata,
    fileMap: Map<string, FileComposition>
  ): string[] {
    const testPaths: string[] = [];
    
    for (const target of template.targetFiles) {
      if (target.type !== 'new') continue;
      
      const testPath = this.getTestPath(target.path);
      testPaths.push(testPath);
    }
    
    return testPaths;
  }
  
  private getTestPath(codePath: string): string {
    const dir = path.dirname(codePath);
    const filename = path.basename(codePath);
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    
    // Common test file patterns
    const patterns = [
      `${dir}/__tests__/${base}.test${ext}`,
      `${dir}/${base}.test${ext}`,
      `${dir}/../__tests__/${base}.test${ext}`,
      `tests/${dir}/${base}.test${ext}`
    ];
    
    // Return first pattern (most common)
    return patterns[0];
  }
}
```

### 5. Content Merging Strategies

```typescript
export class ContentMerger {
  merge(
    existing: string,
    incoming: string,
    strategy: MergeStrategy,
    section?: string
  ): string {
    switch (strategy) {
      case 'replace':
        return incoming;
        
      case 'append':
        return existing + '\n\n' + incoming;
        
      case 'merge':
        return this.intelligentMerge(existing, incoming, section);
        
      case 'wrap':
        return this.wrapContent(existing, incoming);
        
      default:
        return existing;
    }
  }
  
  private intelligentMerge(
    existing: string,
    incoming: string,
    section?: string
  ): string {
    if (section) {
      return this.mergeSectionContent(existing, incoming, section);
    }
    
    // Parse both files
    const existingAST = this.parseCode(existing);
    const incomingAST = this.parseCode(incoming);
    
    // Merge imports
    const mergedImports = this.mergeImports(
      existingAST.imports,
      incomingAST.imports
    );
    
    // Merge exports
    const mergedExports = this.mergeExports(
      existingAST.exports,
      incomingAST.exports
    );
    
    // Merge body
    const mergedBody = this.mergeBody(
      existingAST.body,
      incomingAST.body
    );
    
    // Reconstruct file
    return this.reconstructFile({
      imports: mergedImports,
      exports: mergedExports,
      body: mergedBody
    });
  }
  
  private mergeSectionContent(
    existing: string,
    incoming: string,
    section: string
  ): string {
    const sectionMarkers = {
      middleware: {
        start: '// Middleware section',
        end: '// End middleware section'
      },
      routes: {
        start: '// Routes section',
        end: '// End routes section'
      },
      models: {
        start: '// Models section',
        end: '// End models section'
      },
      handlers: {
        start: '// Handlers section',
        end: '// End handlers section'
      }
    };
    
    const marker = sectionMarkers[section];
    if (!marker) {
      // If no section marker, append at end
      return existing + '\n\n' + incoming;
    }
    
    const startIdx = existing.indexOf(marker.start);
    const endIdx = existing.indexOf(marker.end);
    
    if (startIdx === -1 || endIdx === -1) {
      // Section not found, create it
      return existing + `\n\n${marker.start}\n${incoming}\n${marker.end}\n`;
    }
    
    // Insert into section
    const before = existing.slice(0, endIdx);
    const after = existing.slice(endIdx);
    
    return before + '\n' + incoming + '\n' + after;
  }
}
```

### 6. Composition Context

```typescript
interface CompositionContext {
  projectPath: string;
  framework: FrameworkInfo;
  models: ModelInfo[];
  features: string[];
  conventions: CodingConventions;
}

interface ModelInfo {
  name: string;
  fields: Field[];
  relations: Relation[];
  validations: Validation[];
}

interface CodingConventions {
  fileNaming: 'camelCase' | 'kebab-case' | 'PascalCase';
  importStyle: 'named' | 'default' | 'namespace';
  testFilePattern: string;
  componentPattern: string;
}
```

## Usage in BACO

### 1. During Template Selection

```typescript
// In /baco plan or /baco execute
const selectedTemplates = [
  'jwt-auth-express',
  'rest-api-crud',
  'global-error-handler',
  'validation-error-handling'
];

// Create composition context
const context: CompositionContext = {
  projectPath: './task-management-api',
  framework: detectedFramework,
  models: extractedModels,
  features: ['authentication', 'task-crud', 'user-management'],
  conventions: {
    fileNaming: 'camelCase',
    importStyle: 'named',
    testFilePattern: '__tests__/*.test.ts',
    componentPattern: 'PascalCase'
  }
};

// Compose templates
const composer = new TemplateComposer();
const result = await composer.composeTemplates(selectedTemplates, context);

// Generate files
for (const [path, composition] of result.files) {
  await Write(path, composition.content);
}
```

### 2. Automatic Test Generation

```typescript
// Test templates are automatically selected and generated
const testGenerator = new TestGenerator();
const testFiles = await testGenerator.generateTests(
  result.files,
  selectedTemplates.map(id => getTemplateMetadata(id))
);

// Tests are included in the composition result
console.log('Generated test files:');
for (const [path, content] of testFiles) {
  console.log(`  ✅ ${path}`);
}
```

### 3. Import Resolution Example

```typescript
// Before composition:
// File: src/controllers/taskController.ts
import { auth } from '../middleware/auth';
import { Task } from '../models/Task';

// File: src/routes/tasks.ts  
import { taskController } from '../controllers/taskController';

// After composition with proper resolution:
// File: src/controllers/taskController.ts
import { auth } from '../middleware/auth';
import { Task } from '../models/Task';

// File: src/routes/tasks.ts
import { taskController } from '../controllers/taskController';
```

## Template Metadata Examples

### Authentication Template
```yaml
id: jwt-auth-express
name: JWT Authentication for Express
category: auth
tags: [authentication, jwt, express, security, middleware]
testTemplate: jwt-auth-testing
dependencies: []
conflicts: [basic-auth-express, oauth-express]
mergeStrategy: merge
targetFiles:
  - path: src/middleware/auth.ts
    type: new
  - path: src/routes/auth.ts
    type: new
  - path: src/models/User.ts
    type: new
  - path: src/app.ts
    type: modify
    section: middleware
  - path: src/types/auth.d.ts
    type: new
```

### CRUD Template
```yaml
id: rest-api-crud
name: REST API CRUD Operations
category: crud
tags: [api, rest, crud, express, mongoose]
testTemplate: api-endpoint-testing
dependencies: []
conflicts: []
mergeStrategy: merge
targetFiles:
  - path: src/controllers/{{modelName}}Controller.ts
    type: new
  - path: src/routes/{{modelName}}Routes.ts
    type: new
  - path: src/models/{{modelName}}.ts
    type: new
  - path: src/app.ts
    type: modify
    section: routes
```

### Test Template
```yaml
id: api-endpoint-testing
name: API Endpoint Testing
category: test
tags: [test, api-test, integration-test, jest, supertest]
dependencies: []
conflicts: []
targetFiles:
  - path: __tests__/{{modelName}}.test.ts
    type: new
  - path: __tests__/helpers/testUtils.ts
    type: new
```

## Best Practices

1. **Always define template metadata** for proper composition
2. **Use semantic sections** for partial file modifications
3. **Specify test template mappings** explicitly when possible
4. **Handle import resolution** at composition time, not runtime
5. **Validate composition result** before writing files
6. **Preserve user customizations** when merging content

## Error Handling

```typescript
export class CompositionError extends Error {
  constructor(
    message: string,
    public template?: string,
    public file?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'CompositionError';
  }
}

// Usage
try {
  const result = await composer.composeTemplates(templates, context);
} catch (error) {
  if (error instanceof CompositionError) {
    console.error(`Template composition failed: ${error.message}`);
    if (error.template) {
      console.error(`  Template: ${error.template}`);
    }
    if (error.file) {
      console.error(`  File: ${error.file}`);
    }
  }
}
```

This template composer ensures that multiple templates work together seamlessly, import paths are correctly resolved, and appropriate test templates are automatically selected and generated.