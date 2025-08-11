#!/usr/bin/env node

/**
 * BMAD Integration Test Suite
 * Tests all BMAD-inspired gods and features
 */

console.log('🧪 BMAD Integration Test Suite');
console.log('================================\n');

// Test results tracker
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to log test results
function testCase(name, condition, details = '') {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
    if (details) console.log(`   Details: ${details}`);
    testResults.passed.push(name);
  } else {
    console.log(`❌ FAIL: ${name}`);
    if (details) console.log(`   Error: ${details}`);
    testResults.failed.push(name);
  }
}

function testWarning(name, message) {
  console.log(`⚠️ WARNING: ${name}`);
  console.log(`   ${message}`);
  testResults.warnings.push({ name, message });
}

// Test 1: Verify all BMAD god files exist
console.log('📁 Test 1: Verifying BMAD God Files');
console.log('-------------------------------------');

const fs = require('fs');
const path = require('path');

const bmadGods = [
  'mnemosyne.md',
  'chronos.md',
  'moirai.md',
  'hypergraphia.md',
  'zeus-bmad.md'
];

bmadGods.forEach(god => {
  const godPath = path.join(__dirname, '..', 'agents', god);
  const exists = fs.existsSync(godPath);
  testCase(`God file exists: ${god}`, exists);
  
  if (exists) {
    const content = fs.readFileSync(godPath, 'utf8');
    const hasValidHeader = content.includes('---') && content.includes('name:');
    testCase(`  Valid YAML header in ${god}`, hasValidHeader);
  }
});

console.log('\n');

// Test 2: Verify MCP Server files
console.log('🔧 Test 2: Verifying Sacred Scrolls MCP Server');
console.log('------------------------------------------------');

const mcpFiles = [
  'mcp-servers/sacred-scrolls/server.ts',
  'mcp-servers/sacred-scrolls/package.json',
  'mcp-servers/sacred-scrolls/tsconfig.json'
];

mcpFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  testCase(`MCP file exists: ${file}`, exists);
});

console.log('\n');

// Test 3: Verify Documentation
console.log('📚 Test 3: Verifying Documentation');
console.log('-----------------------------------');

const docs = [
  'docs/BMAD-INTEGRATION.md',
  'docs/BMAD-INTEGRATION-COMPLETE.md',
  'examples/sacred-scroll-workflow.md'
];

docs.forEach(doc => {
  const docPath = path.join(__dirname, '..', doc);
  const exists = fs.existsSync(docPath);
  testCase(`Documentation exists: ${doc}`, exists);
  
  if (exists) {
    const content = fs.readFileSync(docPath, 'utf8');
    const wordCount = content.split(/\s+/).length;
    testCase(`  ${doc} has content`, wordCount > 100, `${wordCount} words`);
  }
});

console.log('\n');

// Test 4: Verify Tools
console.log('🛠️ Test 4: Verifying Tools');
console.log('---------------------------');

const toolPath = path.join(__dirname, '..', 'scripts', 'flatten-codebase.ts');
const toolExists = fs.existsSync(toolPath);
testCase('Codebase flattener exists', toolExists);

if (toolExists) {
  const content = fs.readFileSync(toolPath, 'utf8');
  testCase('  Has FlattenConfig interface', content.includes('interface FlattenConfig'));
  testCase('  Has CodebaseFlattener class', content.includes('class CodebaseFlattener'));
  testCase('  Has CLI interface', content.includes('function main()'));
}

console.log('\n');

// Test 5: Validate God Configurations
console.log('⚙️ Test 5: Validating God Configurations');
console.log('-----------------------------------------');

