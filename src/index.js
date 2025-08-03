import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRegistry } from './agents/AgentRegistry.js';
import winston from 'winston';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Pantheon Multi-AI Ecosystem
 * Main entry point for the orchestration system
 */
class PantheonEcosystem {
  constructor() {
    this.registry = null;
    this.logger = this.setupLogger();
    this.isRunning = false;
  }
  
  /**
   * Setup logger
   */
  setupLogger() {
    return winston.createLogger({
      level: process.env.PANTHEON_LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple()
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
  }
  
  /**
   * Initialize the ecosystem
   */
  async initialize() {
    try {
      this.logger.info('🏛️  Initializing Pantheon Multi-AI Ecosystem...');
      
      // Validate environment
      this.validateEnvironment();
      
      // Initialize agent registry
      this.registry = getRegistry();
      
      // Create core agents
      await this.createCoreAgents();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.isRunning = true;
      this.logger.info('✅ Pantheon ecosystem initialized successfully');
      
      // Display status
      this.displayStatus();
      
    } catch (error) {
      this.logger.error('Failed to initialize ecosystem', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Validate environment configuration
   */
  validateEnvironment() {
    const required = ['CLAUDE_API_KEY', 'GEMINI_API_KEY'];
    const missing = [];
    
    for (const key of required) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
    
    if (missing.length > 0) {
      this.logger.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
      this.logger.warn('Please configure these in your .env file');
      // Don't throw error for demo purposes
    }
    
    this.logger.info('Environment validated', {
      environment: process.env.PANTHEON_ENV || 'development',
      logLevel: process.env.PANTHEON_LOG_LEVEL || 'info'
    });
  }
  
  /**
   * Create core agents
   */
  async createCoreAgents() {
    this.logger.info('Creating core agents...');
    
    try {
      // Create primary creator agent
      const architect = await this.registry.createAgent('claude-architect');
      this.logger.info('✅ Created Claude Architect', { id: architect.id });
      
      // Create primary validator agent
      const advisor = await this.registry.createAgent('gemini-advisor');
      this.logger.info('✅ Created Gemini Advisor', { id: advisor.id });
      
      // Create builder agent
      const builder = await this.registry.createAgent('claude-builder');
      this.logger.info('✅ Created Claude Builder', { id: builder.id });
      
    } catch (error) {
      this.logger.error('Failed to create core agents', { error: error.message });
      // Continue anyway for demo
    }
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for agent events
    this.registry.on('agentCreated', (data) => {
      this.logger.info('🤖 Agent created', { agent: data.agent.name });
    });
    
    this.registry.on('taskCompleted', (data) => {
      this.logger.info('✅ Task completed', { 
        agent: data.agent.name,
        task: data.task.type 
      });
    });
    
    this.registry.on('validationCompleted', (data) => {
      this.logger.info('🔍 Validation completed', {
        validator: data.validator.name,
        passed: data.result.validation.passed
      });
    });
    
    this.registry.on('agentError', (data) => {
      this.logger.error('❌ Agent error', {
        agent: data.agent.name,
        error: data.error.message
      });
    });
  }
  
  /**
   * Display ecosystem status
   */
  displayStatus() {
    const stats = this.registry.getStatistics();
    const agents = this.registry.getAllAgents();
    
    console.log('\n' + '='.repeat(60));
    console.log('🏛️  PANTHEON MULTI-AI ECOSYSTEM STATUS');
    console.log('='.repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   • Active Agents: ${stats.activeAgents}`);
    console.log(`   • Total Tasks Executed: ${stats.totalTasksExecuted}`);
    console.log(`   • Total Validations: ${stats.totalValidations}`);
    console.log('\n🤖 Active Agents:');
    
    for (const agent of agents) {
      const status = agent.getStatus();
      console.log(`   • ${status.name} (${status.model})`);
      console.log(`     - State: ${status.state}`);
      console.log(`     - Mode: ${status.collaborationMode}`);
      console.log(`     - Tools: ${status.tools.join(', ')}`);
      if (status.restrictions.length > 0) {
        console.log(`     - Restrictions: ${status.restrictions.join(', ')}`);
      }
    }
    
    console.log('='.repeat(60) + '\n');
  }
  
  /**
   * Execute a task
   */
  async executeTask(agentName, task) {
    try {
      const agent = this.registry.getAgentByName(agentName);
      
      if (!agent) {
        throw new Error(`Agent ${agentName} not found`);
      }
      
      this.logger.info(`Executing task with ${agentName}`, { taskType: task.type });
      
      const result = await agent.execute(task);
      
      this.logger.info('Task completed', { 
        success: result.success,
        agent: agentName 
      });
      
      return result;
      
    } catch (error) {
      this.logger.error('Task execution failed', { 
        error: error.message,
        agent: agentName 
      });
      throw error;
    }
  }
  
  /**
   * Demo: Run example workflow
   */
  async runDemo() {
    this.logger.info('\n🎭 Running demonstration workflow...\n');
    
    try {
      // Step 1: Architect designs a system
      this.logger.info('Step 1: Claude Architect designs system architecture');
      const architectureResult = await this.executeTask('claude-architect', {
        type: 'design_system',
        data: {
          requirements: {
            name: 'User Authentication System',
            features: ['login', 'registration', 'password reset', 'JWT tokens'],
            scalability: 'high',
            security: 'critical'
          },
          constraints: {
            technology: 'Node.js',
            database: 'PostgreSQL'
          }
        }
      });
      
      this.logger.info('Architecture design completed', {
        pattern: architectureResult.pattern,
        componentsCount: architectureResult.componentsCount
      });
      
      // Step 2: Gemini validates the architecture
      this.logger.info('\nStep 2: Gemini Advisor validates the architecture');
      const validationResult = await this.executeTask('gemini-advisor', {
        type: 'validate_architecture',
        data: {
          architecture: architectureResult.architecture
        }
      });
      
      this.logger.info('Validation completed', {
        passed: validationResult.validation.passed,
        score: validationResult.validation.score
      });
      
      // Step 3: Claude Builder implements a component
      this.logger.info('\nStep 3: Claude Builder implements authentication component');
      const implementationResult = await this.executeTask('claude-builder', {
        type: 'implement_component',
        data: {
          component: {
            name: 'auth-service',
            type: 'service',
            responsibilities: ['User authentication', 'JWT token generation', 'Password validation']
          },
          architecture: architectureResult.architecture,
          requirements: {}
        }
      });
      
      this.logger.info('Implementation completed', {
        filesCreated: implementationResult.filesCreated,
        linesOfCode: implementationResult.linesOfCode
      });
      
      this.logger.info('\n✅ Demo workflow completed successfully!\n');
      
    } catch (error) {
      this.logger.error('Demo workflow failed', { error: error.message });
    }
  }
  
  /**
   * Shutdown the ecosystem
   */
  async shutdown() {
    this.logger.info('Shutting down Pantheon ecosystem...');
    
    if (this.registry) {
      await this.registry.terminateAll();
    }
    
    this.isRunning = false;
    this.logger.info('Pantheon ecosystem shut down');
  }
}

// Main execution
async function main() {
  const ecosystem = new PantheonEcosystem();
  
  try {
    // Initialize ecosystem
    await ecosystem.initialize();
    
    // Run demo if requested
    if (process.argv.includes('--demo')) {
      await ecosystem.runDemo();
    }
    
    // Keep running unless in demo mode
    if (!process.argv.includes('--demo')) {
      console.log('\n💡 Ecosystem is running. Press Ctrl+C to exit.\n');
      
      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n\nReceived SIGINT, shutting down gracefully...');
        await ecosystem.shutdown();
        process.exit(0);
      });
    } else {
      // Shutdown after demo
      await ecosystem.shutdown();
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PantheonEcosystem };
export default PantheonEcosystem;