#!/usr/bin/env node

/**
 * Codebase Flattener - BMAD-Inspired Context Generation Tool
 * 
 * Flattens an entire codebase into a single context file for AI consumption.
 * Preserves structure, relationships, and critical context while removing noise.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream } from 'fs';
import { createHash } from 'crypto';
import * as readline from 'readline';
import { glob } from 'glob';
import * as minimatch from 'minimatch';

// Configuration
interface FlattenConfig {
  rootPath: string;
  outputPath: string;
  includePatterns: string[];
  excludePatterns: string[];
  maxFileSize: number;
  preserveStructure: boolean;
  addContext: boolean;
  format: 'xml' | 'markdown' | 'json';
}

const DEFAULT_CONFIG: FlattenConfig = {
  rootPath: process.cwd(),
  outputPath: './.pantheon/flattened-codebase.md',
  includePatterns: [
    '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx',
    '**/*.py', '**/*.java', '**/*.go', '**/*.rs',
    '**/*.html', '**/*.css', '**/*.scss',
    '**/*.md', '**/*.json', '**/*.yaml', '**/*.yml',
    '**/Dockerfile', '**/.env.example'
  ],
  excludePatterns: [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/*.min.js',
    '**/*.map',
    '**/package-lock.json',
    '**/yarn.lock',
    '**/.DS_Store',
    '**/tmp/**',
    '**/temp/**',
    '**/*.log'
  ],
  maxFileSize: 1048576, // 1MB per file
  preserveStructure: true,
  addContext: true,
  format: 'markdown'
};

// File metadata interface
interface FileMetadata {
  path: string;
  relativePath: string;
  size: number;
  lines: number;
  hash: string;
  language: string;
  imports: string[];
  exports: string[];
  classes: string[];
  functions: string[];
  complexity: number;
}

class CodebaseFlattener {
  private config: FlattenConfig;
  private fileTree: Map<string, FileMetadata>;
  private dependencies: Map<string, Set<string>>;
  private contextBuffer: string[];

  constructor(config: Partial<FlattenConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.fileTree = new Map();
    this.dependencies = new Map();
    this.contextBuffer = [];
  }

  /**
   * Main flattening process
   */
  async flatten(): Promise<void> {
    console.log('🔄 Starting codebase flattening...');
    
    // Phase 1: Discovery
    console.log('📂 Phase 1: Discovering files...');
    const files = await this.discoverFiles();
    console.log(`  Found ${files.length} files to process`);

    // Phase 2: Analysis
    console.log('🔍 Phase 2: Analyzing code structure...');
    await this.analyzeFiles(files);
    console.log(`  Analyzed ${this.fileTree.size} files`);

    // Phase 3: Context Building
    console.log('🧠 Phase 3: Building context...');
    await this.buildContext();

    // Phase 4: Output Generation
    console.log('📝 Phase 4: Generating output...');
    await this.generateOutput();

    console.log('✅ Codebase flattening complete!');
    console.log(`📄 Output saved to: ${this.config.outputPath}`);
  }

  /**
   * Discover all files matching include patterns
   */
  private async discoverFiles(): Promise<string[]> {
    const allFiles: string[] = [];

    for (const pattern of this.config.includePatterns) {
      const matches = await glob(pattern, {
        cwd: this.config.rootPath,
        absolute: false,
        ignore: this.config.excludePatterns
      });
      allFiles.push(...matches);
    }

    // Remove duplicates and filter excludes
    const uniqueFiles = Array.from(new Set(allFiles));
    return uniqueFiles.filter(file => 
      !this.config.excludePatterns.some(pattern => 
        minimatch(file, pattern)
      )
    );
  }

