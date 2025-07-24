import { Router, Request, Response } from 'express';
import { BacoService } from '../services/baco-service.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('BacoRoutes');
const router = Router();

// Initialize BACO service with current working directory
const bacoService = new BacoService(process.cwd());

/**
 * GET /api/baco/status
 * Get BACO system status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await bacoService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Failed to get BACO status', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get BACO status'
    });
  }
});

/**
 * POST /api/baco/init
 * Initialize BACO in the current directory
 */
router.post('/init', async (req: Request, res: Response) => {
  try {
    const result = await bacoService.initBaco();
    
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
    logger.error('Failed to initialize BACO', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to initialize BACO'
    });
  }
});

/**
 * GET /api/baco/commands
 * List all available BACO commands
 */
router.get('/commands', async (req: Request, res: Response) => {
  try {
    const commands = await bacoService.listCommands();
    const commandDetails = await bacoService.loadCommands();
    
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
 * GET /api/baco/commands/:name
 * Get a specific command
 */
router.get('/commands/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const command = await bacoService.getCommand(name);
    
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
 * POST /api/baco/execute
 * Execute a BACO command
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
    
    const result = await bacoService.executeCommand(command);
    
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
 * POST /api/baco/workspace
 * Change BACO working directory
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
    const newBacoService = new BacoService(directory);
    const status = await newBacoService.getStatus();
    
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