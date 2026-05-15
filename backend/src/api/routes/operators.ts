import { Router } from 'express';
import { usersStore } from '../../services/usersStore';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: usersStore.getAll()
  });
});

router.post('/', (req, res) => {
  const { name, role } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Name required' });
  const newOp = usersStore.add(name, role);
  res.json({
    success: true,
    data: newOp
  });
});

router.delete('/:id', (req, res) => {
  usersStore.remove(req.params.id);
  res.json({ success: true });
});

export default router;
