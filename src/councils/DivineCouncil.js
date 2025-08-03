import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { getRegistry } from '../agents/AgentRegistry.js';
import { getEventSystem } from '../events/EventSystem.js';
import { CircuitBreaker } from '../utils/CircuitBreaker.js';
import { getOptimizer } from '../router/CostOptimizer.js';

/**
 * Divine Council - Multi-agent collaborative orchestration
 * Implements the mythological council pattern from BACO Pantheon
 */
export class DivineCouncil extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      maxConcurrentGods: config.maxConcurrentGods || 7,
      sessionTimeout: config.sessionTimeout || 3600000, // 1 hour
      transparentReasoning: config.transparentReasoning !== false,
      enableArtifacts: config.enableArtifacts !== false,
      autoDocumentation: config.autoDocumentation !== false,
      ...config
    };
    
    // Core components
    this.agentRegistry = getRegistry();
    this.eventSystem = getEventSystem();
    this.costOptimizer = getOptimizer();
    
    // Council management
    this.activeSessions = new Map();
    this.gods = new Map();
    this.artifacts = new Map();
    this.reasoningLogs = new Map();
    
    // Circuit breaker for council protection
    this.circuitBreaker = new CircuitBreaker({
      name: 'divine-council',
      failureThreshold: 3,
      timeout: 60000
    });
    
    // Statistics
    this.statistics = {
      totalSessions: 0,
      activeSessions: 0,
      godsInvoked: 0,
      artifactsCreated: 0,
      decisionsReached: 0,
      averageSessionDuration: 0
    };
    
    // Initialize divine pantheon
    this.initializePantheon();
    
    // Setup event handlers
    this.setupEventHandlers();
  }
  
  /**
   * Initialize the divine pantheon of specialized gods
   */
  initializePantheon() {
    // Define the divine roles and their capabilities
    this.pantheon = {
      zeus: {
        name: 'Zeus',
        title: 'King of Gods',
        role: 'orchestrator',
        symbol: '⚡',
        capabilities: ['leadership', 'coordination', 'decision-making', 'conflict-resolution'],
        invocationPhrase: 'By the thunder of Olympus!',
        personality: 'Authoritative, wise, decisive'
      },
      athena: {
        name: 'Athena',
        title: 'Goddess of Wisdom',
        role: 'strategist',
        symbol: '🦉',
        capabilities: ['strategy', 'planning', 'architecture', 'wisdom'],
        invocationPhrase: 'By the wisdom of ages!',
        personality: 'Strategic, analytical, methodical'
      },
      apollo: {
        name: 'Apollo',
        title: 'God of Light and Truth',
        role: 'quality',
        symbol: '☀️',
        capabilities: ['quality', 'testing', 'verification', 'truth'],
        invocationPhrase: 'By the light of truth!',
        personality: 'Perfectionist, artistic, harmonious'
      },
      hephaestus: {
        name: 'Hephaestus',
        title: 'God of the Forge',
        role: 'builder',
        symbol: '🔨',
        capabilities: ['building', 'implementation', 'crafting', 'engineering'],
        invocationPhrase: 'By the forge of creation!',
        personality: 'Practical, skilled, industrious'
      },
      hermes: {
        name: 'Hermes',
        title: 'Messenger of Gods',
        role: 'integrator',
        symbol: '🪶',
        capabilities: ['communication', 'integration', 'api', 'networking'],
        invocationPhrase: 'By the wings of speed!',
        personality: 'Quick, clever, communicative'
      },
      prometheus: {
        name: 'Prometheus',
        title: 'Bringer of Fire',
        role: 'innovator',
        symbol: '🔥',
        capabilities: ['innovation', 'research', 'breakthrough', 'foresight'],
        invocationPhrase: 'By the fire of innovation!',
        personality: 'Visionary, rebellious, forward-thinking'
      },
      artemis: {
        name: 'Artemis',
        title: 'Goddess of the Hunt',
        role: 'tracker',
        symbol: '🏹',
        capabilities: ['tracking', 'monitoring', 'debugging', 'precision'],
        invocationPhrase: 'By the arrow of precision!',
        personality: 'Focused, independent, precise'
      }
    };
    
    this.emit('pantheonInitialized', {
      gods: Object.keys(this.pantheon),
      timestamp: new Date()
    });
  }
  
  /**
   * Start a new divine council session
   */
  async startCouncilSession(purpose, context = {}) {
    const sessionId = uuidv4();
    const startTime = Date.now();
    
    this.statistics.totalSessions++;
    this.statistics.activeSessions++;
    
    const session = {
      id: sessionId,
      purpose,
      context,
      status: 'active',
      startTime,
      endTime: null,
      participants: new Set(),
      artifacts: [],
      decisions: [],
      reasoningLog: [],
      transcript: []
    };
    
    this.activeSessions.set(sessionId, session);
    
    // Welcome message from Zeus
    const welcomeMessage = this.generateWelcomeMessage(purpose);
    session.transcript.push({
      speaker: 'Zeus',
      message: welcomeMessage,
      timestamp: new Date()
    });
    
    this.emit('councilStarted', {
      sessionId,
      purpose,
      message: welcomeMessage
    });
    
    // Analyze purpose and auto-summon relevant gods
    const relevantGods = await this.analyzeAndSummon(purpose, context);
    
    for (const godKey of relevantGods) {
      await this.summonGod(sessionId, godKey);
    }
    
    return {
      sessionId,
      session,
      welcomeMessage,
      summonedGods: relevantGods
    };
  }
  
  /**
   * Generate welcome message from Zeus
   */
  generateWelcomeMessage(purpose) {
    return `⚡ **Welcome to the Divine Council of Olympus!**\n\n` +
           `I am Zeus, King of the Gods, and I shall orchestrate our council session.\n\n` +
           `**Our Purpose Today:** ${purpose}\n\n` +
           `Let me summon the appropriate deities to assist us in this noble endeavor. ` +
           `Each god will contribute their unique wisdom and expertise transparently, ` +
           `allowing us to reach the best possible solution through divine collaboration.\n\n` +
           `*Thunder rumbles as the council convenes...*`;
  }
  
  /**
   * Analyze purpose and determine which gods to summon
   */
  async analyzeAndSummon(purpose, context) {
    const relevantGods = [];
    
    // Always include Zeus as orchestrator
    relevantGods.push('zeus');
    
    // Analyze keywords and context to determine relevant gods
    const purposeLower = purpose.toLowerCase();
    
    if (purposeLower.includes('build') || purposeLower.includes('implement') || 
        purposeLower.includes('create') || purposeLower.includes('develop')) {
      relevantGods.push('hephaestus');
    }
    
    if (purposeLower.includes('plan') || purposeLower.includes('architect') || 
        purposeLower.includes('design') || purposeLower.includes('strategy')) {
      relevantGods.push('athena');
    }
    
    if (purposeLower.includes('test') || purposeLower.includes('quality') || 
        purposeLower.includes('verify') || purposeLower.includes('validate')) {
      relevantGods.push('apollo');
    }
    
    if (purposeLower.includes('integrate') || purposeLower.includes('api') || 
        purposeLower.includes('connect') || purposeLower.includes('communicate')) {
      relevantGods.push('hermes');
    }
    
    if (purposeLower.includes('innovat') || purposeLower.includes('research') || 
        purposeLower.includes('new') || purposeLower.includes('breakthrough')) {
      relevantGods.push('prometheus');
    }
    
    if (purposeLower.includes('debug') || purposeLower.includes('track') || 
        purposeLower.includes('monitor') || purposeLower.includes('issue')) {
      relevantGods.push('artemis');
    }
    
    // Limit to maxConcurrentGods
    return relevantGods.slice(0, this.config.maxConcurrentGods);
  }
  
  /**
   * Summon a specific god to the council
   */
  async summonGod(sessionId, godKey) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const godInfo = this.pantheon[godKey];
    if (!godInfo) {
      throw new Error(`Unknown god: ${godKey}`);
    }
    
    // Check if already summoned
    if (session.participants.has(godKey)) {
      return {
        alreadySummoned: true,
        god: godInfo
      };
    }
    
    this.statistics.godsInvoked++;
    session.participants.add(godKey);
    
    // Create summon message
    const summonMessage = `${godInfo.symbol} **${godInfo.name} has been summoned!**\n` +
                         `*${godInfo.invocationPhrase}*\n\n` +
                         `I am ${godInfo.name}, ${godInfo.title}. ` +
                         `I bring expertise in: ${godInfo.capabilities.join(', ')}.\n` +
                         `${this.generateGodIntroduction(godInfo, session.purpose)}`;
    
    session.transcript.push({
      speaker: godInfo.name,
      message: summonMessage,
      timestamp: new Date(),
      type: 'summon'
    });
    
    this.emit('godSummoned', {
      sessionId,
      god: godKey,
      godInfo,
      message: summonMessage
    });
    
    // If transparent reasoning is enabled, log the reasoning
    if (this.config.transparentReasoning) {
      this.logReasoning(sessionId, godKey, {
        action: 'summoned',
        reason: `Expertise needed in: ${godInfo.capabilities.join(', ')}`,
        relevance: this.calculateRelevance(godInfo, session.purpose)
      });
    }
    
    return {
      god: godInfo,
      message: summonMessage
    };
  }
  
  /**
   * Generate god-specific introduction based on context
   */
  generateGodIntroduction(godInfo, purpose) {
    const introductions = {
      zeus: `As your orchestrator, I shall ensure all voices are heard and guide us to consensus.`,
      athena: `I shall analyze our challenge strategically and devise the optimal approach.`,
      apollo: `I shall ensure our solution meets the highest standards of quality and truth.`,
      hephaestus: `I shall forge our ideas into reality with skill and craftsmanship.`,
      hermes: `I shall ensure smooth communication and integration across all components.`,
      prometheus: `I shall bring innovative solutions and foresight to our challenge.`,
      artemis: `I shall track our progress with precision and hunt down any issues.`
    };
    
    return introductions[godInfo.name.toLowerCase()] || 
           `I am ready to contribute my divine wisdom to this council.`;
  }
  
  /**
   * Have a god contribute to the discussion
   */
  async godContribution(sessionId, godKey, contribution) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    const godInfo = this.pantheon[godKey];
    if (!godInfo || !session.participants.has(godKey)) {
      throw new Error(`God ${godKey} is not part of this session`);
    }
    
    // Format contribution with god's personality
    const formattedContribution = this.formatContribution(godInfo, contribution);
    
    session.transcript.push({
      speaker: godInfo.name,
      message: formattedContribution,
      timestamp: new Date(),
      type: 'contribution'
    });
    
    // Log transparent reasoning if enabled
    if (this.config.transparentReasoning && contribution.reasoning) {
      this.logReasoning(sessionId, godKey, contribution.reasoning);
    }
    
    // Create artifact if provided
    if (contribution.artifact && this.config.enableArtifacts) {
      const artifactId = await this.createArtifact(sessionId, godKey, contribution.artifact);
      session.artifacts.push(artifactId);
      this.statistics.artifactsCreated++;
    }
    
    this.emit('godContribution', {
      sessionId,
      god: godKey,
      contribution: formattedContribution,
      hasArtifact: !!contribution.artifact
    });
    
    return {
      success: true,
      contribution: formattedContribution
    };
  }
  
  /**
   * Format contribution with god's personality
   */
  formatContribution(godInfo, contribution) {
    const prefix = `${godInfo.symbol} **${godInfo.name}:**\n\n`;
    
    let message = contribution.message || contribution;
    
    // Add personality flair based on god
    if (godInfo.name === 'Zeus') {
      message = `*Thunder echoes*\n\n${message}\n\n*The king has spoken.*`;
    } else if (godInfo.name === 'Athena') {
      message = `*Owl hoots wisely*\n\n${message}\n\n*Strategic wisdom shared.*`;
    } else if (godInfo.name === 'Apollo') {
      message = `*Light illuminates*\n\n${message}\n\n*Truth revealed.*`;
    } else if (godInfo.name === 'Hephaestus') {
      message = `*Hammer strikes anvil*\n\n${message}\n\n*Forged with skill.*`;
    } else if (godInfo.name === 'Hermes') {
      message = `*Wings flutter*\n\n${message}\n\n*Message delivered.*`;
    } else if (godInfo.name === 'Prometheus') {
      message = `*Fire crackles*\n\n${message}\n\n*Innovation sparked.*`;
    } else if (godInfo.name === 'Artemis') {
      message = `*Arrow flies true*\n\n${message}\n\n*Target acquired.*`;
    }
    
    return prefix + message;
  }
  
  /**
   * Reach a council decision
   */
  async reachDecision(sessionId, proposal, votingGods = null) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // If no specific voting gods, use all participants
    const voters = votingGods || Array.from(session.participants);
    
    const decision = {
      id: uuidv4(),
      proposal,
      votes: new Map(),
      timestamp: new Date(),
      status: 'pending'
    };
    
    // Collect votes from each god
    for (const godKey of voters) {
      const vote = await this.collectVote(sessionId, godKey, proposal);
      decision.votes.set(godKey, vote);
    }
    
    // Determine outcome
    const approvals = Array.from(decision.votes.values()).filter(v => v.approve).length;
    const rejections = decision.votes.size - approvals;
    
    decision.status = approvals > rejections ? 'approved' : 'rejected';
    decision.tally = { approvals, rejections };
    
    session.decisions.push(decision);
    this.statistics.decisionsReached++;
    
    // Zeus announces the decision
    const announcement = this.announceDecision(decision, this.pantheon.zeus);
    session.transcript.push({
      speaker: 'Zeus',
      message: announcement,
      timestamp: new Date(),
      type: 'decision'
    });
    
    this.emit('decisionReached', {
      sessionId,
      decision,
      announcement
    });
    
    return decision;
  }
  
  /**
   * Collect vote from a god
   */
  async collectVote(sessionId, godKey, proposal) {
    const godInfo = this.pantheon[godKey];
    
    // Simulate god's decision-making based on their role
    const vote = {
      god: godKey,
      approve: this.evaluateProposal(godInfo, proposal),
      reasoning: this.generateVoteReasoning(godInfo, proposal),
      timestamp: new Date()
    };
    
    if (this.config.transparentReasoning) {
      this.logReasoning(sessionId, godKey, {
        action: 'vote',
        decision: vote.approve ? 'approve' : 'reject',
        reasoning: vote.reasoning
      });
    }
    
    return vote;
  }
  
  /**
   * Evaluate proposal based on god's perspective
   */
  evaluateProposal(godInfo, proposal) {
    // Simplified evaluation - in real implementation would be more sophisticated
    const proposalLower = proposal.toLowerCase();
    
    switch (godInfo.name) {
      case 'Athena':
        // Athena approves well-planned proposals
        return proposalLower.includes('plan') || proposalLower.includes('strategy');
      case 'Apollo':
        // Apollo approves quality-focused proposals
        return proposalLower.includes('quality') || proposalLower.includes('test');
      case 'Hephaestus':
        // Hephaestus approves practical implementations
        return proposalLower.includes('build') || proposalLower.includes('implement');
      case 'Prometheus':
        // Prometheus approves innovative proposals
        return proposalLower.includes('new') || proposalLower.includes('innovate');
      default:
        // Default approval based on general merit
        return Math.random() > 0.3; // 70% approval rate
    }
  }
  
  /**
   * Generate vote reasoning
   */
  generateVoteReasoning(godInfo, proposal) {
    return `As ${godInfo.title}, I evaluate this proposal through the lens of ${godInfo.capabilities[0]}. ` +
           `My decision is based on the alignment with divine principles of ${godInfo.capabilities.join(' and ')}.`;
  }
  
  /**
   * Announce council decision
   */
  announceDecision(decision, zeusInfo) {
    const status = decision.status === 'approved' ? 'APPROVED' : 'REJECTED';
    const emoji = decision.status === 'approved' ? '✅' : '❌';
    
    return `⚡ **DIVINE DECREE** ⚡\n\n` +
           `The Council of Olympus has reached a decision!\n\n` +
           `**Proposal:** ${decision.proposal}\n` +
           `**Decision:** ${emoji} ${status}\n` +
           `**Vote Tally:** ${decision.tally.approvals} approvals, ${decision.tally.rejections} rejections\n\n` +
           `*Zeus's gavel strikes thrice*\n\n` +
           `So it is decreed, so it shall be done!`;
  }
  
  /**
   * End council session
   */
  async endCouncilSession(sessionId, summary = null) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    session.endTime = Date.now();
    session.status = 'completed';
    session.duration = session.endTime - session.startTime;
    
    // Generate session summary
    const sessionSummary = summary || await this.generateSessionSummary(session);
    
    // Farewell from Zeus
    const farewellMessage = `⚡ **Council Session Concluded** ⚡\n\n` +
                           `${sessionSummary}\n\n` +
                           `The gods return to Olympus. Until we meet again!\n` +
                           `*Thunder fades into the distance...*`;
    
    session.transcript.push({
      speaker: 'Zeus',
      message: farewellMessage,
      timestamp: new Date(),
      type: 'closing'
    });
    
    // Update statistics
    this.statistics.activeSessions--;
    this.updateAverageSessionDuration(session.duration);
    
    // Generate documentation if enabled
    if (this.config.autoDocumentation) {
      session.documentation = await this.generateDocumentation(session);
    }
    
    this.emit('councilEnded', {
      sessionId,
      duration: session.duration,
      participants: Array.from(session.participants),
      decisions: session.decisions.length,
      artifacts: session.artifacts.length
    });
    
    // Archive session
    this.activeSessions.delete(sessionId);
    
    return {
      session,
      summary: sessionSummary,
      documentation: session.documentation
    };
  }
  
  /**
   * Generate session summary
   */
  async generateSessionSummary(session) {
    const participantNames = Array.from(session.participants)
      .map(key => this.pantheon[key]?.name)
      .join(', ');
    
    return `**Session Summary:**\n` +
           `- Purpose: ${session.purpose}\n` +
           `- Duration: ${Math.round(session.duration / 60000)} minutes\n` +
           `- Participants: ${participantNames}\n` +
           `- Decisions Made: ${session.decisions.length}\n` +
           `- Artifacts Created: ${session.artifacts.length}\n` +
           `- Key Outcomes: ${session.decisions.filter(d => d.status === 'approved').length} approvals`;
  }
  
  /**
   * Generate comprehensive documentation
   */
  async generateDocumentation(session) {
    const doc = {
      title: `Divine Council Session: ${session.purpose}`,
      sessionId: session.id,
      date: session.startTime,
      duration: session.duration,
      participants: Array.from(session.participants).map(key => ({
        god: this.pantheon[key]?.name,
        role: this.pantheon[key]?.role,
        capabilities: this.pantheon[key]?.capabilities
      })),
      transcript: session.transcript,
      decisions: session.decisions,
      artifacts: session.artifacts,
      reasoningLog: session.reasoningLog
    };
    
    this.emit('documentationGenerated', {
      sessionId: session.id,
      documentId: doc.sessionId
    });
    
    return doc;
  }
  
  /**
   * Create an artifact
   */
  async createArtifact(sessionId, creatorGod, artifact) {
    const artifactId = uuidv4();
    
    this.artifacts.set(artifactId, {
      id: artifactId,
      sessionId,
      creator: creatorGod,
      type: artifact.type,
      content: artifact.content,
      metadata: artifact.metadata || {},
      timestamp: new Date()
    });
    
    this.emit('artifactCreated', {
      artifactId,
      sessionId,
      creator: creatorGod,
      type: artifact.type
    });
    
    return artifactId;
  }
  
  /**
   * Log reasoning for transparency
   */
  logReasoning(sessionId, actor, reasoning) {
    if (!this.reasoningLogs.has(sessionId)) {
      this.reasoningLogs.set(sessionId, []);
    }
    
    const log = {
      timestamp: new Date(),
      actor,
      ...reasoning
    };
    
    this.reasoningLogs.get(sessionId).push(log);
    
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.reasoningLog.push(log);
    }
    
    this.emit('reasoningLogged', {
      sessionId,
      actor,
      reasoning
    });
  }
  
  /**
   * Calculate relevance of a god to the purpose
   */
  calculateRelevance(godInfo, purpose) {
    const purposeLower = purpose.toLowerCase();
    let relevance = 0;
    
    for (const capability of godInfo.capabilities) {
      if (purposeLower.includes(capability)) {
        relevance += 0.25;
      }
    }
    
    return Math.min(1, relevance);
  }
  
  /**
   * Update average session duration
   */
  updateAverageSessionDuration(duration) {
    const total = this.statistics.totalSessions;
    this.statistics.averageSessionDuration = 
      (this.statistics.averageSessionDuration * (total - 1) + duration) / total;
  }
  
  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Listen for collaboration requests
    this.eventSystem.subscribe('collaboration.requested', async (data) => {
      await this.startCouncilSession(data.purpose, data.context);
    });
    
    // Listen for god summon requests
    this.eventSystem.subscribe('god.summon', async (data) => {
      if (data.sessionId && data.god) {
        await this.summonGod(data.sessionId, data.god);
      }
    });
  }
  
  /**
   * Get active sessions
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.values()).map(session => ({
      id: session.id,
      purpose: session.purpose,
      status: session.status,
      participants: Array.from(session.participants),
      duration: session.endTime ? session.duration : Date.now() - session.startTime
    }));
  }
  
  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      pantheonSize: Object.keys(this.pantheon).length,
      activeGods: Array.from(this.activeSessions.values())
        .reduce((total, session) => total + session.participants.size, 0)
    };
  }
}

export default DivineCouncil;