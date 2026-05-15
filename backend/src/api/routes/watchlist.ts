import express from 'express';
import { watchlistStore } from '../../services/watchlistStore';
import { statsService } from '../../services/stats';

import { monitoringScheduler } from '../../services/monitoring/scheduler';

const router = express.Router();

router.get('/', async (req, res) => {
  const data = await watchlistStore.getAll();
  res.json({ success: true, data });
});

router.post('/', async (req, res) => {
  const { type, value, label, priority } = req.body;
  const item = await watchlistStore.add({ type, value, label, priority });
  
  // TRIGGER LIVE SCAN IMMEDIATELY (Async - don't block response)
  monitoringScheduler.triggerNow().catch(err => console.error('Immediate scan trigger failed', err));
  
  // Broadcast update via socket
  statsService.broadcast();
  
  res.json({ success: true, data: item });
});

router.delete('/:id', async (req, res) => {
  await watchlistStore.delete(req.params.id);
  statsService.broadcast(); // UPDATE DASHBOARD
  res.json({ success: true });
});

router.post('/:id/toggle', async (req, res) => {
  const item = await watchlistStore.toggleStatus(req.params.id);
  statsService.broadcast(); // UPDATE DASHBOARD
  res.json({ success: true, data: item });
});

export default router;
