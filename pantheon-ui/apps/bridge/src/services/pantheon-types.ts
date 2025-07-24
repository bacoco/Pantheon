// Pantheon Service Types

export interface PantheonCommand {
  name: string;
  description: string;
  content: string;
  metadata?: PantheonMetadata;
}

export interface PantheonMetadata {
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

export interface PantheonStatus {
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

export interface PantheonMemoryPattern {
  patterns: any[];
  version: string;
  lastUpdated: string;
}