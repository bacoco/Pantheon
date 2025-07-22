# Incremental Updates for BACO

This library enables BACO to add features to existing projects without breaking current functionality.

## Overview

Incremental updates allow:
- Adding new features to existing codebases
- Safe modifications with backup strategies
- Dependency management and updates
- Migration support for breaking changes
- Conflict resolution and merging

## Core Components

### Project State Analyzer
```typescript
interface ProjectState {
  framework: string;
  version: string;
  dependencies: Map<string, string>;
  features: string[];
  structure: FileStructure;
  customizations: Customization[];
}

class ProjectAnalyzer {
  async analyzeExistingProject(projectPath: string): Promise<ProjectState> {
    const state: ProjectState = {
      framework: await this.detectFramework(projectPath),
      version: await this.getFrameworkVersion(projectPath),
      dependencies: await this.analyzeDependencies(projectPath),
      features: await this.detectImplementedFeatures(projectPath),
      structure: await this.mapFileStructure(projectPath),
      customizations: await this.detectCustomizations(projectPath)
    };
    
    return state;
  }
  
  private async detectImplementedFeatures(projectPath: string): Promise<string[]> {
    const features: string[] = [];
    
    // Check for common feature patterns
    const checks = [
      { pattern: 'auth|authentication|login', feature: 'authentication' },
      { pattern: 'api|endpoint|route', feature: 'api' },
      { pattern: 'database|model|schema', feature: 'database' },
      { pattern: 'test|spec|jest|mocha', feature: 'testing' },
      { pattern: 'docker|container', feature: 'containerization' }
    ];
    
    for (const check of checks) {
      const hasFeature = await this.searchCodebase(projectPath, check.pattern);
      if (hasFeature) {
        features.push(check.feature);
      }
    }
    
    return features;
  }
  
  private async detectCustomizations(projectPath: string): Promise<Customization[]> {
    // Detect deviations from standard patterns
    return [
      await this.checkNamingConventions(projectPath),
      await this.checkFileStructure(projectPath),
      await this.checkCodeStyle(projectPath)
    ].filter(Boolean);
  }
}
```

### Safe Modification Engine
```typescript
class SafeModifier {
  private backupManager: BackupManager;
  private conflictResolver: ConflictResolver;
  
  async addFeature(
    projectPath: string,
    feature: Feature,
    options: ModificationOptions = {}
  ): Promise<ModificationResult> {
    // Create backup point
    const backupId = await this.backupManager.createBackup(projectPath);
    
    try {
      // Analyze current state
      const currentState = await new ProjectAnalyzer().analyzeExistingProject(projectPath);
      
      // Check compatibility
      const compatibility = await this.checkCompatibility(currentState, feature);
      if (!compatibility.isCompatible) {
        throw new Error(`Feature incompatible: ${compatibility.reason}`);
      }
      
      // Plan modifications
      const plan = await this.planModifications(currentState, feature);
      
      // Execute modifications
      const result = await this.executeModifications(plan, options);
      
      // Validate changes
      await this.validateModifications(projectPath, result);
      
      return result;
    } catch (error) {
      // Rollback on failure
      await this.backupManager.restore(backupId);
      throw error;
    }
  }
  
  private async planModifications(
    state: ProjectState,
    feature: Feature
  ): Promise<ModificationPlan> {
    const plan: ModificationPlan = {
      filesToCreate: [],
      filesToModify: [],
      dependenciesToAdd: [],
      migrations: []
    };
    
    // Determine what needs to be added/modified
    for (const requirement of feature.requirements) {
      if (!state.features.includes(requirement)) {
        plan.dependenciesToAdd.push(requirement);
      }
    }
    
    // Plan file modifications
    for (const file of feature.files) {
      const existingFile = state.structure.files.find(f => f.path === file.path);
      
      if (existingFile) {
        plan.filesToModify.push({
          path: file.path,
          modifications: this.planFileModifications(existingFile, file)
        });
      } else {
        plan.filesToCreate.push(file);
      }
    }
    
    return plan;
  }
}
```

