import express from 'express';
import { findingsStore } from '../../services/findingsStore';
import { logger } from '../../utils/logger';

const router = express.Router();

// Get all detected threats from the live store
router.get('/', async (req, res) => {
  const data = await findingsStore.getAll();
  res.json({ success: true, data });
});

router.delete('/', async (req, res) => {
  try {
    await findingsStore.clearAll();
    const io = req.app.get('io');
    if (io) {
      io.emit('findings_cleared');
    }
    res.json({ success: true, message: 'All findings cleared' });
  } catch (err) {
    logger.error('Failed to clear findings', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

export default router;
