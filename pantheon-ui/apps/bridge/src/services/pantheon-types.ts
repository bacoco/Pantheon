// BACO Service Types

export interface BacoCommand {
  name: string;
  description: string;
  content: string;
  metadata?: BacoMetadata;
}

export interface BacoMetadata {
  category?: string;
  version?: string;
  dependencies?: string[];
  [key: string]: any;
}

export interface CommandResult {
  success: boolean;
  output?: string;
  error?: string;
  artifacts?: CommandArtifact[];
}

export interface CommandArtifact {
  type: string;
  name: string;
  args?: string;
  metadata?: any;
}

export interface BacoStatus {
  initialized: boolean;
  workingDirectory?: string;
  message?: string;
  commands?: {
    count: number;
    list: string[];
  };
  structure?: {
    agents: number;
    templates: number;
    workflows: number;
    memory: number;
  };
}

export interface BacoMemoryPattern {
  patterns: any[];
  version: string;
  lastUpdated: string;
}