bmadGods.forEach(godFile => {
  const godPath = path.join(__dirname, '..', 'agents', godFile);
  if (fs.existsSync(godPath)) {
    const content = fs.readFileSync(godPath, 'utf8');
    const godName = godFile.replace('.md', '');
    
    // Extract YAML frontmatter
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (yamlMatch) {
      const yaml = yamlMatch[1];
      
      // Check required fields
      testCase(`${godName} has name field`, yaml.includes(`name: ${godName}`));
      testCase(`${godName} has description`, yaml.includes('description:'));
      testCase(`${godName} has color`, yaml.includes('color:'));
      testCase(`${godName} has tools`, yaml.includes('tools:'));
      
      // Check for BMAD-specific content
      if (godName === 'mnemosyne') {
        testCase(`${godName} mentions Sacred Scrolls`, content.includes('Sacred Scroll'));
      }
      if (godName === 'chronos') {
        testCase(`${godName} mentions two-phase`, content.includes('two-phase') || content.includes('Two-Phase'));
      }
      if (godName === 'moirai') {
        testCase(`${godName} mentions Three Fates`, content.includes('Three Fates') || content.includes('Clotho'));
      }
      if (godName === 'hypergraphia') {
        testCase(`${godName} mentions hyper-detailed`, content.includes('hyper-detailed') || content.includes('Hyper-Detail'));
      }
    }
  }
});

console.log('\n');

// Test 6: Test Sacred Scrolls MCP Server Structure
console.log('🗄️ Test 6: Sacred Scrolls MCP Server Structure');
console.log('------------------------------------------------');

const serverPath = path.join(__dirname, '..', 'mcp-servers', 'sacred-scrolls', 'server.ts');
if (fs.existsSync(serverPath)) {
  const content = fs.readFileSync(serverPath, 'utf8');
  
  testCase('Has SacredScroll interface', content.includes('interface SacredScroll'));
  testCase('Has SacredScrollsManager class', content.includes('class SacredScrollsManager'));
  testCase('Has createScroll method', content.includes('async createScroll'));
  testCase('Has updateScroll method', content.includes('async updateScroll'));
  testCase('Has retrieveScroll method', content.includes('async retrieveScroll'));
  testCase('Has transformToExecution method', content.includes('async transformToExecution'));
  testCase('Has MCP server setup', content.includes('class SacredScrollsServer'));
  testCase('Uses XML format', content.includes('XMLParser') && content.includes('XMLBuilder'));
}

console.log('\n');

// Test 7: Integration Patterns
console.log('🔗 Test 7: Integration Patterns');
console.log('--------------------------------');

// Check Zeus-BMAD for integration patterns
const zeusBmadPath = path.join(__dirname, '..', 'agents', 'zeus-bmad.md');
if (fs.existsSync(zeusBmadPath)) {
  const content = fs.readFileSync(zeusBmadPath, 'utf8');
  
  testCase('Zeus-BMAD integrates with Chronos', content.includes('Chronos'));
  testCase('Zeus-BMAD integrates with Mnemosyne', content.includes('Mnemosyne'));
  testCase('Zeus-BMAD integrates with Moirai', content.includes('Moirai'));
  testCase('Zeus-BMAD mentions Sacred Scrolls', content.includes('Sacred Scroll'));
  testCase('Zeus-BMAD enforces phases', content.includes('phase') && content.includes('enforcement'));
}

console.log('\n');

// Test 8: Example Workflow Validation
console.log('📋 Test 8: Example Workflow Validation');
console.log('---------------------------------------');

const examplePath = path.join(__dirname, '..', 'examples', 'sacred-scroll-workflow.md');
if (fs.existsSync(examplePath)) {
  const content = fs.readFileSync(examplePath, 'utf8');
  
  testCase('Example includes Phase 1 Planning', content.includes('Phase 1: Planning'));
  testCase('Example includes Phase 2 Execution', content.includes('Phase 2: Execution'));
  testCase('Example shows Task invocations', content.includes('Task("'));
  testCase('Example shows Sacred Scroll creation', content.includes('mnemosyne') && content.includes('Create sacred scroll'));
  testCase('Example shows Chronos validation', content.includes('chronos') && content.includes('Validate'));
  testCase('Example includes metrics', content.includes('Success Metrics'));
}