### Dependency Update Manager
```typescript
class DependencyUpdater {
  async updateDependencies(
    projectPath: string,
    updates: DependencyUpdate[]
  ): Promise<UpdateResult> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = await this.readPackageJson(packageJsonPath);
    
    const results: UpdateResult = {
      updated: [],
      failed: [],
      warnings: []
    };
    
    for (const update of updates) {
      try {
        // Check for breaking changes
        const breaking = await this.checkBreakingChanges(
          update.package,
          packageJson.dependencies[update.package],
          update.version
        );
        
        if (breaking.length > 0) {
          results.warnings.push({
            package: update.package,
            message: `Breaking changes detected: ${breaking.join(', ')}`
          });
        }
        
        // Update package.json
        if (update.type === 'dependency') {
          packageJson.dependencies[update.package] = update.version;
        } else {
          packageJson.devDependencies[update.package] = update.version;
        }
        
        results.updated.push(update);
      } catch (error) {
        results.failed.push({
          package: update.package,
          error: error.message
        });
      }
    }
    
    // Write updated package.json
    await this.writePackageJson(packageJsonPath, packageJson);
    
    // Run install
    await this.runInstall(projectPath);
    
    return results;
  }
  
  private async checkBreakingChanges(
    packageName: string,
    currentVersion: string,
    newVersion: string
  ): Promise<string[]> {
    // Check major version changes
    const currentMajor = this.getMajorVersion(currentVersion);
    const newMajor = this.getMajorVersion(newVersion);
    
    if (newMajor > currentMajor) {
      return [`Major version bump from ${currentMajor} to ${newMajor}`];
    }
    
    // Check known breaking changes
    const knownBreaking = await this.getKnownBreakingChanges(packageName, currentVersion, newVersion);
    
    return knownBreaking;
  }
}
```

### File Merge Strategy
```typescript
class FileMerger {
  async mergeFile(
    existingContent: string,
    newContent: string,
    fileType: string
  ): Promise<MergeResult> {
    const strategy = this.getStrategy(fileType);
    
    switch (strategy) {
      case 'section-based':
        return this.sectionBasedMerge(existingContent, newContent);
        
      case 'import-aware':
        return this.importAwareMerge(existingContent, newContent);
        
      case 'config-merge':
        return this.configMerge(existingContent, newContent);
        
      default:
        return this.defaultMerge(existingContent, newContent);
    }
  }
  
  private sectionBasedMerge(existing: string, new: string): MergeResult {
    // Parse sections
    const existingSections = this.parseSections(existing);
    const newSections = this.parseSections(new);
    
    // Merge sections
    const merged = new Map(existingSections);
    
    for (const [name, content] of newSections) {
      if (merged.has(name)) {
        // Merge existing section
        merged.set(name, this.mergeSectionContent(merged.get(name)!, content));
      } else {
        // Add new section
        merged.set(name, content);
      }
    }
    
    return {
      content: this.buildFromSections(merged),
      conflicts: []
    };
  }
  
  private importAwareMerge(existing: string, new: string): MergeResult {
    const existingImports = this.extractImports(existing);
    const newImports = this.extractImports(new);
    
    // Merge imports
    const mergedImports = this.mergeImports(existingImports, newImports);
    
    // Merge content after imports
    const existingBody = this.removeImports(existing);
    const newBody = this.removeImports(new);
    
    const mergedBody = this.mergeBody(existingBody, newBody);
    
    return {
      content: mergedImports + '\n\n' + mergedBody,
      conflicts: []
    };
  }
}
```

### Migration Runner
```typescript
class MigrationRunner {
  async runMigrations(
    projectPath: string,
    migrations: Migration[]
  ): Promise<MigrationResult> {
    const results: MigrationResult = {
      successful: [],
      failed: [],
      skipped: []
    };
    
    for (const migration of migrations) {
      try {
        // Check if migration is needed
        const needed = await this.isMigrationNeeded(projectPath, migration);
        
        if (!needed) {
          results.skipped.push({
            migration: migration.name,
            reason: 'Already applied or not applicable'
          });
          continue;
        }
        
        // Create backup
        const backupId = await this.createBackup(projectPath);
        
        try {
          // Run migration
          await this.executeMigration(projectPath, migration);
          
          // Validate result
          await this.validateMigration(projectPath, migration);
          
          results.successful.push(migration.name);
        } catch (error) {
          // Rollback
          await this.restoreBackup(backupId);
          throw error;
        }
      } catch (error) {
        results.failed.push({
          migration: migration.name,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  private async executeMigration(
    projectPath: string,
    migration: Migration
  ): Promise<void> {
    for (const step of migration.steps) {
      switch (step.type) {
        case 'rename':
          await this.renameFiles(projectPath, step.from, step.to);
          break;
          
        case 'transform':
          await this.transformFiles(projectPath, step.pattern, step.transformer);
          break;
          
        case 'update-imports':
          await this.updateImports(projectPath, step.oldPath, step.newPath);
          break;
          
        case 'update-config':
          await this.updateConfig(projectPath, step.config);
          break;
      }
    }
  }
}
```

