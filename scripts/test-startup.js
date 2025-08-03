#!/usr/bin/env node

/**
 * Test Pantheon Multi-AI Ecosystem Startup
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log(chalk.cyan('\n🧪 Testing Pantheon Multi-AI Ecosystem Startup\n'));
console.log(chalk.gray('='.repeat(60)));

async function testStartup() {
  const tests = [];
  
  // Test 1: Environment setup
  console.log(chalk.yellow('1. Testing environment setup...'));
  try {
    // Check if .env exists, if not copy from example
    const envPath = path.join(rootDir, '.env');
    try {
      await fs.access(envPath);
      console.log(chalk.green('   ✓ .env file exists'));
    } catch {
      const examplePath = path.join(rootDir, '.env.example');
      await fs.copyFile(examplePath, envPath);
      console.log(chalk.yellow('   ⚠ Created .env from .env.example'));
    }
    tests.push({ name: 'Environment', passed: true });
  } catch (error) {
    console.log(chalk.red('   ✗ Environment setup failed:', error.message));
    tests.push({ name: 'Environment', passed: false, error: error.message });
  }
  
  // Test 2: Core imports
  console.log(chalk.yellow('2. Testing core imports...'));
  try {
    const { PantheonAgent } = await import('../src/agents/PantheonAgent.js');
    const { AgentRegistry } = await import('../src/agents/AgentRegistry.js');
    const { SmartRouter } = await import('../src/router/SmartRouter.js');
    const { PantheonWorkflow } = await import('../src/workflows/PantheonWorkflow.js');
    const { ValidationOrchestrator } = await import('../src/validation/ValidationOrchestrator.js');
    
    console.log(chalk.green('   ✓ All core modules imported successfully'));
    tests.push({ name: 'Core Imports', passed: true });
  } catch (error) {
    console.log(chalk.red('   ✗ Import failed:', error.message));
    tests.push({ name: 'Core Imports', passed: false, error: error.message });
  }
  
  // Test 3: Agent Registry
  console.log(chalk.yellow('3. Testing Agent Registry...'));
  try {
    const { getRegistry } = await import('../src/agents/AgentRegistry.js');
    const registry = getRegistry();
    
    console.log(chalk.green('   ✓ Agent Registry initialized'));
    console.log(chalk.gray(`   • Total agents: ${registry.agents.length}`));
    tests.push({ name: 'Agent Registry', passed: true });
  } catch (error) {
    console.log(chalk.red('   ✗ Registry failed:', error.message));
    tests.push({ name: 'Agent Registry', passed: false, error: error.message });
  }
  
  // Test 4: Create test agents
  console.log(chalk.yellow('4. Testing agent creation...'));
  try {
    const { getRegistry } = await import('../src/agents/AgentRegistry.js');
    const registry = getRegistry();
    
    // Create Claude agent
    const architect = await registry.createAgent('claude-architect', {
      model: 'claude-sonnet',
      testMode: true
    });
    console.log(chalk.green('   ✓ Claude Architect created'));
    
    // Create Gemini agent
    const advisor = await registry.createAgent('gemini-advisor', {
      model: 'gemini-2.5-pro',
      testMode: true
    });
    console.log(chalk.green('   ✓ Gemini Advisor created'));
    
    // Verify Gemini restrictions
    if (advisor.tools.includes('Write') || advisor.tools.includes('Edit')) {
      throw new Error('Gemini has write permissions!');
    }
    console.log(chalk.green('   ✓ Gemini write restrictions verified'));
    
    tests.push({ name: 'Agent Creation', passed: true });
  } catch (error) {
    console.log(chalk.red('   ✗ Agent creation failed:', error.message));
    tests.push({ name: 'Agent Creation', passed: false, error: error.message });
  }
  
  // Test 5: Router initialization
  console.log(chalk.yellow('5. Testing Smart Router...'));
  try {
    const { getRouter } = await import('../src/router/SmartRouter.js');
    const router = getRouter();
    
    // Test routing decision
    const route = router.getOptimalRoute('creation', {
      contextSize: 1000,
      priority: 'medium'
    });
    
    console.log(chalk.green('   ✓ Router initialized'));
    console.log(chalk.gray(`   • Suggested route: ${route.provider}-${route.model}`));
    tests.push({ name: 'Smart Router', passed: true });
  } catch (error) {
    console.log(chalk.red('   ✗ Router failed:', error.message));
    tests.push({ name: 'Smart Router', passed: false, error: error.message });
  }
  
  // Test 6: Workflow engine
  console.log(chalk.yellow('6. Testing Workflow Engine...'));
  try {
    const { PantheonWorkflow } = await import('../src/workflows/PantheonWorkflow.js');
    
    const testWorkflow = new PantheonWorkflow({
      name: 'test-workflow',
      stages: {
        test: {
          agent: 'claude-architect',
          task: 'Test task'
        }
      }
    });
    
    console.log(chalk.green('   ✓ Workflow engine initialized'));
    console.log(chalk.gray(`   • Workflow stages: ${Object.keys(testWorkflow.stages).length}`));
    tests.push({ name: 'Workflow Engine', passed: true });
  } catch (error) {
    console.log(chalk.red('   ✗ Workflow engine failed:', error.message));
    tests.push({ name: 'Workflow Engine', passed: false, error: error.message });
  }
  
  // Test 7: Validation pipeline
  console.log(chalk.yellow('7. Testing Validation Pipeline...'));
  try {
    const { ValidationOrchestrator } = await import('../src/validation/ValidationOrchestrator.js');
    
    const orchestrator = new ValidationOrchestrator({
      strictMode: true,
      autoTrigger: false
    });
    
    // Verify Gemini is configured for validation
    const profile = orchestrator.validationProfiles.code_quality;
    if (!profile.validators.includes('gemini-advisor')) {
      throw new Error('Gemini not configured as validator');
    }
    
    console.log(chalk.green('   ✓ Validation pipeline initialized'));
    console.log(chalk.gray('   • Gemini configured as validator'));
    tests.push({ name: 'Validation Pipeline', passed: true });
  } catch (error) {
    console.log(chalk.red('   ✗ Validation failed:', error.message));
    tests.push({ name: 'Validation Pipeline', passed: false, error: error.message });
  }
  
  // Test 8: Cost controller
  console.log(chalk.yellow('8. Testing Cost Controller...'));
  try {
    const { CostOptimizer } = await import('../src/router/CostOptimizer.js');
    
    const optimizer = new CostOptimizer({
      preferFreeTier: true,
      dailyBudget: 100
    });
    
    const recommendation = optimizer.getOptimizationRecommendation('validation', 5000);
    
    console.log(chalk.green('   ✓ Cost controller initialized'));
    console.log(chalk.gray(`   • Recommended: ${recommendation.provider}-${recommendation.model}`));
    console.log(chalk.gray(`   • Reason: ${recommendation.reason}`));
    tests.push({ name: 'Cost Controller', passed: true });
  } catch (error) {
    console.log(chalk.red('   ✗ Cost controller failed:', error.message));
    tests.push({ name: 'Cost Controller', passed: false, error: error.message });
  }
  
  // Display results
  console.log(chalk.cyan('\n📊 Test Results\n'));
  console.log(chalk.gray('='.repeat(60)));
  
  const passed = tests.filter(t => t.passed).length;
  const total = tests.length;
  const percentage = (passed / total) * 100;
  
  tests.forEach(test => {
    const icon = test.passed ? chalk.green('✓') : chalk.red('✗');
    const status = test.passed ? chalk.green('PASSED') : chalk.red('FAILED');
    console.log(`${icon} ${test.name}: ${status}`);
    if (test.error) {
      console.log(chalk.gray(`  Error: ${test.error}`));
    }
  });
  
  console.log(chalk.gray('\n' + '='.repeat(60)));
  
  if (percentage === 100) {
    console.log(chalk.green.bold(`\n✅ ALL TESTS PASSED (${passed}/${total})`));
    console.log(chalk.green('The Pantheon Multi-AI Ecosystem is ready to run!\n'));
    console.log(chalk.cyan('To start the system:'));
    console.log(chalk.gray('  npm start          # Run the ecosystem'));
    console.log(chalk.gray('  npm start -- --demo # Run with demo workflow\n'));
  } else if (percentage >= 75) {
    console.log(chalk.yellow.bold(`\n⚠️  TESTS PASSED WITH WARNINGS (${passed}/${total})`));
    console.log(chalk.yellow('Some components need attention but core functionality works.\n'));
  } else {
    console.log(chalk.red.bold(`\n❌ TESTS FAILED (${passed}/${total})`));
    console.log(chalk.red('Please fix the issues above before running.\n'));
  }
  
  // Cleanup test agents
  try {
    const { getRegistry } = await import('../src/agents/AgentRegistry.js');
    const registry = getRegistry();
    await registry.terminateAll();
  } catch {
    // Ignore cleanup errors
  }
}

// Run tests
testStartup().catch(console.error);