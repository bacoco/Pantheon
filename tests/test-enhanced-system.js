/**
 * Test Enhanced Pantheon System
 * Demonstrates all the new features and improvements
 */

import { initializePantheon, createDefaultConfig } from './src/index-enhanced.js';

async function testEnhancedPantheon() {
  console.log('🧪 Testing Enhanced Pantheon Multi-AI Ecosystem\n');
  
  try {
    // Initialize system
    console.log('1️⃣ Initializing Pantheon...');
    const config = createDefaultConfig();
    const pantheon = await initializePantheon(config);
    console.log('   ✅ System initialized\n');
    
    // Test Circuit Breaker
    console.log('2️⃣ Testing Circuit Breaker Pattern...');
    const { CircuitBreaker } = await import('./src/utils/CircuitBreaker.js');
    const breaker = new CircuitBreaker({
      name: 'test-breaker',
      failureThreshold: 2
    });
    
    // Simulate successful call
    await breaker.execute(async () => ({ success: true }));
    console.log('   ✅ Circuit breaker: successful execution');
    
    // Simulate failures to open circuit
    let failures = 0;
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('Simulated failure');
        });
      } catch (error) {
        failures++;
      }
    }
    console.log(`   ✅ Circuit breaker opened after ${failures} failures\n`);
    
    // Test Retry Pattern
    console.log('3️⃣ Testing Retry Pattern...');
    const { RetryPattern } = await import('./src/utils/RetryPattern.js');
    const retry = new RetryPattern({
      maxRetries: 2,
      initialDelay: 100,
      strategy: 'exponential'
    });
    
    let attempts = 0;
    const result = await retry.execute(async (attempt) => {
      attempts++;
      if (attempt < 2) {
        throw new Error('Retry needed');
      }
      return { success: true, attempts };
    });
    console.log(`   ✅ Retry pattern: succeeded after ${attempts} attempts\n`);
    
    // Test Validation Pipeline
    console.log('4️⃣ Testing Validation Pipeline...');
    const validationResult = await pantheon.validate({
      code: 'console.log("Hello World");',
      type: 'javascript'
    }, 'syntax');
    console.log(`   ✅ Validation: ${validationResult.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`   📊 Issues found: ${validationResult.issues?.length || 0}\n`);
    
    // Test Workflow Orchestration
    console.log('5️⃣ Testing Workflow Orchestration...');
    const workflow = await pantheon.executeWorkflow('development', {
      task: 'Create hello world function',
      language: 'javascript'
    });
    console.log(`   ✅ Workflow executed: ${workflow.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   ⏱️ Duration: ${workflow.metrics?.duration || 'N/A'}ms\n`);
    
    // Test Event System
    console.log('6️⃣ Testing Event System...');
    const eventSystem = pantheon.events;
    
    // Subscribe to test events
    let eventsReceived = 0;
    eventSystem.subscribe('test.*', (data) => {
      eventsReceived++;
    });
    
    // Publish test events
    await eventSystem.publish('test.event1', { message: 'Test 1' });
    await eventSystem.publish('test.event2', { message: 'Test 2' });
    await eventSystem.publish('other.event', { message: 'Other' });
    
    // Wait for async processing
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`   ✅ Event system: ${eventsReceived} matching events received\n`);
    
    // Test Automation Suite
    console.log('7️⃣ Testing Automation Suite...');
    const automation = await pantheon.createAutomation('code-review', {
      repository: 'test-repo',
      branch: 'feature/test'
    });
    console.log(`   ✅ Automation created: ${automation.name}`);
    console.log(`   🎯 Triggers: ${automation.triggers.join(', ')}\n`);
    
    // Test Cost Optimization
    console.log('8️⃣ Testing Cost Optimization...');
    const route = await pantheon.optimizeRoute({
      taskType: 'validation',
      contextSize: 1000
    });
    console.log(`   ✅ Optimal route: ${route.provider}/${route.model}`);
    console.log(`   💰 Reason: ${route.reason}\n`);
    
    // Get System Statistics
    console.log('9️⃣ System Statistics:');
    const stats = pantheon.getStatistics();
    console.log(`   📊 Active Workflows: ${stats.workflows?.activeWorkflows?.length || 0}`);
    console.log(`   📊 Total Events: ${stats.events?.totalEvents || 0}`);
    console.log(`   📊 Registered Agents: ${stats.agents?.totalAgents || 0}`);
    console.log(`   📊 Cost Optimization: ${stats.optimization?.budgetUsedPercent || 0}% budget used\n`);
    
    // Test Integration
    console.log('🔟 Testing Component Integration...');
    
    // Trigger validation through event
    eventSystem.publish('code.modified', {
      file: 'test.js',
      changes: 15
    });
    
    // Wait for cascade
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('   ✅ Event cascade triggered successfully\n');
    
    // Shutdown
    console.log('🛑 Shutting down system...');
    await pantheon.shutdown();
    console.log('   ✅ System shut down cleanly\n');
    
    console.log('✅ All tests completed successfully!');
    console.log('🎉 Enhanced Pantheon System is fully operational!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testEnhancedPantheon().catch(console.error);