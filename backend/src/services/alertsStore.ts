import { prisma } from '../lib/prisma';
import { LocalAlertsVault } from './localAlertsVault';
import { logger } from '../utils/logger';

class AlertsStore {
  async add(alert: any) {
    try {
      const savedAlert = await prisma.alert.create({
        data: {
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          source: alert.source,
          matchedValue: alert.matched_value,
          createdAt: new Date()
        }
      });
      
      const io = (global as any).io;
      if (io) io.emit('new_alert', savedAlert);
      
      return savedAlert;
    } catch (e) {
      logger.error('[DB_UPLINK_FAIL] Routing alert to LocalVault');
      const localAlert = await LocalAlertsVault.add(alert);
      const io = (global as any).io;
      if (io) io.emit('new_alert', localAlert);
      return localAlert;
    }
  }

  async getAll() {
    try {
      return await prisma.alert.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
      });
    } catch (e) {
      return await LocalAlertsVault.getAll();
    }
  }

  async acknowledge(id: string) {
    try {
      return await prisma.alert.update({
        where: { id },
        data: { acknowledgedAt: new Date() }
      });
    } catch (e) {
      return null;
    }
  }

  async clear() {
    try {
      await prisma.alert.deleteMany({});
    } catch (e) {
      // Local clear not implemented for safety
    }
  }
}

export const alertsStore = new AlertsStore();

