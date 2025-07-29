// Command-related types

import { BaseEntity } from './common';

export interface Command extends BaseEntity {
  name: string;
  description: string;
  category: CommandCategory;
  aliases: string[];
  parameters: CommandParameter[];
  examples: CommandExample[];
  requiresAgent?: string;
  output?: CommandOutput;
}

export type CommandCategory = 
  | 'core'
  | 'agent'
  | 'team'
  | 'workflow'
  | 'analysis'
  | 'generation'
  | 'execution'
  | 'utility';

export interface CommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: CommandValidation;
}

export interface CommandValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: string[];
}

export interface CommandExample {
  input: string;
  description: string;
  output?: string;
}

export interface CommandOutput {
  format: 'text' | 'json' | 'yaml' | 'markdown' | 'html';
  schema?: Record<string, any>;
}

export interface CommandExecution {
  id: string;
  commandName: string;
  parameters: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: any;
  error?: string;
}