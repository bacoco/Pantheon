// Agent-related types

import { BaseEntity } from './common';

export interface Agent extends BaseEntity {
  name: string;
  type: AgentType;
  description: string;
  status: AgentStatus;
  capabilities: string[];
  configuration: AgentConfiguration;
}

export type AgentType = 
  | 'architect'
  | 'developer'
  | 'qa'
  | 'security'
  | 'pm'
  | 'po'
  | 'sm'
  | 'ux'
  | 'analyst'
  | 'researcher';

export type AgentStatus = 'idle' | 'active' | 'thinking' | 'executing' | 'error';

export interface AgentConfiguration {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: string[];
}

export interface AgentMessage {
  id: string;
  agentId: string;
  content: string;
  timestamp: Date;
  type: 'input' | 'output' | 'error' | 'system';
  metadata?: Record<string, any>;
}