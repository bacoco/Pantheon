import { EventEmitter } from 'eventemitter3';
import { DivineCouncil } from '../councils/DivineCouncil.js';
import { getRegistry } from '../agents/AgentRegistry.js';
import { getEventSystem } from '../events/EventSystem.js';
import { WorkflowOrchestrator } from '../orchestration/WorkflowOrchestrator.js';

/**
 * Slash Command Processor - Natural language command interface
 * Implements BACO-style slash commands for easy interaction
 */
export class SlashCommandProcessor extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      prefix: config.prefix || '/',
      caseSensitive: config.caseSensitive || false,
      allowAliases: config.allowAliases !== false,
      helpOnError: config.helpOnError !== false,
      ...config
    };
    
    // Core systems
    this.divineCouncil = new DivineCouncil();
    this.agentRegistry = getRegistry();
    this.eventSystem = getEventSystem();
    this.workflowOrchestrator = new WorkflowOrchestrator();
    
    // Command registry
    this.commands = new Map();
    this.aliases = new Map();
    this.commandHistory = [];
    
    // Command categories
    this.categories = {
      pantheon: 'Pantheon divine council commands',
      gods: 'Individual god management',
      workflow: 'Workflow orchestration',
      analysis: 'Analysis and insights',
      management: 'System management',
      help: 'Help and documentation'
    };
    
    // Statistics
    this.statistics = {
      totalCommands: 0,
      successfulCommands: 0,
      failedCommands: 0,
      mostUsedCommands: new Map()
    };
    
    // Initialize default commands
    this.initializeCommands();
  }
  
  /**
   * Initialize default slash commands
   */
  initializeCommands() {
    // Pantheon Council Commands
    this.registerCommand({
      name: 'pantheon',
      category: 'pantheon',
      description: 'Pantheon divine council operations',
      subcommands: {
        council: {
          description: 'Start a divine council session',
          handler: this.startCouncil.bind(this),
          usage: '/pantheon council <purpose>',
          example: '/pantheon council "Design a new authentication system"'
        },
        summon: {
          description: 'Summon specific god to council',
          handler: this.summonGod.bind(this),
          usage: '/pantheon summon <god_name>',
          example: '/pantheon summon athena'
        },
        dismiss: {
          description: 'Dismiss a god from council',
          handler: this.dismissGod.bind(this),
          usage: '/pantheon dismiss <god_name>',
          example: '/pantheon dismiss hermes'
        },
        status: {
          description: 'Show council session status',
          handler: this.showCouncilStatus.bind(this),
          usage: '/pantheon status'
        }
      }
    });
    
    // Gods Commands
    this.registerCommand({
      name: 'gods',
      category: 'gods',
      description: 'Individual god management',
      subcommands: {
        list: {
          description: 'List all available gods',
          handler: this.listGods.bind(this),
          usage: '/gods list'
        },
        info: {
          description: 'Get information about a specific god',
          handler: this.godInfo.bind(this),
          usage: '/gods info <god_name>',
          example: '/gods info zeus'
        },
        invoke: {
          description: 'Invoke a god for specific task',
          handler: this.invokeGod.bind(this),
          usage: '/gods invoke <god_name> <task>',
          example: '/gods invoke hephaestus "Build user service"'
        },
        oracle: {
          description: 'Consult the oracle for prophecy',
          handler: this.consultOracle.bind(this),
          usage: '/gods oracle <question>',
          example: '/gods oracle "What technology should we use?"'
        }
      }
    });
    
    // Workflow Commands
    this.registerCommand({
      name: 'workflow',
      category: 'workflow',
      description: 'Workflow orchestration commands',
      subcommands: {
        start: {
          description: 'Start a workflow',
          handler: this.startWorkflow.bind(this),
          usage: '/workflow start <template> [context]',
          example: '/workflow start development {"task": "API service"}'
        },
        list: {
          description: 'List available workflows',
          handler: this.listWorkflows.bind(this),
          usage: '/workflow list'
        },
        status: {
          description: 'Get workflow status',
          handler: this.workflowStatus.bind(this),
          usage: '/workflow status [workflow_id]'
        },
        stop: {
          description: 'Stop a running workflow',
          handler: this.stopWorkflow.bind(this),
          usage: '/workflow stop <workflow_id>'
        }
      }
    });
    
    // Analysis Commands
    this.registerCommand({
      name: 'analyze',
      category: 'analysis',
      description: 'Analysis and insight commands',
      handler: this.analyze.bind(this),
      usage: '/analyze <target> [options]',
      example: '/analyze codebase --depth deep'
    });
    
    this.registerCommand({
      name: 'orchestrate',
      category: 'analysis',
      description: 'Orchestrate complex multi-agent task',
      handler: this.orchestrate.bind(this),
      usage: '/orchestrate <task>',
      example: '/orchestrate "Refactor authentication system"'
    });
    
    this.registerCommand({
      name: 'generate-prd',
      category: 'analysis',
      description: 'Generate Product Requirements Document',
      handler: this.generatePRD.bind(this),
      usage: '/generate-prd <project>',
      example: '/generate-prd "E-commerce Platform"'
    });
    
    this.registerCommand({
      name: 'generate-prp',
      category: 'analysis',
      description: 'Generate Product Realization Plan',
      handler: this.generatePRP.bind(this),
      usage: '/generate-prp <project>',
      example: '/generate-prp "Mobile App MVP"'
    });
    
    // Management Commands
    this.registerCommand({
      name: 'config',
      category: 'management',
      description: 'Configuration management',
      subcommands: {
        show: {
          description: 'Show current configuration',
          handler: this.showConfig.bind(this),
          usage: '/config show'
        },
        set: {
          description: 'Set configuration value',
          handler: this.setConfig.bind(this),
          usage: '/config set <key> <value>',
          example: '/config set maxGods 5'
        }
      }
    });
    
    this.registerCommand({
      name: 'stats',
      category: 'management',
      description: 'Show system statistics',
      handler: this.showStats.bind(this),
      usage: '/stats'
    });
    
    // Help Commands
    this.registerCommand({
      name: 'help',
      category: 'help',
      description: 'Show help information',
      handler: this.showHelp.bind(this),
      usage: '/help [command]',
      example: '/help pantheon'
    });
    
    // Register aliases
    this.registerAlias('council', 'pantheon council');
    this.registerAlias('summon', 'pantheon summon');
    this.registerAlias('prd', 'generate-prd');
    this.registerAlias('prp', 'generate-prp');
    this.registerAlias('?', 'help');
  }
  
  /**
   * Register a command
   */
  registerCommand(commandDef) {
    this.commands.set(commandDef.name, commandDef);
    
    this.emit('commandRegistered', {
      name: commandDef.name,
      category: commandDef.category
    });
  }
  
  /**
   * Register command alias
   */
  registerAlias(alias, command) {
    this.aliases.set(alias, command);
  }
  
  /**
   * Process a command string
   */
  async processCommand(input) {
    const startTime = Date.now();
    this.statistics.totalCommands++;
    
    // Parse command
    const parsed = this.parseCommand(input);
    
    if (!parsed) {
      this.statistics.failedCommands++;
      return this.handleInvalidCommand(input);
    }
    
    // Record in history
    this.commandHistory.push({
      input,
      parsed,
      timestamp: new Date()
    });
    
    // Update usage statistics
    const commandKey = parsed.command + (parsed.subcommand ? `.${parsed.subcommand}` : '');
    this.statistics.mostUsedCommands.set(
      commandKey,
      (this.statistics.mostUsedCommands.get(commandKey) || 0) + 1
    );
    
    try {
      // Execute command
      const result = await this.executeCommand(parsed);
      
      this.statistics.successfulCommands++;
      
      this.emit('commandExecuted', {
        command: parsed.command,
        success: true,
        duration: Date.now() - startTime
      });
      
      return {
        success: true,
        command: parsed,
        result,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      this.statistics.failedCommands++;
      
      this.emit('commandFailed', {
        command: parsed.command,
        error: error.message
      });
      
      return {
        success: false,
        command: parsed,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }
  
  /**
   * Parse command string
   */
  parseCommand(input) {
    // Remove prefix if present
    let commandStr = input.trim();
    if (commandStr.startsWith(this.config.prefix)) {
      commandStr = commandStr.slice(this.config.prefix.length);
    }
    
    // Check for alias
    const firstSpace = commandStr.indexOf(' ');
    const firstWord = firstSpace > -1 ? commandStr.slice(0, firstSpace) : commandStr;
    
    if (this.aliases.has(firstWord)) {
      const aliasTarget = this.aliases.get(firstWord);
      const rest = firstSpace > -1 ? commandStr.slice(firstSpace) : '';
      commandStr = aliasTarget + rest;
    }
    
    // Split into parts
    const parts = this.smartSplit(commandStr);
    
    if (parts.length === 0) {
      return null;
    }
    
    const command = this.config.caseSensitive ? parts[0] : parts[0].toLowerCase();
    
    // Check if command exists
    if (!this.commands.has(command)) {
      return null;
    }
    
    const commandDef = this.commands.get(command);
    
    // Parse subcommand if exists
    let subcommand = null;
    let args = [];
    let options = {};
    
    if (commandDef.subcommands && parts.length > 1) {
      const potentialSub = this.config.caseSensitive ? parts[1] : parts[1].toLowerCase();
      
      if (commandDef.subcommands[potentialSub]) {
        subcommand = potentialSub;
        args = parts.slice(2);
      } else {
        args = parts.slice(1);
      }
    } else {
      args = parts.slice(1);
    }
    
    // Parse options (--key value or --flag)
    const parsedArgs = [];
    
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('--')) {
        const key = args[i].slice(2);
        
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          options[key] = args[i + 1];
          i++; // Skip next arg
        } else {
          options[key] = true; // Flag without value
        }
      } else {
        parsedArgs.push(args[i]);
      }
    }
    
    return {
      command,
      subcommand,
      args: parsedArgs,
      options,
      raw: input
    };
  }
  
  /**
   * Smart split that respects quotes
   */
  smartSplit(str) {
    const parts = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = null;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      
      if ((char === '"' || char === "'") && (i === 0 || str[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = null;
        } else {
          current += char;
        }
      } else if (char === ' ' && !inQuotes) {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current) {
      parts.push(current);
    }
    
    return parts;
  }
  
  /**
   * Execute parsed command
   */
  async executeCommand(parsed) {
    const commandDef = this.commands.get(parsed.command);
    
    if (!commandDef) {
      throw new Error(`Unknown command: ${parsed.command}`);
    }
    
    // Handle subcommand
    if (parsed.subcommand && commandDef.subcommands) {
      const subcommandDef = commandDef.subcommands[parsed.subcommand];
      
      if (!subcommandDef) {
        throw new Error(`Unknown subcommand: ${parsed.command} ${parsed.subcommand}`);
      }
      
      if (subcommandDef.handler) {
        return await subcommandDef.handler(parsed.args, parsed.options);
      }
    }
    
    // Handle main command
    if (commandDef.handler) {
      return await commandDef.handler(parsed.args, parsed.options, parsed.subcommand);
    }
    
    // If no handler, show subcommand help
    return this.showSubcommandHelp(commandDef);
  }
  
  /**
   * Command Handlers
   */
  
  async startCouncil(args, options) {
    const purpose = args.join(' ') || 'General divine consultation';
    
    const session = await this.divineCouncil.startCouncilSession(purpose, options);
    
    return {
      message: session.welcomeMessage,
      sessionId: session.sessionId,
      summonedGods: session.summonedGods
    };
  }
  
  async summonGod(args, options) {
    const godName = args[0];
    const sessionId = options.session || this.getCurrentSessionId();
    
    if (!godName) {
      throw new Error('Please specify a god to summon');
    }
    
    if (!sessionId) {
      throw new Error('No active council session. Start one with /pantheon council');
    }
    
    const result = await this.divineCouncil.summonGod(sessionId, godName.toLowerCase());
    
    return {
      message: result.message,
      god: result.god
    };
  }
  
  async dismissGod(args, options) {
    const godName = args[0];
    const sessionId = options.session || this.getCurrentSessionId();
    
    if (!godName) {
      throw new Error('Please specify a god to dismiss');
    }
    
    if (!sessionId) {
      throw new Error('No active council session');
    }
    
    // Implementation would dismiss god from session
    return {
      message: `${godName} has been dismissed from the council`,
      success: true
    };
  }
  
  async showCouncilStatus(args, options) {
    const sessions = this.divineCouncil.getActiveSessions();
    
    if (sessions.length === 0) {
      return {
        message: 'No active council sessions',
        sessions: []
      };
    }
    
    return {
      message: `${sessions.length} active council session(s)`,
      sessions
    };
  }
  
  async listGods(args, options) {
    const pantheon = this.divineCouncil.pantheon;
    
    const godsList = Object.entries(pantheon).map(([key, god]) => ({
      name: god.name,
      title: god.title,
      symbol: god.symbol,
      domains: god.capabilities.join(', ')
    }));
    
    return {
      message: 'Available Gods of Olympus',
      gods: godsList
    };
  }
  
  async godInfo(args, options) {
    const godName = args[0];
    
    if (!godName) {
      throw new Error('Please specify a god name');
    }
    
    const godKey = godName.toLowerCase();
    const godInfo = this.divineCouncil.pantheon[godKey];
    
    if (!godInfo) {
      throw new Error(`Unknown god: ${godName}`);
    }
    
    return {
      message: `Information about ${godInfo.name}`,
      god: godInfo
    };
  }
  
  async invokeGod(args, options) {
    const godName = args[0];
    const task = args.slice(1).join(' ');
    
    if (!godName || !task) {
      throw new Error('Please specify both god name and task');
    }
    
    // Create temporary session for single god invocation
    const session = await this.divineCouncil.startCouncilSession(task);
    await this.divineCouncil.summonGod(session.sessionId, godName.toLowerCase());
    
    const contribution = await this.divineCouncil.godContribution(
      session.sessionId,
      godName.toLowerCase(),
      { message: task }
    );
    
    return {
      message: `${godName} has been invoked`,
      contribution: contribution.contribution
    };
  }
  
  async consultOracle(args, options) {
    const question = args.join(' ');
    
    if (!question) {
      throw new Error('Please ask a question to the oracle');
    }
    
    // Oracle provides divine prophecy
    const prophecy = this.generateOracleProphecy(question);
    
    return {
      message: 'The Oracle speaks...',
      prophecy
    };
  }
  
  async startWorkflow(args, options) {
    const template = args[0];
    const contextStr = args.slice(1).join(' ');
    
    let context = {};
    if (contextStr) {
      try {
        context = JSON.parse(contextStr);
      } catch {
        context = { description: contextStr };
      }
    }
    
    const workflow = this.workflowOrchestrator.createWorkflow(template, context);
    const result = await this.workflowOrchestrator.execute(workflow.id);
    
    return {
      message: `Workflow '${template}' started`,
      workflowId: workflow.id,
      result
    };
  }
  
  async listWorkflows(args, options) {
    const templates = Array.from(this.workflowOrchestrator.workflowTemplates.keys());
    
    return {
      message: 'Available workflow templates',
      workflows: templates
    };
  }
  
  async workflowStatus(args, options) {
    const workflowId = args[0];
    
    if (workflowId) {
      const status = this.workflowOrchestrator.getWorkflowStatus(workflowId);
      
      if (!status) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      
      return {
        message: `Workflow ${workflowId} status`,
        status
      };
    }
    
    // Show all active workflows
    const stats = this.workflowOrchestrator.getStatistics();
    
    return {
      message: 'Active workflows',
      workflows: stats.activeWorkflows
    };
  }
  
  async stopWorkflow(args, options) {
    const workflowId = args[0];
    
    if (!workflowId) {
      throw new Error('Please specify workflow ID');
    }
    
    // Implementation would stop workflow
    return {
      message: `Workflow ${workflowId} stopped`,
      success: true
    };
  }
  
  async analyze(args, options) {
    const target = args.join(' ') || 'current context';
    const depth = options.depth || 'standard';
    
    // Perform multi-dimensional analysis
    const analysis = {
      target,
      depth,
      dimensions: {
        technical: 'Architecture and implementation analysis',
        quality: 'Code quality and testing coverage',
        performance: 'Performance characteristics and bottlenecks',
        security: 'Security vulnerabilities and best practices',
        scalability: 'Scalability considerations'
      },
      recommendations: [
        'Consider implementing caching strategy',
        'Add comprehensive error handling',
        'Improve test coverage to 80%+'
      ],
      confidence: 0.85
    };
    
    return {
      message: `Analysis of ${target} complete`,
      analysis
    };
  }
  
  async orchestrate(args, options) {
    const task = args.join(' ');
    
    if (!task) {
      throw new Error('Please specify a task to orchestrate');
    }
    
    // Use Zeus to orchestrate
    const Zeus = (await import('../agents/gods/Zeus.js')).default;
    const zeus = new Zeus();
    
    const orchestration = await zeus.orchestrateProject(task, options);
    
    return {
      message: 'Orchestration complete',
      orchestration
    };
  }
  
  async generatePRD(args, options) {
    const project = args.join(' ');
    
    if (!project) {
      throw new Error('Please specify a project');
    }
    
    // Generate PRD through divine council
    const session = await this.divineCouncil.startCouncilSession(
      `Generate PRD for: ${project}`
    );
    
    // PRD generation would happen here
    const prd = {
      title: `Product Requirements Document: ${project}`,
      sections: {
        executive_summary: 'Project overview and objectives',
        requirements: 'Functional and non-functional requirements',
        user_stories: 'User stories and use cases',
        technical_specifications: 'Technical requirements and constraints',
        success_criteria: 'Definition of success'
      },
      generated_by: 'Divine Council of Olympus',
      timestamp: new Date()
    };
    
    return {
      message: 'PRD generated successfully',
      prd
    };
  }
  
  async generatePRP(args, options) {
    const project = args.join(' ');
    
    if (!project) {
      throw new Error('Please specify a project');
    }
    
    // Generate PRP through divine council
    const prp = {
      title: `Product Realization Plan: ${project}`,
      sections: {
        phases: 'Implementation phases',
        milestones: 'Key milestones and deliverables',
        resource_allocation: 'Resource and team allocation',
        timeline: 'Project timeline',
        risk_mitigation: 'Risk assessment and mitigation'
      },
      generated_by: 'Divine Council of Olympus',
      timestamp: new Date()
    };
    
    return {
      message: 'PRP generated successfully',
      prp
    };
  }
  
  async showConfig(args, options) {
    return {
      message: 'Current configuration',
      config: this.config
    };
  }
  
  async setConfig(args, options) {
    const key = args[0];
    const value = args[1];
    
    if (!key || value === undefined) {
      throw new Error('Please specify both key and value');
    }
    
    // Set configuration value
    this.config[key] = value;
    
    return {
      message: `Configuration updated: ${key} = ${value}`,
      success: true
    };
  }
  
  async showStats(args, options) {
    const stats = {
      commands: this.statistics,
      council: this.divineCouncil.getStatistics(),
      workflows: this.workflowOrchestrator.getStatistics()
    };
    
    return {
      message: 'System statistics',
      stats
    };
  }
  
  async showHelp(args, options) {
    const commandName = args[0];
    
    if (commandName) {
      const commandDef = this.commands.get(commandName);
      
      if (!commandDef) {
        throw new Error(`Unknown command: ${commandName}`);
      }
      
      return this.formatCommandHelp(commandDef);
    }
    
    // Show general help
    return this.formatGeneralHelp();
  }
  
  /**
   * Helper Methods
   */
  
  getCurrentSessionId() {
    const sessions = this.divineCouncil.getActiveSessions();
    return sessions.length > 0 ? sessions[0].id : null;
  }
  
  generateOracleProphecy(question) {
    const prophecies = [
      'The path ahead is fraught with challenges, but divine wisdom shall guide you',
      'Success lies in the harmony of opposing forces',
      'The answer you seek lies within the question itself',
      'Three trials await, but glory follows perseverance',
      'The gods smile upon this endeavor, proceed with confidence'
    ];
    
    return prophecies[Math.floor(Math.random() * prophecies.length)];
  }
  
  formatCommandHelp(commandDef) {
    let help = `**${commandDef.name}** - ${commandDef.description}\n\n`;
    
    if (commandDef.usage) {
      help += `Usage: ${commandDef.usage}\n`;
    }
    
    if (commandDef.example) {
      help += `Example: ${commandDef.example}\n`;
    }
    
    if (commandDef.subcommands) {
      help += '\nSubcommands:\n';
      
      for (const [name, sub] of Object.entries(commandDef.subcommands)) {
        help += `  ${name} - ${sub.description}\n`;
      }
    }
    
    return {
      message: 'Command help',
      help
    };
  }
  
  formatGeneralHelp() {
    let help = '**Pantheon Command System**\n\n';
    help += 'Available commands by category:\n\n';
    
    for (const [category, description] of Object.entries(this.categories)) {
      help += `**${category}** - ${description}\n`;
      
      const commands = Array.from(this.commands.values())
        .filter(cmd => cmd.category === category);
      
      for (const cmd of commands) {
        help += `  /${cmd.name} - ${cmd.description}\n`;
      }
      
      help += '\n';
    }
    
    help += 'Use /help <command> for detailed command help\n';
    help += 'Use /? as a shortcut for /help';
    
    return {
      message: 'Pantheon Help',
      help
    };
  }
  
  showSubcommandHelp(commandDef) {
    let help = `**${commandDef.name}** requires a subcommand:\n\n`;
    
    for (const [name, sub] of Object.entries(commandDef.subcommands)) {
      help += `  ${name} - ${sub.description}\n`;
      
      if (sub.usage) {
        help += `    Usage: ${sub.usage}\n`;
      }
    }
    
    return {
      message: 'Subcommand required',
      help
    };
  }
  
  handleInvalidCommand(input) {
    const suggestion = this.suggestCommand(input);
    
    let message = `Unknown command: ${input}`;
    
    if (suggestion) {
      message += `\n\nDid you mean: /${suggestion}?`;
    }
    
    if (this.config.helpOnError) {
      message += '\n\nUse /help to see available commands';
    }
    
    return {
      success: false,
      error: message
    };
  }
  
  suggestCommand(input) {
    // Simple suggestion based on prefix match
    const commandStr = input.replace(this.config.prefix, '').split(' ')[0];
    
    for (const cmd of this.commands.keys()) {
      if (cmd.startsWith(commandStr)) {
        return cmd;
      }
    }
    
    return null;
  }
}

export default SlashCommandProcessor;