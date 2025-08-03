import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';

/**
 * Council Session - Manages individual divine council sessions
 * Handles session state, participant management, and artifact tracking
 */
export class CouncilSession extends EventEmitter {
  constructor(sessionId, purpose, config = {}) {
    super();
    
    this.id = sessionId || uuidv4();
    this.purpose = purpose;
    this.config = {
      maxParticipants: config.maxParticipants || 7,
      sessionTimeout: config.sessionTimeout || 3600000,
      autoSave: config.autoSave !== false,
      recordTranscript: config.recordTranscript !== false,
      ...config
    };
    
    // Session state
    this.state = {
      status: 'initializing', // initializing, active, voting, concluding, completed
      phase: 'discovery', // discovery, planning, implementation, review
      startTime: Date.now(),
      endTime: null,
      lastActivity: Date.now()
    };
    
    // Participants
    this.participants = new Map();
    this.activeS

peaker = null;
    this.speakingQueue = [];
    
    // Content
    this.transcript = [];
    this.artifacts = new Map();
    this.decisions = [];
    this.actionItems = [];
    this.insights = [];
    
    // Collaboration tracking
    this.interactions = [];
    this.consensusMetrics = {
      alignment: 0,
      disagreements: 0,
      resolutions: 0
    };
    
    // Initialize session
    this.initialize();
  }
  
  /**
   * Initialize session
   */
  initialize() {
    // Set up session timeout
    if (this.config.sessionTimeout) {
      this.timeoutTimer = setTimeout(() => {
        this.handleTimeout();
      }, this.config.sessionTimeout);
    }
    
    // Set up auto-save
    if (this.config.autoSave) {
      this.autoSaveInterval = setInterval(() => {
        this.saveSession();
      }, 60000); // Save every minute
    }
    
    this.state.status = 'active';
    
    this.emit('sessionInitialized', {
      sessionId: this.id,
      purpose: this.purpose
    });
  }
  
  /**
   * Add participant to session
   */
  addParticipant(godId, godInfo) {
    if (this.participants.size >= this.config.maxParticipants) {
      throw new Error(`Maximum participants (${this.config.maxParticipants}) reached`);
    }
    
    if (this.participants.has(godId)) {
      return {
        alreadyPresent: true,
        participant: this.participants.get(godId)
      };
    }
    
    const participant = {
      id: godId,
      ...godInfo,
      joinedAt: Date.now(),
      contributions: 0,
      artifacts: [],
      votes: []
    };
    
    this.participants.set(godId, participant);
    
    // Add to transcript
    if (this.config.recordTranscript) {
      this.addToTranscript({
        type: 'system',
        message: `${godInfo.name} has joined the council`,
        speaker: 'System',
        timestamp: new Date()
      });
    }
    
    this.emit('participantJoined', {
      sessionId: this.id,
      participant: godId,
      totalParticipants: this.participants.size
    });
    
    return { participant };
  }
  
  /**
   * Remove participant from session
   */
  removeParticipant(godId) {
    const participant = this.participants.get(godId);
    
    if (!participant) {
      return { notFound: true };
    }
    
    this.participants.delete(godId);
    
    // Remove from speaking queue
    this.speakingQueue = this.speakingQueue.filter(id => id !== godId);
    
    // Add to transcript
    if (this.config.recordTranscript) {
      this.addToTranscript({
        type: 'system',
        message: `${participant.name} has left the council`,
        speaker: 'System',
        timestamp: new Date()
      });
    }
    
    this.emit('participantLeft', {
      sessionId: this.id,
      participant: godId,
      totalParticipants: this.participants.size
    });
    
    return { participant };
  }
  
  /**
   * Request speaking turn
   */
  requestSpeaking(godId) {
    if (!this.participants.has(godId)) {
      throw new Error(`Participant ${godId} not in session`);
    }
    
    // If no active speaker, grant immediately
    if (!this.activeSpeaker) {
      this.grantSpeaking(godId);
      return { granted: true, immediate: true };
    }
    
    // Add to queue if not already there
    if (!this.speakingQueue.includes(godId)) {
      this.speakingQueue.push(godId);
      
      this.emit('speakingRequested', {
        sessionId: this.id,
        participant: godId,
        queuePosition: this.speakingQueue.length
      });
    }
    
    return {
      queued: true,
      position: this.speakingQueue.indexOf(godId) + 1
    };
  }
  
