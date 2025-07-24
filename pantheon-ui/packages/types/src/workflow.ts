// Workflow-related types

import { BaseEntity } from './common';

export interface Workflow extends BaseEntity {
  name: string;
  description: string;
  type: WorkflowType;
  status: WorkflowStatus;
  phases: WorkflowPhase[];
  currentPhaseId?: string;
  artifacts: WorkflowArtifact[];
  metadata: WorkflowMetadata;
}

export type WorkflowType = 
  | 'sequential'
  | 'parallel'
  | 'conditional'
  | 'iterative'
  | 'hybrid';

export type WorkflowStatus = 
  | 'draft'
  | 'ready'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface WorkflowPhase {
  id: string;
  name: string;
  description: string;
  agents: string[]; // Agent IDs
  tasks: WorkflowTask[];
  dependencies: string[]; // Phase IDs
  status: PhaseStatus;
  startedAt?: Date;
  completedAt?: Date;
}

export type PhaseStatus = 
  | 'pending'
  | 'ready'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface WorkflowTask {
  id: string;
  name: string;
  type: string;
  assignedAgent?: string;
  input: any;
  output?: any;
  status: TaskStatus;
  error?: string;
}

export type TaskStatus = 
  | 'pending'
  | 'assigned'
  | 'running'
  | 'completed'
  | 'failed';

export interface WorkflowArtifact {
  id: string;
  name: string;
  type: string;
  phaseId: string;
  taskId?: string;
  content: any;
  createdAt: Date;
}

export interface WorkflowMetadata {
  estimatedDuration?: number;
  actualDuration?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  owner?: string;
  team?: string;
}