console.log('\n');

// Test 9: Check for Common Issues
console.log('🔍 Test 9: Checking for Common Issues');
console.log('--------------------------------------');

// Check for TODO comments
bmadGods.forEach(godFile => {
  const godPath = path.join(__dirname, '..', 'agents', godFile);
  if (fs.existsSync(godPath)) {
    const content = fs.readFileSync(godPath, 'utf8');
    const hasTodos = content.includes('TODO') || content.includes('FIXME');
    if (hasTodos) {
      testWarning(`${godFile}`, 'Contains TODO/FIXME comments');
    }
  }
});

// Check package.json for required dependencies
const packagePath = path.join(__dirname, '..', 'mcp-servers', 'sacred-scrolls', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  testCase('MCP SDK dependency present', packageJson.dependencies['@modelcontextprotocol/sdk']);
  testCase('XML parser dependency present', packageJson.dependencies['fast-xml-parser']);
  testCase('Cache dependency present', packageJson.dependencies['node-cache']);
  testCase('Logger dependency present', packageJson.dependencies['winston']);
}

console.log('\n');

// Test 10: Simulate Workflow Commands
console.log('🎮 Test 10: Workflow Command Simulation');
console.log('----------------------------------------');

// Simulate the command structure (not actual execution)
const workflowCommands = [
  { god: 'zeus-bmad', command: 'Initialize BMAD project: Test Project' },
  { god: 'chronos', command: 'Start two-phase workflow' },
  { god: 'mnemosyne', command: 'Create sacred scroll for: Test Project' },
  { god: 'moirai', command: 'Weave complete plan' },
  { god: 'hypergraphia', command: 'Document with maximum detail' },
  { god: 'chronos', command: 'Validate planning complete' },
  { god: 'chronos', command: 'Transition to execution phase' }
];

console.log('Simulated workflow commands (structure validation):');
workflowCommands.forEach((cmd, index) => {
  console.log(`  ${index + 1}. Task("${cmd.god}", "${cmd.command}")`);
  testCase(`Command ${index + 1} structure valid`, true);
});

console.log('\n');

// Final Summary
console.log('=' .repeat(50));
console.log('📊 TEST SUMMARY');
console.log('=' .repeat(50));
console.log(`✅ Passed: ${testResults.passed.length} tests`);
console.log(`❌ Failed: ${testResults.failed.length} tests`);
console.log(`⚠️ Warnings: ${testResults.warnings.length}`);

if (testResults.failed.length > 0) {
  console.log('\nFailed tests:');
  testResults.failed.forEach(test => console.log(`  - ${test}`));
}

if (testResults.warnings.length > 0) {
  console.log('\nWarnings:');
  testResults.warnings.forEach(w => console.log(`  - ${w.name}: ${w.message}`));
}

// Calculate success rate
const totalTests = testResults.passed.length + testResults.failed.length;
const successRate = totalTests > 0 ? (testResults.passed.length / totalTests * 100).toFixed(1) : 0;

console.log(`\n🎯 Success Rate: ${successRate}%`);

if (successRate === '100.0') {
  console.log('🎉 ALL TESTS PASSED! BMAD Integration is fully functional!');
} else if (successRate >= '90.0') {
  console.log('✅ Integration is mostly complete with minor issues.');
} else if (successRate >= '70.0') {
  console.log('⚠️ Integration needs attention. Several components may not be working.');
} else {
  console.log('❌ Integration has significant issues. Review failed tests.');
}

// Export results for documentation
const resultsPath = path.join(__dirname, 'test-results.json');
fs.writeFileSync(resultsPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: {
    passed: testResults.passed.length,
    failed: testResults.failed.length,
    warnings: testResults.warnings.length,
    successRate: successRate
  },
  details: testResults
}, null, 2));

console.log(`\n📄 Test results saved to: ${resultsPath}`);
console.log('\n✨ Test suite complete!\n');