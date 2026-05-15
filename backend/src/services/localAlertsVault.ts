import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const ALERTS_FILE = path.join(DATA_DIR, 'alerts_vault.json');

export class LocalAlertsVault {
  static async getAll() {
    try {
      if (!fs.existsSync(ALERTS_FILE)) return [];
      const data = fs.readFileSync(ALERTS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  static async add(alert: any) {
    try {
      const alerts = await this.getAll();
      const newAlert = { 
        ...alert, 
        id: `alert_v_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString()
      };
      alerts.unshift(newAlert);
      fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts.slice(0, 500), null, 2));
      return newAlert;
    } catch (e) {
      console.error('[ALERT_VAULT_ERROR] Failed to save alert to local vault:', e);
      return { ...alert, id: `err_${Date.now()}` };
    }
  }
}