  /**
   * Analyze each file for metadata and relationships
   */
  private async analyzeFiles(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        const metadata = await this.analyzeFile(file);
        this.fileTree.set(file, metadata);
        
        // Track dependencies
        if (metadata.imports.length > 0) {
          this.dependencies.set(file, new Set(metadata.imports));
        }
      } catch (error) {
        console.warn(`  ⚠️ Skipping ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Analyze a single file
   */
  private async analyzeFile(filePath: string): Promise<FileMetadata> {
    const fullPath = path.join(this.config.rootPath, filePath);
    const stats = await fs.stat(fullPath);

    // Skip large files
    if (stats.size > this.config.maxFileSize) {
      throw new Error(`File too large: ${stats.size} bytes`);
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    const lines = content.split('\n');
    const language = this.detectLanguage(filePath);

    // Calculate hash for deduplication
    const hash = createHash('sha256').update(content).digest('hex').substring(0, 8);

    // Extract code intelligence
    const metadata: FileMetadata = {
      path: fullPath,
      relativePath: filePath,
      size: stats.size,
      lines: lines.length,
      hash,
      language,
      imports: this.extractImports(content, language),
      exports: this.extractExports(content, language),
      classes: this.extractClasses(content, language),
      functions: this.extractFunctions(content, language),
      complexity: this.calculateComplexity(content)
    };

    return metadata;
  }

  /**
   * Detect programming language from file extension
   */
  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'typescript-react',
      '.js': 'javascript',
      '.jsx': 'javascript-react',
      '.py': 'python',
      '.java': 'java',
      '.go': 'golang',
      '.rs': 'rust',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.rb': 'ruby',
      '.php': 'php',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.md': 'markdown',
      '.json': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.xml': 'xml',
      '.sql': 'sql',
      '.sh': 'bash',
      '.dockerfile': 'dockerfile'
    };

    return languageMap[ext] || 'text';
  }

  /**
   * Extract import statements
   */
  private extractImports(content: string, language: string): string[] {
    const imports: string[] = [];
    
    switch (language) {
      case 'typescript':
      case 'javascript':
        // ES6 imports
        const esImports = content.match(/import\s+.*?from\s+['"](.+?)['"]/g) || [];
        const requireImports = content.match(/require\s*\(['"](.+?)['"]\)/g) || [];
        imports.push(...esImports, ...requireImports);
        break;
      
      case 'python':
        const pyImports = content.match(/(?:from|import)\s+[\w\.]+/g) || [];
        imports.push(...pyImports);
        break;
      
      case 'java':
        const javaImports = content.match(/import\s+[\w\.]+;/g) || [];
        imports.push(...javaImports);
        break;
      
      case 'golang':
        const goImports = content.match(/import\s+"[^"]+"/g) || [];
        imports.push(...goImports);
        break;
    }

    return imports;
  }

  /**
   * Extract export statements
   */
  private extractExports(content: string, language: string): string[] {
    const exports: string[] = [];
    
    switch (language) {
      case 'typescript':
      case 'javascript':
        const esExports = content.match(/export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g) || [];
        exports.push(...esExports);
        break;
      
      case 'python':
        // Python doesn't have explicit exports, use top-level definitions
        const pyDefs = content.match(/^(?:def|class)\s+(\w+)/gm) || [];
        exports.push(...pyDefs);
        break;
    }

    return exports;
  }

  /**
   * Extract class definitions
   */
  private extractClasses(content: string, language: string): string[] {
    const classes: string[] = [];
    
    const classPatterns: Record<string, RegExp> = {
      typescript: /class\s+(\w+)/g,
      javascript: /class\s+(\w+)/g,
      python: /class\s+(\w+)/g,
      java: /class\s+(\w+)/g,
      csharp: /class\s+(\w+)/g,
      cpp: /class\s+(\w+)/g
    };

    const pattern = classPatterns[language];
    if (pattern) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        classes.push(match[1]);
      }
    }

    return classes;
  }

  /**
   * Extract function definitions
   */
  private extractFunctions(content: string, language: string): string[] {
    const functions: string[] = [];
    
    const functionPatterns: Record<string, RegExp> = {
      typescript: /(?:function|const|let|var)\s+(\w+)\s*(?:=\s*)?(?:\([^)]*\)|async)/g,
      javascript: /(?:function|const|let|var)\s+(\w+)\s*(?:=\s*)?(?:\([^)]*\)|async)/g,
      python: /def\s+(\w+)\s*\(/g,
      java: /(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\(/g,
      golang: /func\s+(?:\(\w+\s+\*?\w+\)\s+)?(\w+)\s*\(/g
    };

    const pattern = functionPatterns[language];
    if (pattern) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        functions.push(match[1]);
      }
    }

    return functions;
  }

  /**
   * Calculate cyclomatic complexity (simplified)
   */
  private calculateComplexity(content: string): number {
    let complexity = 1; // Base complexity

    // Count decision points
    const decisionKeywords = [
      /\bif\b/g,
      /\belse\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bcatch\b/g,
      /\?\s*:/g, // Ternary operator
      /\&\&/g,   // Logical AND
      /\|\|/g    // Logical OR
    ];

    for (const pattern of decisionKeywords) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * Build context from analyzed files
   */
  private async buildContext(): Promise<void> {
    // Add project overview
    this.contextBuffer.push('# PROJECT CONTEXT\n');
    this.contextBuffer.push(`Total Files: ${this.fileTree.size}`);
    this.contextBuffer.push(`Total Lines: ${Array.from(this.fileTree.values()).reduce((sum, f) => sum + f.lines, 0)}`);
    this.contextBuffer.push('\n## Language Distribution\n');
    
    const languageStats = this.getLanguageStatistics();
    for (const [lang, count] of Object.entries(languageStats)) {
      this.contextBuffer.push(`- ${lang}: ${count} files`);
    }

    // Add dependency graph
    this.contextBuffer.push('\n## Dependency Structure\n');
    this.contextBuffer.push(this.generateDependencyGraph());

    // Add file tree structure
    if (this.config.preserveStructure) {
      this.contextBuffer.push('\n## Directory Structure\n');
      this.contextBuffer.push(this.generateFileTree());
    }

    // Add code intelligence summary
    this.contextBuffer.push('\n## Code Intelligence\n');
    this.contextBuffer.push(this.generateCodeIntelligence());
  }

  /**
   * Get language statistics
   */
  private getLanguageStatistics(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const file of this.fileTree.values()) {
      stats[file.language] = (stats[file.language] || 0) + 1;
    }

    return stats;
  }

  /**
   * Generate dependency graph
   */
  private generateDependencyGraph(): string {
    const graph: string[] = [];
    
    for (const [file, deps] of this.dependencies.entries()) {
      if (deps.size > 0) {
        graph.push(`${file}:`);
        for (const dep of deps) {
          graph.push(`  → ${dep}`);
        }
      }
    }

    return graph.join('\n');
  }

  /**
   * Generate file tree structure
   */
  private generateFileTree(): string {
    const tree: string[] = [];
    const files = Array.from(this.fileTree.keys()).sort();
    
    // Build tree structure
    const treeMap: any = {};
    for (const file of files) {
      const parts = file.split('/');
      let current = treeMap;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = 'file';
        } else {
          current[part] = current[part] || {};
          current = current[part];
        }
      }
    }

    // Render tree
    const renderTree = (obj: any, prefix = ''): void => {
      const entries = Object.entries(obj);
      entries.forEach(([key, value], index) => {
        const isLast = index === entries.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        
        if (value === 'file') {
          tree.push(`${prefix}${connector}${key}`);
        } else {
          tree.push(`${prefix}${connector}${key}/`);
          const newPrefix = prefix + (isLast ? '    ' : '│   ');
          renderTree(value, newPrefix);
        }
      });
    };

    renderTree(treeMap);
    return tree.join('\n');
  }

  /**
   * Generate code intelligence summary
   */
  private generateCodeIntelligence(): string {
    const summary: string[] = [];
    
    // Collect all classes and functions
    const allClasses = new Set<string>();
    const allFunctions = new Set<string>();
    
    for (const file of this.fileTree.values()) {
      file.classes.forEach(c => allClasses.add(c));
      file.functions.forEach(f => allFunctions.add(f));
    }

    summary.push(`Total Classes: ${allClasses.size}`);
    summary.push(`Total Functions: ${allFunctions.size}`);
    
    // Complexity analysis
    const complexFiles = Array.from(this.fileTree.values())
      .filter(f => f.complexity > 10)
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 5);
    
    if (complexFiles.length > 0) {
      summary.push('\n### High Complexity Files:');
      for (const file of complexFiles) {
        summary.push(`- ${file.relativePath} (complexity: ${file.complexity})`);
      }
    }

    return summary.join('\n');
  }

  /**
   * Generate final output file
   */
  private async generateOutput(): Promise<void> {
    let output: string = '';

    switch (this.config.format) {
      case 'markdown':
        output = await this.generateMarkdownOutput();
        break;
      case 'xml':
        output = await this.generateXMLOutput();
        break;
      case 'json':
        output = await this.generateJSONOutput();
        break;
    }

    // Ensure output directory exists
    const outputDir = path.dirname(this.config.outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Write output file
    await fs.writeFile(this.config.outputPath, output);
  }

  /**
   * Generate Markdown output
   */
  private async generateMarkdownOutput(): Promise<string> {
    const sections: string[] = [];

    // Header
    sections.push('# Flattened Codebase Context');
    sections.push(`Generated: ${new Date().toISOString()}`);
    sections.push(`Root: ${this.config.rootPath}`);
    sections.push('');

    // Context buffer
    sections.push(...this.contextBuffer);
    sections.push('');

    // File contents
    sections.push('# FILE CONTENTS\n');

    for (const [filePath, metadata] of this.fileTree.entries()) {
      sections.push(`## ${filePath}`);
      sections.push(`Language: ${metadata.language} | Lines: ${metadata.lines} | Complexity: ${metadata.complexity}`);
      
      if (metadata.classes.length > 0) {
        sections.push(`Classes: ${metadata.classes.join(', ')}`);
      }
      
      if (metadata.functions.length > 0) {
        sections.push(`Functions: ${metadata.functions.slice(0, 10).join(', ')}${metadata.functions.length > 10 ? '...' : ''}`);
      }

      sections.push('```' + metadata.language);
      
      try {
        const content = await fs.readFile(metadata.path, 'utf-8');
        sections.push(content);
      } catch (error) {
        sections.push(`// Error reading file: ${error.message}`);
      }
      
      sections.push('```\n');
    }

    return sections.join('\n');
  }

