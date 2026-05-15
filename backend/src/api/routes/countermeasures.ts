import express from 'express';
import { countermeasuresStore } from '../../services/countermeasuresStore';

const router = express.Router();

router.get('/', async (req, res) => {
  const data = await countermeasuresStore.getAll();
  res.json({ success: true, data });
});

router.post('/', async (req, res) => {
  const { actorId, actorName, logs, status } = req.body;
  if (!actorName || !logs) {
    return res.status(400).json({ success: false, error: 'Actor name and logs are required' });
  }
  const newLog = await countermeasuresStore.add({ 
    actorId, 
    actorName, 
    logs, 
    status,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, data: newLog });
});

router.get('/actor/:actorId', async (req, res) => {
  const data = await countermeasuresStore.getByActor(req.params.actorId);
  res.json({ success: true, data });
});

export default router;
