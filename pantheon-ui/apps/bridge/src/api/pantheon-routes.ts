import { Router, Request, Response } from 'express';
import { PantheonService } from '../services/pantheon-service.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('PantheonRoutes');
const router = Router();

// Initialize Pantheon service with current working directory
const pantheonService = new PantheonService(process.cwd());

/**
 * GET /api/pantheon/status
 * Get Pantheon system status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await pantheonService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Failed to get Pantheon status', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get Pantheon status'
    });
  }
});

/**
 * POST /api/pantheon/init
 * Initialize Pantheon in the current directory
 */
router.post('/init', async (req: Request, res: Response) => {
  try {
    const result = await pantheonService.initPantheon();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.output
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Failed to initialize Pantheon', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to initialize Pantheon'
    });
  }
});

/**
 * GET /api/pantheon/commands
 * List all available Pantheon commands
 */
router.get('/commands', async (req: Request, res: Response) => {
  try {
    const commands = await pantheonService.listCommands();
    const commandDetails = await pantheonService.loadCommands();
    
    const commandList = Array.from(commandDetails.entries()).map(([name, cmd]) => ({
      name,
      description: cmd.description,
      metadata: cmd.metadata
    }));
    
    res.json({
      success: true,
      data: {
        commands: commandList,
        count: commands.length
      }
    });
  } catch (error) {
    logger.error('Failed to list commands', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to list commands'
    });
  }
});

/**
 * GET /api/pantheon/commands/:name
 * Get a specific command
 */
router.get('/commands/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const command = await pantheonService.getCommand(name);
    
    if (command) {
      res.json({
        success: true,
        data: command
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Command not found: ${name}`
      });
    }
  } catch (error) {
    logger.error('Failed to get command', { error, commandName: req.params.name });
    res.status(500).json({
      success: false,
      error: 'Failed to get command'
    });
  }
});

/**
 * POST /api/pantheon/execute
 * Execute a Pantheon command
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        error: 'Command is required'
      });
    }
    
    const result = await pantheonService.executeCommand(command);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          output: result.output,
          artifacts: result.artifacts
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Failed to execute command', { error, command: req.body.command });
    res.status(500).json({
      success: false,
      error: 'Failed to execute command'
    });
  }
});

/**
 * POST /api/pantheon/workspace
 * Change Pantheon working directory
 */
router.post('/workspace', async (req: Request, res: Response) => {
  try {
    const { directory } = req.body;
    
    if (!directory) {
      return res.status(400).json({
        success: false,
        error: 'Directory is required'
      });
    }
    
    // Create new service instance with different working directory
    const newPantheonService = new PantheonService(directory);
    const status = await newPantheonService.getStatus();
    
    res.json({
      success: true,
      data: {
        workingDirectory: directory,
        status
      }
    });
  } catch (error) {
    logger.error('Failed to change workspace', { error, directory: req.body.directory });
    res.status(500).json({
      success: false,
      error: 'Failed to change workspace'
    });
  }
});

export default router;