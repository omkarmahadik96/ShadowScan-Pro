import { Router } from 'express';
import { systemPerformanceService } from '../../services/systemPerformance';
import { statsService } from '../../services/stats';
import { configStore } from '../../services/configStore';
import { monitoringScheduler } from '../../services/monitoring/scheduler';

const router = Router();

// Priority Config Routes
router.get('/config', (req, res) => {
  try {
    res.json({
      success: true,
      data: configStore.get()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Vault access failure' });
  }
});

router.post('/config', (req, res) => {
  try {
    const updated = configStore.update(req.body);
    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Vault write failure' });
  }
});

router.get('/performance', (req, res) => {
  res.json({
    success: true,
    data: systemPerformanceService.getPerformanceData()
  });
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await statsService.getStatsGlobal();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve system stats' });
  }
});

router.get('/scan-status', (req, res) => {
  res.json({
    success: true,
    data: monitoringScheduler.getStatus()
  });
});

router.post('/trigger-scan', async (req, res) => {
  try {
    monitoringScheduler.triggerNow().catch(err => console.error('Manual trigger failed', err));
    res.json({ success: true, message: 'Intelligence surveillance cycle initiated' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to trigger scan' });
  }
});

router.post('/auto-scan', (req, res) => {
  try {
    const { enabled } = req.body;
    const config = configStore.get();
    
    // Update config and restart scheduler
    configStore.update({
      engine: {
        ...config.engine,
        autoScan: enabled
      }
    });

    res.json({
      success: true,
      data: { autoScan: enabled }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to toggle auto-scan' });
  }
});

router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OPERATIONAL',
      service_version: 'DEBUG_HOTFIX_01',
      uptime: process.uptime()
    }
  });
});

export default router;
