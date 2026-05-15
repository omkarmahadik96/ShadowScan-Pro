import express from 'express';
import { statsService } from '../../services/stats';
import { logger } from '../../utils/logger';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const stats = await statsService.getStatsGlobal(); // I'll add this method
    res.json({ success: true, data: stats });
  } catch (err) {
    logger.error('Failed to fetch stats', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

export default router;
