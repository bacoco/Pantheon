#!/usr/bin/env node

/**
 * Pantheon Multi-AI Ecosystem - Comprehensive Verification Script
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Core files to verify
const CORE_FILES = [
  // Agents
  'src/agents/PantheonAgent.js',
  'src/agents/AgentRegistry.js',
  'src/agents/creators/ClaudeArchitect.js',
  'src/agents/creators/ClaudeBuilder.js',
  'src/agents/creators/ClaudeDocumenter.js',
  'src/agents/validators/GeminiAdvisor.js',
  
  // Router
  'src/router/SmartRouter.js',
  'src/router/CostOptimizer.js',
  'src/router/UsageTracker.js',
  'src/router/FallbackHandler.js',
  'src/router/index.js',
  
  // Workflows
  'src/workflows/PantheonWorkflow.js',
  'src/workflows/ExecutionPatterns.js',
  'src/workflows/WorkflowTemplates.js',
  'src/workflows/WorkflowMonitor.js',
  'src/workflows/index.js',
  
  // Validation
  'src/validation/ValidationOrchestrator.js',
  'src/validation/ValidationTriggers.js',
  'src/validation/FeedbackProcessor.js',
  'src/validation/ValidationReporter.js',
  'src/validation/index.js',
  
  // Management
  'src/management/ModelManager.js',
  
  // Main
  'src/index.js',
  'package.json'
];

// Required dependencies
const REQUIRED_DEPS = [
  'express',
  'winston',
  'joi',
  'uuid',
  'axios',
  'eventemitter3',
  'yaml',
  'better-sqlite3',
  'dotenv'
];

class Verifier {
  constructor() {
    this.results = {
      files: { total: 0, found: 0, missing: [] },
      syntax: { total: 0, valid: 0, errors: [] },
      imports: { total: 0, valid: 0, errors: [] },
      geminiSafeguards: { passed: true, violations: [] },
      dependencies: { total: 0, found: 0, missing: [] }
    };
  }
  
  async verify() {
    console.log(chalk.cyan('\n🔍 Pantheon Multi-AI Ecosystem Verification\n'));
    console.log(chalk.gray('='.repeat(60)));
    
    // Check files exist
    await this.checkFiles();
    
    // Check syntax
    await this.checkSyntax();
    
    // Check imports
    await this.checkImports();
    
    // Check Gemini safeguards
    await this.checkGeminiSafeguards();
    
    // Check dependencies
    await this.checkDependencies();
    
    // Display results
    this.displayResults();
  }
  
  async checkFiles() {
    console.log(chalk.yellow('\n📁 Checking file structure...'));
    
    this.results.files.total = CORE_FILES.length;
    
    for (const file of CORE_FILES) {
      const filePath = path.join(rootDir, file);
      try {
        await fs.access(filePath);
        this.results.files.found++;
        console.log(chalk.green('  ✓'), file);
      } catch {
        this.results.files.missing.push(file);
        console.log(chalk.red('  ✗'), file, chalk.gray('(missing)'));
      }
    }
  }
  
  async checkSyntax() {
    console.log(chalk.yellow('\n🔧 Checking syntax...'));
    
    const jsFiles = CORE_FILES.filter(f => f.endsWith('.js'));
    this.results.syntax.total = jsFiles.length;
    
    for (const file of jsFiles) {
      const filePath = path.join(rootDir, file);
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Basic syntax check using dynamic import
        try {
          new Function(content.replace(/import.*from.*/g, '').replace(/export.*/g, ''));
          this.results.syntax.valid++;
          console.log(chalk.green('  ✓'), path.basename(file));
        } catch (error) {
          // Try Node.js syntax check
          const { exec } = await import('child_process');
          const util = await import('util');
          const execPromise = util.promisify(exec);
          
          try {
            await execPromise(`node -c "${filePath}"`);
            this.results.syntax.valid++;
            console.log(chalk.green('  ✓'), path.basename(file));
          } catch (err) {
            this.results.syntax.errors.push({ file, error: err.message });
            console.log(chalk.red('  ✗'), path.basename(file), chalk.gray(`(${err.message})`));
          }
        }
      } catch {
        // File doesn't exist, skip
      }
    }
  }
  
  async checkImports() {
    console.log(chalk.yellow('\n📦 Checking imports...'));
    
    const jsFiles = CORE_FILES.filter(f => f.endsWith('.js'));
    
    for (const file of jsFiles) {
      const filePath = path.join(rootDir, file);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const imports = content.match(/import.*from\s+['"](.+?)['"]/g) || [];
        
        this.results.imports.total += imports.length;
        
        for (const imp of imports) {
          const match = imp.match(/from\s+['"](.+?)['"]/);
          if (match) {
            const importPath = match[1];
            
            // Check if it's a relative import
            if (importPath.startsWith('.')) {
              const resolvedPath = path.resolve(path.dirname(filePath), importPath);
              const variations = [resolvedPath, `${resolvedPath}.js`, `${resolvedPath}/index.js`];
              
              let found = false;
              for (const variant of variations) {
                try {
                  await fs.access(variant);
                  found = true;
                  break;
                } catch {
                  // Continue checking
                }
              }
              
              if (found) {
                this.results.imports.valid++;
              } else {
                this.results.imports.errors.push({
                  file: path.basename(file),
                  import: importPath
                });
              }
            } else {
              // Node module import
              this.results.imports.valid++;
            }
          }
        }
      } catch {
        // File doesn't exist, skip
      }
    }
    
    if (this.results.imports.errors.length === 0) {
      console.log(chalk.green('  ✓'), 'All imports resolved');
    } else {
      console.log(chalk.red('  ✗'), `${this.results.imports.errors.length} import errors`);
      this.results.imports.errors.slice(0, 5).forEach(err => {
        console.log(chalk.gray(`      ${err.file}: ${err.import}`));
      });
    }
  }
  
  async checkGeminiSafeguards() {
    console.log(chalk.yellow('\n🔒 Checking Gemini safeguards...'));
    
    // Check GeminiAdvisor.js
    const geminiFile = path.join(rootDir, 'src/agents/validators/GeminiAdvisor.js');
    try {
      const content = await fs.readFile(geminiFile, 'utf8');
      
      // Check for write tool restrictions
      const hasWriteRestriction = content.includes("tools: ['Read', 'Grep', 'Glob']");
      const hasCodeWritingForbidden = content.includes("this.codeWriting = 'FORBIDDEN'");
      const hasEnforceReadOnly = content.includes("enforceReadOnly()");
      
      if (!hasWriteRestriction) {
        this.results.geminiSafeguards.violations.push('Missing tool restrictions');
        this.results.geminiSafeguards.passed = false;
      }
      
      if (!hasCodeWritingForbidden) {
        this.results.geminiSafeguards.violations.push('Code writing not explicitly forbidden');
        this.results.geminiSafeguards.passed = false;
      }
      
      if (!hasEnforceReadOnly) {
        this.results.geminiSafeguards.violations.push('Missing enforceReadOnly method');
        this.results.geminiSafeguards.passed = false;
      }
      
      if (this.results.geminiSafeguards.passed) {
        console.log(chalk.green('  ✓'), 'All safeguards in place');
        console.log(chalk.gray('      - Tool restrictions enforced'));
        console.log(chalk.gray('      - Code writing forbidden'));
        console.log(chalk.gray('      - Read-only enforcement active'));
      } else {
        console.log(chalk.red('  ✗'), 'Safeguard violations detected:');
        this.results.geminiSafeguards.violations.forEach(v => {
          console.log(chalk.red('      -'), v);
        });
      }
      
    } catch (error) {
      console.log(chalk.red('  ✗'), 'Could not verify GeminiAdvisor.js');
    }
  }
  
  async checkDependencies() {
    console.log(chalk.yellow('\n📚 Checking dependencies...'));
    
    try {
      const packageJson = JSON.parse(
        await fs.readFile(path.join(rootDir, 'package.json'), 'utf8')
      );
      
      const installedDeps = Object.keys(packageJson.dependencies || {});
      
      this.results.dependencies.total = REQUIRED_DEPS.length;
      
      for (const dep of REQUIRED_DEPS) {
        if (installedDeps.includes(dep)) {
          this.results.dependencies.found++;
          console.log(chalk.green('  ✓'), dep);
        } else {
          this.results.dependencies.missing.push(dep);
          console.log(chalk.red('  ✗'), dep, chalk.gray('(missing)'));
        }
      }
    } catch (error) {
      console.log(chalk.red('  ✗'), 'Could not read package.json');
    }
  }
  
  displayResults() {
    console.log(chalk.cyan('\n📊 Verification Results\n'));
    console.log(chalk.gray('='.repeat(60)));
    
    // Files
    const fileScore = (this.results.files.found / this.results.files.total) * 100;
    const fileColor = fileScore === 100 ? chalk.green : fileScore >= 80 ? chalk.yellow : chalk.red;
    console.log(fileColor(`📁 Files: ${this.results.files.found}/${this.results.files.total} (${fileScore.toFixed(1)}%)`));
    
    // Syntax
    const syntaxScore = this.results.syntax.total > 0 
      ? (this.results.syntax.valid / this.results.syntax.total) * 100 
      : 0;
    const syntaxColor = syntaxScore === 100 ? chalk.green : syntaxScore >= 80 ? chalk.yellow : chalk.red;
    console.log(syntaxColor(`🔧 Syntax: ${this.results.syntax.valid}/${this.results.syntax.total} (${syntaxScore.toFixed(1)}%)`));
    
    // Imports
    const importScore = this.results.imports.total > 0
      ? (this.results.imports.valid / this.results.imports.total) * 100
      : 100;
    const importColor = importScore === 100 ? chalk.green : importScore >= 80 ? chalk.yellow : chalk.red;
    console.log(importColor(`📦 Imports: ${this.results.imports.valid}/${this.results.imports.total} (${importScore.toFixed(1)}%)`));
    
    // Gemini Safeguards
    const safeguardColor = this.results.geminiSafeguards.passed ? chalk.green : chalk.red;
    console.log(safeguardColor(`🔒 Gemini Safeguards: ${this.results.geminiSafeguards.passed ? 'PASSED' : 'FAILED'}`));
    
    // Dependencies
    const depScore = (this.results.dependencies.found / this.results.dependencies.total) * 100;
    const depColor = depScore === 100 ? chalk.green : depScore >= 80 ? chalk.yellow : chalk.red;
    console.log(depColor(`📚 Dependencies: ${this.results.dependencies.found}/${this.results.dependencies.total} (${depScore.toFixed(1)}%)`));
    
    console.log(chalk.gray('\n' + '='.repeat(60)));
    
    // Overall verdict
    const overallScore = (fileScore + syntaxScore + importScore + depScore + (this.results.geminiSafeguards.passed ? 100 : 0)) / 5;
    
    if (overallScore === 100) {
      console.log(chalk.green.bold('\n✅ VERIFICATION PASSED - System is ready!'));
    } else if (overallScore >= 80) {
      console.log(chalk.yellow.bold('\n⚠️  VERIFICATION PASSED WITH WARNINGS'));
      console.log(chalk.gray('   Some components may need attention'));
    } else {
      console.log(chalk.red.bold('\n❌ VERIFICATION FAILED'));
      console.log(chalk.gray('   Please address the issues above'));
    }
    
    // Recommendations
    if (this.results.files.missing.length > 0) {
      console.log(chalk.yellow('\n📝 Missing files (first 5):'));
      this.results.files.missing.slice(0, 5).forEach(f => {
        console.log(chalk.gray('   -'), f);
      });
    }
    
    if (this.results.dependencies.missing.length > 0) {
      console.log(chalk.yellow('\n📝 To install missing dependencies:'));
      console.log(chalk.gray('   npm install'));
    }
    
    if (!this.results.geminiSafeguards.passed) {
      console.log(chalk.red('\n⚠️  CRITICAL: Gemini safeguards not properly configured!'));
      console.log(chalk.gray('   This could allow Gemini models to write code'));
    }
    
    console.log('\n');
  }
}

// Run verification
const verifier = new Verifier();
verifier.verify().catch(console.error);