  /**
   * Grant speaking turn
   */
  grantSpeaking(godId) {
    const participant = this.participants.get(godId);
    
    if (!participant) {
      throw new Error(`Participant ${godId} not in session`);
    }
    
    this.activeSpeaker = godId;
    
    // Remove from queue
    this.speakingQueue = this.speakingQueue.filter(id => id !== godId);
    
    this.emit('speakingGranted', {
      sessionId: this.id,
      speaker: godId,
      speakerName: participant.name
    });
    
    return { speaker: participant };
  }
  
  /**
   * End speaking turn
   */
  endSpeaking(godId) {
    if (this.activeSpeaker !== godId) {
      return { notSpeaking: true };
    }
    
    this.activeSpeaker = null;
    
    // Grant to next in queue
    if (this.speakingQueue.length > 0) {
      const nextSpeaker = this.speakingQueue[0];
      this.grantSpeaking(nextSpeaker);
    }
    
    this.emit('speakingEnded', {
      sessionId: this.id,
      previousSpeaker: godId
    });
    
    return { ended: true };
  }
  
  /**
   * Add contribution to session
   */
  addContribution(godId, content) {
    const participant = this.participants.get(godId);
    
    if (!participant) {
      throw new Error(`Participant ${godId} not in session`);
    }
    
    participant.contributions++;
    this.state.lastActivity = Date.now();
    
    const contribution = {
      id: uuidv4(),
      speaker: godId,
      speakerName: participant.name,
      content,
      timestamp: new Date(),
      phase: this.state.phase,
      reactions: []
    };
    
    // Add to transcript
    if (this.config.recordTranscript) {
      this.addToTranscript(contribution);
    }
    
    // Track interaction
    if (this.activeSpeaker && this.activeSpeaker !== godId) {
      this.trackInteraction(this.activeSpeaker, godId, 'response');
    }
    
    // Extract insights if present
    if (content.insights) {
      this.insights.push(...content.insights);
    }
    
    // Extract action items if present
    if (content.actionItems) {
      this.actionItems.push(...content.actionItems);
    }
    
    this.emit('contributionAdded', {
      sessionId: this.id,
      contributionId: contribution.id,
      speaker: godId
    });
    
    return contribution;
  }
  
  /**
   * Add reaction to contribution
   */
  addReaction(contributionId, godId, reaction) {
    const contribution = this.transcript.find(c => c.id === contributionId);
    
    if (!contribution) {
      throw new Error(`Contribution ${contributionId} not found`);
    }
    
    if (!this.participants.has(godId)) {
      throw new Error(`Participant ${godId} not in session`);
    }
    
    contribution.reactions.push({
      from: godId,
      type: reaction,
      timestamp: new Date()
    });
    
    // Track consensus metrics
    if (reaction === 'agree') {
      this.consensusMetrics.alignment++;
    } else if (reaction === 'disagree') {
      this.consensusMetrics.disagreements++;
    }
    
    this.emit('reactionAdded', {
      sessionId: this.id,
      contributionId,
      reaction,
      from: godId
    });
    
    return { added: true };
  }
  
  /**
   * Create artifact
   */
  createArtifact(creatorId, artifact) {
    const participant = this.participants.get(creatorId);
    
    if (!participant) {
      throw new Error(`Participant ${creatorId} not in session`);
    }
    
    const artifactId = artifact.id || uuidv4();
    
    const fullArtifact = {
      id: artifactId,
      creator: creatorId,
      creatorName: participant.name,
      type: artifact.type,
      title: artifact.title,
      content: artifact.content,
      metadata: artifact.metadata || {},
      createdAt: new Date(),
      phase: this.state.phase,
      handoffs: []
    };
    
    this.artifacts.set(artifactId, fullArtifact);
    participant.artifacts.push(artifactId);
    
    this.emit('artifactCreated', {
      sessionId: this.id,
      artifactId,
      creator: creatorId,
      type: artifact.type
    });
    
    return fullArtifact;
  }
  
  /**
   * Hand off artifact to another participant
   */
  handoffArtifact(artifactId, fromId, toId, notes = '') {
    const artifact = this.artifacts.get(artifactId);
    
    if (!artifact) {
      throw new Error(`Artifact ${artifactId} not found`);
    }
    
    if (!this.participants.has(fromId) || !this.participants.has(toId)) {
      throw new Error('Invalid participants for handoff');
    }
    
    const handoff = {
      from: fromId,
      to: toId,
      notes,
      timestamp: new Date()
    };
    
    artifact.handoffs.push(handoff);
    
    // Track interaction
    this.trackInteraction(fromId, toId, 'handoff');
    
    this.emit('artifactHandoff', {
      sessionId: this.id,
      artifactId,
      from: fromId,
      to: toId
    });
    
    return handoff;
  }
  
