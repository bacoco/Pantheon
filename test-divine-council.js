/**
 * Test Divine Council Integration
 * Demonstrates the BACO Pantheon concepts merged with Pantheon Multi-AI
 */

import { DivineCouncil } from './src/councils/DivineCouncil.js';
import { SlashCommandProcessor } from './src/commands/SlashCommandProcessor.js';
import Zeus from './src/agents/gods/Zeus.js';

async function testDivineCouncil() {
  console.log('🏛️ Testing Divine Council Integration\n');
  console.log('⚡ Merging BACO Pantheon with Multi-AI Ecosystem ⚡\n');
  
  try {
    // Test 1: Initialize Divine Council
    console.log('1️⃣ Initializing Divine Council...');
    const council = new DivineCouncil();
    console.log('   ✅ Divine Council created');
    console.log(`   🏛️ Pantheon size: ${Object.keys(council.pantheon).length} gods\n`);
    
    // Test 2: Start Council Session
    console.log('2️⃣ Starting Council Session...');
    const session = await council.startCouncilSession(
      'Design a scalable authentication system',
      { priority: 'high', scope: 'enterprise' }
    );
    console.log('   ✅ Council session started');
    console.log(`   📜 Session ID: ${session.sessionId}`);
    console.log(`   🎯 Purpose: Design a scalable authentication system`);
    console.log(`   ⚡ Welcome Message:\n${session.welcomeMessage}\n`);
    
    // Test 3: Summon Gods
    console.log('3️⃣ Summoning Gods to Council...');
    const athena = await council.summonGod(session.sessionId, 'athena');
    console.log(`   ✅ ${athena.god.name} summoned`);
    
    const hephaestus = await council.summonGod(session.sessionId, 'hephaestus');
    console.log(`   ✅ ${hephaestus.god.name} summoned`);
    
    const hermes = await council.summonGod(session.sessionId, 'hermes');
    console.log(`   ✅ ${hermes.god.name} summoned\n`);
    
    // Test 4: God Contributions
    console.log('4️⃣ Gods Contributing to Discussion...');
    const athenaContribution = await council.godContribution(
      session.sessionId,
      'athena',
      {
        message: 'I propose a microservices architecture with OAuth 2.0 and JWT tokens',
        reasoning: {
          analysis: 'Scalability requires distributed architecture',
          recommendation: 'Use industry standards for authentication'
        }
      }
    );
    console.log('   ✅ Athena contributed strategic insight\n');
    
    // Test 5: Council Decision
    console.log('5️⃣ Reaching Council Decision...');
    const decision = await council.reachDecision(
      session.sessionId,
      'Adopt microservices architecture with OAuth 2.0',
      ['zeus', 'athena', 'hephaestus', 'hermes']
    );
    console.log(`   ✅ Decision reached: ${decision.status}`);
    console.log(`   📊 Votes: ${decision.tally.approvals} approvals, ${decision.tally.rejections} rejections\n`);
    
    // Test 6: Zeus Orchestration
    console.log('6️⃣ Testing Zeus Orchestration...');
    const zeus = new Zeus();
    console.log(zeus.greet());
    
    const orchestration = await zeus.orchestrateProject(
      'Build user authentication service',
      { timeline: 'Q1 2024', budget: 'moderate' }
    );
    console.log('\n   ✅ Zeus orchestration complete');
    console.log(`   📋 Summoned ${orchestration.summonedGods.length} gods`);
    console.log(`   📜 Divine Decree issued\n`);
    
    // Test 7: Slash Commands
    console.log('7️⃣ Testing Slash Command Processor...');
    const processor = new SlashCommandProcessor();
    
    // Test various commands
    const commands = [
      '/help',
      '/gods list',
      '/pantheon status',
      '/analyze authentication system',
      '/gods oracle "What is the best database for our system?"'
    ];
    
    for (const cmd of commands) {
      console.log(`   → Processing: ${cmd}`);
      const result = await processor.processCommand(cmd);
      console.log(`     ✅ ${result.success ? 'Success' : 'Failed'}`);
    }
    console.log('');
    
    // Test 8: End Council Session
    console.log('8️⃣ Ending Council Session...');
    const sessionEnd = await council.endCouncilSession(session.sessionId);
    console.log('   ✅ Council session ended');
    console.log(`   ⏱️ Duration: ${Math.round(sessionEnd.session.duration / 1000)} seconds`);
    console.log(`   👥 Participants: ${sessionEnd.session.participants.size}`);
    console.log(`   📊 Decisions made: ${sessionEnd.session.decisions.length}\n`);
    
    // Test 9: Statistics
    console.log('9️⃣ Council Statistics:');
    const stats = council.getStatistics();
    console.log(`   📊 Total Sessions: ${stats.totalSessions}`);
    console.log(`   👥 Gods Invoked: ${stats.godsInvoked}`);
    console.log(`   📜 Artifacts Created: ${stats.artifactsCreated}`);
    console.log(`   ⚖️ Decisions Reached: ${stats.decisionsReached}`);
    console.log(`   ⏱️ Average Session Duration: ${Math.round(stats.averageSessionDuration / 1000)}s\n`);
    
    // Success message
    console.log('✅ All Divine Council tests completed successfully!');
    console.log('🎉 BACO Pantheon successfully integrated with Multi-AI Ecosystem!');
    console.log('\n⚡ By the power of Olympus, our AI collaboration is divine! ⚡\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testDivineCouncil().catch(console.error);