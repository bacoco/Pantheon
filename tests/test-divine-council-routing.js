#!/usr/bin/env node

/**
 * Test Divine Council with Claude/Gemini Routing
 * Demonstrates cost-optimized god invocation
 */

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);

// Load router
const routerPath = path.join(process.env.HOME, '.claude-code-router', 'smart-router.js');
const router = require(routerPath);

console.log('🏛️  DIVINE COUNCIL ROUTING TEST\n');
console.log('Testing intelligent Claude/Gemini routing for cost optimization\n');

// Test scenarios
const scenarios = [
  {
    name: 'Project Planning Session',
    description: 'Zeus and Athena plan architecture (Claude), Apollo validates (Gemini)',
    gods: [
      { name: 'zeus', task: 'Orchestrate project planning' },
      { name: 'athena', task: 'Design system architecture' },
      { name: 'apollo', task: 'Validate architecture quality' },
      { name: 'hermes', task: 'Distribute planning updates' }
    ]
  },
  {
    name: 'Implementation Phase',
    description: 'Hephaestus builds (Claude), Apollo tests (Gemini)',
    gods: [
      { name: 'hephaestus', task: 'Build core implementation' },
      { name: 'apollo', task: 'Run quality tests' },
      { name: 'argus', task: 'Security validation' },
      { name: 'hermes', task: 'Progress updates' }
    ]
  },
  {
    name: 'Validation Sprint',
    description: 'All validation gods use Gemini (FREE)',
    gods: [
      { name: 'apollo', task: 'Code quality review' },
      { name: 'themis', task: 'Compliance check' },
      { name: 'argus', task: 'Security audit' },
      { name: 'hermes', task: 'Final report' }
    ]
  },
  {
    name: 'Quick Status Check',
    description: 'Support gods use Gemini Flash (FREE & FAST)',
    gods: [
      { name: 'hermes', task: 'Project status' },
      { name: 'calliope', task: 'Documentation status' },
      { name: 'iris', task: 'Communication summary' }
    ]
  }
];

// Process each scenario
scenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}`);
  console.log(`   ${scenario.description}`);
  console.log('   ' + '─'.repeat(60));
  
  let scenarioCost = 0;
  
  scenario.gods.forEach(god => {
    const request = {
      agent: god.name,
      task: god.task
    };
    
    const decision = router.route(request);
    
    const costDisplay = decision.cost === 'free' ? 
      '✅ FREE' : 
      `💰 $${decision.estimatedCost.toFixed(3)}`;
    
    console.log(`   ${god.name.padEnd(12)} → ${decision.provider}/${decision.model.padEnd(20)} ${costDisplay}`);
    
    scenarioCost += decision.estimatedCost || 0;
  });
  
  console.log(`   Total Cost: $${scenarioCost.toFixed(3)}`);
});

// Get final cost report
console.log('\n' + '='.repeat(70));
console.log('💰 COST OPTIMIZATION REPORT\n');

const report = router.getCostReport();

console.log('Session Summary:');
console.log(`  Total Requests: ${report.requests.total}`);
console.log(`  Claude Requests: ${report.requests.claude} (Paid)`);
console.log(`  Gemini Requests: ${report.requests.gemini} (FREE)`);
console.log(`  Free Tier Usage: ${report.requests.percentFree}%`);

console.log('\nCost Breakdown:');
console.log(`  Claude Costs: $${report.summary.claudeCost}`);
console.log(`  Gemini Costs: $${report.summary.geminiCost}`);
console.log(`  Total Session: $${report.summary.totalCost}`);
console.log(`  Savings: $${report.summary.savings}`);

console.log('\nOptimization Status:', report.optimization.status);
console.log('Recommendation:', report.optimization.recommendation);

// Calculate monthly projection
const sessionsPerDay = 10;
const monthlyProjection = {
  withoutOptimization: (report.requests.total * 0.003 * sessionsPerDay * 30).toFixed(2),
  withOptimization: (parseFloat(report.summary.totalCost) * sessionsPerDay * 30).toFixed(2),
  monthlySavings: 0
};
monthlyProjection.monthlySavings = (
  parseFloat(monthlyProjection.withoutOptimization) - 
  parseFloat(monthlyProjection.withOptimization)
).toFixed(2);

console.log('\n📊 Monthly Projection (10 sessions/day):');
console.log(`  Without Optimization: $${monthlyProjection.withoutOptimization}`);
console.log(`  With Optimization: $${monthlyProjection.withOptimization}`);
console.log(`  Monthly Savings: $${monthlyProjection.monthlySavings}`);

// Show example commands
console.log('\n🎯 DIVINE COUNCIL COMMANDS:\n');
console.log('  /gods init       - Initialize project (Mixed models)');
console.log('  /gods plan       - Planning session (Claude heavy)');
console.log('  /gods validate   - Validation only (100% Gemini FREE)');
console.log('  /gods status     - Quick status (Gemini Flash FREE)');
console.log('  /gods execute    - Build & validate (Mixed models)');

console.log('\n✅ Divine Council routing test complete!');
console.log('   The gods work together, optimizing quality and cost.\n');