  /**
   * Start voting on a proposal
   */
  startVoting(proposal, options = {}) {
    if (this.state.status === 'voting') {
      throw new Error('Voting already in progress');
    }
    
    const voting = {
      id: uuidv4(),
      proposal,
      options: options.options || ['approve', 'reject', 'abstain'],
      votes: new Map(),
      startTime: Date.now(),
      endTime: null,
      timeout: options.timeout || 60000,
      requiredVotes: options.requiredVotes || this.participants.size
    };
    
    this.currentVoting = voting;
    this.state.status = 'voting';
    
    // Set voting timeout
    if (voting.timeout) {
      this.votingTimeout = setTimeout(() => {
        this.endVoting();
      }, voting.timeout);
    }
    
    this.emit('votingStarted', {
      sessionId: this.id,
      votingId: voting.id,
      proposal
    });
    
    return voting;
  }
  
  /**
   * Cast vote
   */
  castVote(godId, vote, reasoning = '') {
    if (!this.currentVoting) {
      throw new Error('No voting in progress');
    }
    
    if (!this.participants.has(godId)) {
      throw new Error(`Participant ${godId} not in session`);
    }
    
    if (this.currentVoting.votes.has(godId)) {
      throw new Error(`${godId} has already voted`);
    }
    
    const participant = this.participants.get(godId);
    
    const voteRecord = {
      voter: godId,
      voterName: participant.name,
      vote,
      reasoning,
      timestamp: new Date()
    };
    
    this.currentVoting.votes.set(godId, voteRecord);
    participant.votes.push(voteRecord);
    
    this.emit('voteCast', {
      sessionId: this.id,
      votingId: this.currentVoting.id,
      voter: godId,
      vote
    });
    
    // Check if all votes collected
    if (this.currentVoting.votes.size >= this.currentVoting.requiredVotes) {
      this.endVoting();
    }
    
    return voteRecord;
  }
  
  /**
   * End voting
   */
  endVoting() {
    if (!this.currentVoting) {
      return { noVoting: true };
    }
    
    // Clear timeout
    if (this.votingTimeout) {
      clearTimeout(this.votingTimeout);
    }
    
    this.currentVoting.endTime = Date.now();
    
    // Tally votes
    const tally = new Map();
    for (const option of this.currentVoting.options) {
      tally.set(option, 0);
    }
    
    for (const vote of this.currentVoting.votes.values()) {
      const current = tally.get(vote.vote) || 0;
      tally.set(vote.vote, current + 1);
    }
    
    // Determine result
    let result = null;
    let maxVotes = 0;
    
    for (const [option, count] of tally.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        result = option;
      }
    }
    
    const decision = {
      id: this.currentVoting.id,
      proposal: this.currentVoting.proposal,
      result,
      tally: Object.fromEntries(tally),
      votes: Array.from(this.currentVoting.votes.values()),
      timestamp: new Date()
    };
    
    this.decisions.push(decision);
    
    // Update consensus metrics
    if (result === 'approve') {
      this.consensusMetrics.resolutions++;
    }
    
    this.state.status = 'active';
    this.currentVoting = null;
    
    this.emit('votingEnded', {
      sessionId: this.id,
      decision
    });
    
