import { Router } from 'express';
import { z } from 'zod';
import { tgvService } from '../services/tgv-service';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const searchParamsSchema = z.object({
  departureStation: z.string(),
  arrivalStation: z.string(),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  passengers: z.object({
    adults: z.number().min(1).max(9),
    children: z.number().min(0).max(9).optional(),
    seniors: z.number().min(0).max(9).optional(),
  }),
  travelClass: z.enum(['first', 'second']).optional(),
});

// Get all TGV stations
router.get('/stations', async (req, res) => {
  try {
    const stations = await tgvService.getStations();
    res.json({
      success: true,
      data: stations
    });
  } catch (error) {
    logger.error('Error fetching TGV stations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stations'
    });
  }
});

// Search for available TGV trains
router.post('/search', async (req, res) => {
  try {
    // Validate request body
    const params = searchParamsSchema.parse(req.body);
    
    // Perform search
    const results = await tgvService.searchTrains(params);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Validation error:', error.errors);
      res.status(400).json({
        success: false,
        error: 'Invalid search parameters',
        details: error.errors
      });
    } else {
      logger.error('Error searching TGV trains:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search trains'
      });
    }
  }
});

// Get train details (for future enhancement)
router.get('/train/:trainNumber', async (req, res) => {
  const { trainNumber } = req.params;
  
  res.json({
    success: true,
    message: 'Train details endpoint - to be implemented',
    trainNumber
  });
});

export default router;