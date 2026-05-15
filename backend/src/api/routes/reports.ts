import { Router } from 'express';
import { reportsStore } from '../../services/reportsStore';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: reportsStore.getAll()
  });
});

router.post('/', (req, res) => {
  const { id, name, type, stats } = req.body;
  const newReport = {
    id,
    name,
    type,
    stats,
    date: new Date().toISOString()
  };
  reportsStore.add(newReport);
  res.json({ success: true, data: newReport });
});

router.delete('/', (req, res) => {
  reportsStore.clear();
  res.json({ success: true });
});

export default router; // Forensic Route Mount Point
