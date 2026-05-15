import express from 'express';
import { adversariesStore } from '../../services/adversariesStore';

const router = express.Router();

router.get('/', async (req, res) => {
  const data = await adversariesStore.getAll();
  res.json({ success: true, data });
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await adversariesStore.updateStatus(id, status);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(404).json({ success: false, error: 'Actor not found' });
  }
});

export default router;
