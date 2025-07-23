// Memory-related types

import { BaseEntity } from './common';

export interface Memory extends BaseEntity {
  key: string;
  value: any;
  type: MemoryType;
  category: string;
  tags: string[];
  metadata: MemoryMetadata;
  expiresAt?: Date;
}

export type MemoryType = 
  | 'pattern'
  | 'context'
  | 'result'
  | 'configuration'
  | 'state'
  | 'knowledge'
  | 'session';

export interface MemoryMetadata {
  source?: string;
  agentId?: string;
  commandId?: string;
  workflowId?: string;
  confidence?: number;
  usage?: number;
  lastAccessedAt?: Date;
}

export interface MemoryQuery {
  key?: string;
  type?: MemoryType;
  category?: string;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface MemoryStats {
  totalEntries: number;
  byType: Record<MemoryType, number>;
  byCategory: Record<string, number>;
  totalSize: number;
  oldestEntry: Date;
  newestEntry: Date;
}