    return decision;
  }
  
  /**
   * Change session phase
   */
  changePhase(newPhase) {
    const validPhases = ['discovery', 'planning', 'implementation', 'review'];
    
    if (!validPhases.includes(newPhase)) {
      throw new Error(`Invalid phase: ${newPhase}`);
    }
    
    const oldPhase = this.state.phase;
    this.state.phase = newPhase;
    
    // Add to transcript
    if (this.config.recordTranscript) {
      this.addToTranscript({
        type: 'system',
        message: `Session phase changed from ${oldPhase} to ${newPhase}`,
        speaker: 'System',
        timestamp: new Date()
      });
    }
    
    this.emit('phaseChanged', {
      sessionId: this.id,
      oldPhase,
      newPhase
    });
    
    return { oldPhase, newPhase };
  }
  
  /**
   * Add to transcript
   */
  addToTranscript(entry) {
    const transcriptEntry = {
      ...entry,
      index: this.transcript.length,
      sessionTime: Date.now() - this.state.startTime
    };
    
    this.transcript.push(transcriptEntry);
    
    return transcriptEntry;
  }
  
  /**
   * Track interaction between participants
   */
  trackInteraction(fromId, toId, type) {
    const interaction = {
      from: fromId,
      to: toId,
      type,
      timestamp: new Date(),
      phase: this.state.phase
    };
    
    this.interactions.push(interaction);
    
    return interaction;
  }
  
  /**
   * Generate session summary
   */
  generateSummary() {
    const duration = (this.state.endTime || Date.now()) - this.state.startTime;
    
    const summary = {
      sessionId: this.id,
      purpose: this.purpose,
      status: this.state.status,
      duration,
      phases: this.getPhaseBreakdown(),
      participants: this.getParticipantSummary(),
      contributions: this.transcript.filter(t => t.type !== 'system').length,
      artifacts: this.artifacts.size,
      decisions: this.decisions.length,
      actionItems: this.actionItems.length,
      insights: this.insights.length,
      consensusMetrics: this.consensusMetrics,
      interactions: this.getInteractionSummary()
    };
    
    return summary;
  }
  
  /**
   * Get phase breakdown
   */
  getPhaseBreakdown() {
    const phases = {};
    let currentPhase = null;
    let phaseStart = this.state.startTime;
    
    for (const entry of this.transcript) {
      if (entry.type === 'system' && entry.message.includes('phase changed')) {
        if (currentPhase) {
          phases[currentPhase] = (phases[currentPhase] || 0) + 
                                (entry.timestamp - phaseStart);
        }
        currentPhase = entry.message.match(/to (\w+)/)?.[1];
        phaseStart = entry.timestamp;
      }
    }
    
    // Add current phase
    if (currentPhase) {
      phases[currentPhase] = (phases[currentPhase] || 0) + 
                            (Date.now() - phaseStart);
    }
    
    return phases;
  }
  
  /**
   * Get participant summary
   */
  getParticipantSummary() {
    return Array.from(this.participants.values()).map(p => ({
      id: p.id,
      name: p.name,
      role: p.role,
      contributions: p.contributions,
      artifacts: p.artifacts.length,
      votes: p.votes.length,
      timeInSession: (this.state.endTime || Date.now()) - p.joinedAt
    }));
  }
  
  /**
   * Get interaction summary
   */
  getInteractionSummary() {
    const matrix = {};
    
    for (const interaction of this.interactions) {
      const key = `${interaction.from}->${interaction.to}`;
      matrix[key] = (matrix[key] || 0) + 1;
    }
    
    return {
      total: this.interactions.length,
      matrix,
      mostActive: this.getMostActiveInteraction(matrix)
    };
  }
  
  /**
   * Get most active interaction
   */
  getMostActiveInteraction(matrix) {
    let maxCount = 0;
    let mostActive = null;
    
    for (const [interaction, count] of Object.entries(matrix)) {
      if (count > maxCount) {
        maxCount = count;
        mostActive = interaction;
      }
    }
    
    return { interaction: mostActive, count: maxCount };
  }
  
  /**
   * Save session state
   */
  saveSession() {
    const sessionData = {
      id: this.id,
      purpose: this.purpose,
      state: this.state,
      participants: Array.from(this.participants.entries()),
      transcript: this.transcript,
      artifacts: Array.from(this.artifacts.entries()),
      decisions: this.decisions,
      actionItems: this.actionItems,
      insights: this.insights,
      interactions: this.interactions,
      consensusMetrics: this.consensusMetrics
    };
    
    this.emit('sessionSaved', {
      sessionId: this.id,
      dataSize: JSON.stringify(sessionData).length
    });
    
    return sessionData;
  }
  
  /**
   * Handle session timeout
   */
  handleTimeout() {
    this.emit('sessionTimeout', {
      sessionId: this.id,
      duration: Date.now() - this.state.startTime
    });
    
    this.endSession('timeout');
  }
  
  /**
   * End session
   */
  endSession(reason = 'completed') {
    this.state.endTime = Date.now();
    this.state.status = 'completed';
    
    // Clear timers
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }
    
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    if (this.votingTimeout) {
      clearTimeout(this.votingTimeout);
    }
    
    // Final save
    const finalData = this.saveSession();
    
    this.emit('sessionEnded', {
      sessionId: this.id,
      reason,
      summary: this.generateSummary()
    });
    
    return finalData;
  }
}

export default CouncilSession;