import { BacoService } from './baco-service.js';
import path from 'path';
import fs from 'fs/promises';

// Example usage and basic tests
async function testBacoService() {
  // Create a test directory
  const testDir = path.join(process.cwd(), 'test-baco');
  await fs.mkdir(testDir, { recursive: true });

  // Initialize service with test directory
  const baco = new BacoService(testDir);

  console.log('Testing BACO Service...\n');

  // Test 1: Check if .claude directory exists (should be false initially)
  console.log('1. Checking if BACO is initialized:');
  const isInitialized = await baco.checkClaudeDirectory();
  console.log(`   Initialized: ${isInitialized}\n`);

  // Test 2: Initialize BACO
  console.log('2. Initializing BACO:');
  const initResult = await baco.initBaco();
  console.log(`   Success: ${initResult.success}`);
  console.log(`   Message: ${initResult.output || initResult.error}\n`);

  // Test 3: Check status after initialization
  console.log('3. Getting BACO status:');
  const status = await baco.getStatus();
  console.log(`   Status:`, JSON.stringify(status, null, 2), '\n');

  // Test 4: List available commands
  console.log('4. Listing available commands:');
  const commands = await baco.listCommands();
  console.log(`   Commands: ${commands.join(', ')}\n`);

  // Test 5: Execute help command
  console.log('5. Executing /help command:');
  const helpResult = await baco.executeCommand('/help');
  console.log(`   Success: ${helpResult.success}`);
  if (helpResult.output) {
    console.log(`   Output preview: ${helpResult.output.substring(0, 100)}...`);
  }

  // Cleanup test directory
  await fs.rm(testDir, { recursive: true, force: true });
  console.log('\nTest completed and cleaned up.');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBacoService().catch(console.error);
}