  /**
   * Generate XML output
   */
  private async generateXMLOutput(): Promise<string> {
    const xml: string[] = [];
    
    xml.push('<?xml version="1.0" encoding="UTF-8"?>');
    xml.push('<flattened-codebase>');
    xml.push(`  <metadata>`);
    xml.push(`    <generated>${new Date().toISOString()}</generated>`);
    xml.push(`    <root>${this.config.rootPath}</root>`);
    xml.push(`    <total-files>${this.fileTree.size}</total-files>`);
    xml.push(`  </metadata>`);
    
    xml.push('  <files>');
    for (const [filePath, metadata] of this.fileTree.entries()) {
      xml.push(`    <file path="${filePath}">`);
      xml.push(`      <language>${metadata.language}</language>`);
      xml.push(`      <lines>${metadata.lines}</lines>`);
      xml.push(`      <complexity>${metadata.complexity}</complexity>`);
      
      const content = await fs.readFile(metadata.path, 'utf-8');
      xml.push(`      <content><![CDATA[${content}]]></content>`);
      
      xml.push(`    </file>`);
    }
    xml.push('  </files>');
    
    xml.push('</flattened-codebase>');
    
    return xml.join('\n');
  }

  /**
   * Generate JSON output
   */
  private async generateJSONOutput(): Promise<string> {
    const output: any = {
      metadata: {
        generated: new Date().toISOString(),
        root: this.config.rootPath,
        totalFiles: this.fileTree.size
      },
      context: this.contextBuffer.join('\n'),
      files: {}
    };

    for (const [filePath, metadata] of this.fileTree.entries()) {
      const content = await fs.readFile(metadata.path, 'utf-8');
      output.files[filePath] = {
        ...metadata,
        content
      };
    }

    return JSON.stringify(output, null, 2);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const config: Partial<FlattenConfig> = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--root':
      case '-r':
        config.rootPath = args[++i];
        break;
      
      case '--output':
      case '-o':
        config.outputPath = args[++i];
        break;
      
      case '--format':
      case '-f':
        config.format = args[++i] as 'xml' | 'markdown' | 'json';
        break;
      
      case '--include':
      case '-i':
        config.includePatterns = args[++i].split(',');
        break;
      
      case '--exclude':
      case '-e':
        config.excludePatterns = args[++i].split(',');
        break;
      
      case '--max-size':
        config.maxFileSize = parseInt(args[++i]);
        break;
      
      case '--no-structure':
        config.preserveStructure = false;
        break;
      
      case '--no-context':
        config.addContext = false;
        break;
      
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  // Run flattener
  const flattener = new CodebaseFlattener(config);
  
  try {
    await flattener.flatten();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Codebase Flattener - BMAD-Inspired Context Generation

Usage: flatten-codebase [options]

Options:
  -r, --root <path>      Root directory to flatten (default: current directory)
  -o, --output <path>    Output file path (default: ./.pantheon/flattened-codebase.md)
  -f, --format <type>    Output format: markdown, xml, json (default: markdown)
  -i, --include <patterns> Comma-separated include patterns
  -e, --exclude <patterns> Comma-separated exclude patterns
  --max-size <bytes>     Maximum file size to include (default: 1MB)
  --no-structure         Don't preserve directory structure
  --no-context           Don't add context analysis
  -h, --help             Show this help message

Examples:
  flatten-codebase --root ./src --output context.md
  flatten-codebase --format json --include "*.ts,*.tsx"
  flatten-codebase --exclude "test/**,*.spec.ts"

This tool flattens your codebase into a single context file,
perfect for AI consumption and preserving complete project context.
  `);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { CodebaseFlattener, FlattenConfig };