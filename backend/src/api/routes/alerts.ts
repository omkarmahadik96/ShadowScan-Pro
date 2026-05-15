import express from 'express';
import { alertsStore } from '../../services/alertsStore';

const router = express.Router();

// Get all active alerts
router.get('/', async (req, res) => {
  const data = await alertsStore.getAll();
  res.json({ success: true, data });
});

// Acknowledge/Dismiss an alert
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await alertsStore.acknowledge(id);
    
    // Notify frontend via socket to remove it from the state
    const io = req.app.get('io');
    if (io) {
      io.emit('alert_acknowledged', id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(404).json({ success: false, error: 'Alert not found' });
  }
});

// Clear all alerts
router.post('/clear', async (req, res) => {
  await alertsStore.clear();
  const io = req.app.get('io');
  if (io) {
    io.emit('alerts_cleared');
  }
  res.json({ success: true });
});

export default router;
