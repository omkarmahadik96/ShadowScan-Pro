import fs from 'fs';
import path from 'path';

interface SystemConfig {
  engine: {
    interval: number;
    workers: number;
    torPort: number;
    torHost: string;
    stealthMode: boolean;
    userAgentSpoof: boolean;
    autoScan: boolean;
  };
  notifications: {
    email: { enabled: boolean; address: string };
    discord: { enabled: boolean; webhook: string };
    telegram: { enabled: boolean; chatId: string; botToken: string };
  };
  security: {
    twoFactor: boolean;
    sessionLock: number;
    ipWhitelist: boolean;
    auditLogging: boolean;
  };
}

const CONFIG_PATH = path.join(__dirname, '..', '..', 'data', 'system_config.json');
console.log(`[CONFIG_VAULT] Initialization path: ${CONFIG_PATH}`);

class ConfigStore {
  private config: SystemConfig = {
    engine: {
      interval: 15,
      workers: 24,
      torPort: 9050,
      torHost: '127.0.0.1',
      stealthMode: true,
      userAgentSpoof: true,
      autoScan: true
    },
    notifications: {
      email: { enabled: true, address: 'admin@shadowscan.pro' },
      discord: { enabled: false, webhook: '' },
      telegram: { enabled: true, chatId: '', botToken: '' }
    },
    security: {
      twoFactor: true,
      sessionLock: 120,
      ipWhitelist: false,
      auditLogging: true
    }
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const data = fs.readFileSync(CONFIG_PATH, 'utf8');
        this.config = JSON.parse(data);
      } else {
        const dir = path.dirname(CONFIG_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        this.save();
      }
    } catch (err) {
      console.error('Failed to load system config:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.config, null, 2));
    } catch (err) {
      console.error('Failed to save system config:', err);
    }
  }

  get(): SystemConfig {
    return this.config;
  }

  private updateListeners: ((config: SystemConfig) => void)[] = [];

  onUpdate(listener: (config: SystemConfig) => void) {
    this.updateListeners.push(listener);
  }

  update(newConfig: Partial<SystemConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.save();
    
    // Notify listeners (decoupled)
    this.updateListeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (err) {
        console.error('[CONFIG_VAULT] Listener error:', err);
      }
    });
    
    return this.config;
  }
}

export const configStore = new ConfigStore();
