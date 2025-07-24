import { Express, Request, Response } from 'express';
import { ClaudeCodeBridge } from '../claude/bridge.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';
import type { BacoCommand } from '@baco-ui/types';

// Request validation schemas
const executeCommandSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  context: z.record(z.any()).optional(),
  timeout: z.number().optional()
});

const projectSchema = z.object({
  path: z.string(),
  name: z.string().optional()
});

export function setupApiRoutes(app: Express, bridge: ClaudeCodeBridge) {
  // Execute BACO command
  app.post('/api/command', async (req: Request, res: Response) => {
    try {
      const body = executeCommandSchema.parse(req.body);
      
      logger.info('Executing command:', body.command);
      
      const result = await bridge.executeCommand(body as BacoCommand);
      
      res.json({
        success: result.success,
        output: result.output,
        error: result.error,
        timestamp: result.timestamp
      });
    } catch (error) {
      logger.error('Command execution error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid request',
          details: error.errors
        });
      } else {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Get available BACO commands
  app.get('/api/commands', async (req: Request, res: Response) => {
    try {
      const result = await bridge.executeCommand({
        command: '/help',
        timeout: 10000
      });
      
      // Parse help output to extract commands
      const commands = parseHelpOutput(result.output);
      
      res.json({ commands });
    } catch (error) {
      logger.error('Failed to get commands:', error);
      res.status(500).json({
        error: 'Failed to retrieve commands'
      });
    }
  });

  // Get current project info
  app.get('/api/project', async (req: Request, res: Response) => {
    try {
      const result = await bridge.executeCommand({
        command: 'pwd',
        timeout: 5000
      });
      
      res.json({
        path: result.output.trim(),
        name: result.output.split('/').pop()
      });
    } catch (error) {
      logger.error('Failed to get project info:', error);
      res.status(500).json({
        error: 'Failed to get project information'
      });
    }
  });

  // Change project directory
  app.post('/api/project', async (req: Request, res: Response) => {
    try {
      const body = projectSchema.parse(req.body);
      
      const result = await bridge.executeCommand({
        command: 'cd',
        args: [body.path],
        timeout: 5000
      });
      
      if (result.success) {
        res.json({
          success: true,
          path: body.path,
          name: body.name || body.path.split('/').pop()
        });
      } else {
        res.status(400).json({
          error: result.error || 'Failed to change directory'
        });
      }
    } catch (error) {
      logger.error('Failed to change project:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid request',
          details: error.errors
        });
      } else {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Get task progress
  app.get('/api/tasks', async (req: Request, res: Response) => {
    try {
      const result = await bridge.executeCommand({
        command: '/task-status',
        timeout: 5000
      });
      
      // Parse task output
      const tasks = parseTaskOutput(result.output);
      
      res.json({ tasks });
    } catch (error) {
      logger.error('Failed to get tasks:', error);
      res.status(500).json({
        error: 'Failed to retrieve tasks'
      });
    }
  });

  // Get memory contents
  app.get('/api/memory', async (req: Request, res: Response) => {
    try {
      const result = await bridge.executeCommand({
        command: '/memory list',
        timeout: 10000
      });
      
      // Parse memory output
      const memory = parseMemoryOutput(result.output);
      
      res.json({ memory });
    } catch (error) {
      logger.error('Failed to get memory:', error);
      res.status(500).json({
        error: 'Failed to retrieve memory'
      });
    }
  });

  // Get agents status
  app.get('/api/agents', async (req: Request, res: Response) => {
    try {
      const result = await bridge.executeCommand({
        command: '/agent-status',
        timeout: 5000
      });
      
      // Parse agent output
      const agents = parseAgentOutput(result.output);
      
      res.json({ agents });
    } catch (error) {
      logger.error('Failed to get agents:', error);
      res.status(500).json({
        error: 'Failed to retrieve agents'
      });
    }
  });
}

// Helper functions to parse Claude output
function parseHelpOutput(output: string): Array<{ command: string; description: string }> {
  const commands: Array<{ command: string; description: string }> = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    // Look for command patterns like "/command - description"
    const match = line.match(/^\s*(\/\w+(?:-\w+)*)\s*-\s*(.+)$/);
    if (match) {
      commands.push({
        command: match[1],
        description: match[2].trim()
      });
    }
  }
  
  return commands;
}

function parseTaskOutput(output: string): Array<{ id: string; content: string; status: string; priority: string }> {
  const tasks: Array<{ id: string; content: string; status: string; priority: string }> = [];
  
  try {
    // Look for YAML-like output
    const yamlMatch = output.match(/```yaml\n([\s\S]+?)\n```/);
    if (yamlMatch) {
      // Simple YAML parsing for task list
      const lines = yamlMatch[1].split('\n');
      let currentTask: any = null;
      
      for (const line of lines) {
        if (line.match(/^- id:/)) {
          if (currentTask) tasks.push(currentTask);
          currentTask = { id: '', content: '', status: '', priority: '' };
        }
        
        const idMatch = line.match(/id:\s*["']?(\w+)["']?/);
        if (idMatch && currentTask) currentTask.id = idMatch[1];
        
        const contentMatch = line.match(/content:\s*["']?(.+?)["']?$/);
        if (contentMatch && currentTask) currentTask.content = contentMatch[1];
        
        const statusMatch = line.match(/status:\s*["']?(\w+)["']?/);
        if (statusMatch && currentTask) currentTask.status = statusMatch[1];
        
        const priorityMatch = line.match(/priority:\s*["']?(\w+)["']?/);
        if (priorityMatch && currentTask) currentTask.priority = priorityMatch[1];
      }
      
      if (currentTask) tasks.push(currentTask);
    }
  } catch (error) {
    logger.error('Failed to parse task output:', error);
  }
  
  return tasks;
}

function parseMemoryOutput(output: string): Record<string, any> {
  const memory: Record<string, any> = {};
  
  try {
    // Look for JSON output
    const jsonMatch = output.match(/```json\n([\s\S]+?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Fallback to line-by-line parsing
    const lines = output.split('\n');
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        memory[match[1]] = match[2];
      }
    }
  } catch (error) {
    logger.error('Failed to parse memory output:', error);
  }
  
  return memory;
}

function parseAgentOutput(output: string): Array<{ name: string; status: string; type: string }> {
  const agents: Array<{ name: string; status: string; type: string }> = [];
  
  try {
    // Look for agent patterns in output
    const lines = output.split('\n');
    for (const line of lines) {
      const match = line.match(/Agent:\s*(\w+)\s*\((\w+)\)\s*-\s*(\w+)/);
      if (match) {
        agents.push({
          name: match[1],
          type: match[2],
          status: match[3]
        });
      }
    }
  } catch (error) {
    logger.error('Failed to parse agent output:', error);
  }
  
  return agents;
}