## Integration with BACO Commands

### Add Feature Command
```typescript
// New /add-feature command
async function addFeatureToExisting(projectPath: string, featureName: string) {
  console.log(`📊 Analyzing existing project...`);
  
  const analyzer = new ProjectAnalyzer();
  const state = await analyzer.analyzeExistingProject(projectPath);
  
  console.log(`
Current Project State:
- Framework: ${state.framework} v${state.version}
- Existing features: ${state.features.join(', ')}
- Dependencies: ${state.dependencies.size} packages
  `);
  
  // Get feature template
  const feature = await getFeatureTemplate(featureName, state.framework);
  
  console.log(`
📦 Planning to add: ${featureName}
- New files: ${feature.files.length}
- Modified files: ${feature.modifications.length}
- New dependencies: ${feature.dependencies.length}
  
This will:
${feature.description}

Continue? (y/n):
  `);
  
  const confirm = await getUserConfirmation();
  
  if (confirm) {
    const modifier = new SafeModifier();
    const result = await modifier.addFeature(projectPath, feature);
    
    console.log(`
✅ Feature added successfully!
- Files created: ${result.created.length}
- Files modified: ${result.modified.length}
- Dependencies added: ${result.dependencies.length}

Next steps:
${feature.nextSteps.join('\n')}
    `);
  }
}
```

### Update Dependencies Command
```typescript
// /update-deps command
async function updateProjectDependencies(projectPath: string) {
  console.log(`🔍 Checking for dependency updates...`);
  
  const updater = new DependencyUpdater();
  const available = await updater.checkAvailableUpdates(projectPath);
  
  if (available.length === 0) {
    console.log(`✅ All dependencies are up to date!`);
    return;
  }
  
  console.log(`
📦 Available Updates:
${available.map(u => `  ${u.package}: ${u.current} → ${u.latest} ${u.breaking ? '⚠️ BREAKING' : ''}`).join('\n')}

Update strategy:
1. All non-breaking updates
2. Selected updates
3. Skip for now

Choice (1-3):
  `);
  
  const strategy = await getUserChoice();
  
  const updates = strategy === '1' 
    ? available.filter(u => !u.breaking)
    : await selectUpdates(available);
    
  const result = await updater.updateDependencies(projectPath, updates);
  
  console.log(`
Update Results:
✅ Updated: ${result.updated.length}
⚠️ Warnings: ${result.warnings.length}
❌ Failed: ${result.failed.length}
  `);
}
```

## Safety Features

### Backup System
```typescript
class BackupManager {
  private backupDir = '.baco-backups';
  
  async createBackup(projectPath: string): Promise<string> {
    const backupId = `backup-${Date.now()}`;
    const backupPath = path.join(projectPath, this.backupDir, backupId);
    
    // Create backup directory
    await fs.mkdir(backupPath, { recursive: true });
    
    // Copy current state
    await this.copyProject(projectPath, backupPath);
    
    // Create manifest
    await this.createManifest(backupPath, {
      id: backupId,
      timestamp: new Date(),
      reason: 'Incremental update backup'
    });
    
    return backupId;
  }
  
  async restore(backupId: string): Promise<void> {
    // Restore from backup
    const backupPath = path.join(this.backupDir, backupId);
    await this.copyProject(backupPath, '.');
  }
}
```

### Conflict Resolution
```typescript
class ConflictResolver {
  async resolveConflicts(conflicts: Conflict[]): Promise<Resolution[]> {
    const resolutions: Resolution[] = [];
    
    for (const conflict of conflicts) {
      console.log(`
⚠️ Conflict detected in ${conflict.file}:
${conflict.description}

Options:
1. Keep existing
2. Use new version
3. Merge both
4. Manual resolution

Choice:
      `);
      
      const choice = await getUserChoice();
      resolutions.push(await this.applyResolution(conflict, choice));
    }
    
    return resolutions;
  }
}
```

## Best Practices

1. **Always Backup**: Create restore points before modifications
2. **Test After Updates**: Run test suite after changes
3. **Incremental Changes**: Make small, focused updates
4. **Preserve Customizations**: Respect existing code style
5. **Clear Communication**: Show what will change before doing it

The Incremental Updates system ensures BACO can evolve existing projects safely and intelligently.