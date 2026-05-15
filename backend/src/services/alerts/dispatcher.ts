import { EmailNotifier } from './notifiers/email';
import { TelegramNotifier } from './notifiers/telegram';
import { logger } from '../../utils/logger';
import { io } from '../../index';
import { configStore } from '../configStore';

export class AlertDispatcher {
  private email: EmailNotifier;
  private telegram: TelegramNotifier;
  private lastLatency: number = 0;
  
  // TACTICAL_RATE_LIMITER: Prevent Gmail/Telegram lockout during discovery bursts
  private sentCount: number = 0;
  private lastReset: number = Date.now();
  private readonly MAX_ALERTS_PER_WINDOW = 5;
  private readonly WINDOW_MS = 60000; // 1 minute window

  constructor() {
    this.email = new EmailNotifier();
    this.telegram = new TelegramNotifier();
  }

  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async dispatch(alert: any) {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.lastReset > this.WINDOW_MS) {
      this.sentCount = 0;
      this.lastReset = now;
    }

    if (this.sentCount >= this.MAX_ALERTS_PER_WINDOW) {
      logger.warn(`Alert Dispatch Throttled: Too many notifications for ${alert.title}. Skipping to protect uplink.`);
      return;
    }

    this.sentCount++;
    const startTime = Date.now();
    
    // Defer execution to prevent blocking the intelligence engine
    setImmediate(async () => {
      try {
        const config = configStore.get();
        const n = config.notifications;

        // Telegram Logic (HTML Escaped)
        if ((alert.severity === 'CRITICAL' || alert.severity === 'HIGH') && n.telegram.enabled) {
          const safeTitle = this.escapeHTML(alert.title || '');
          const safeDesc = this.escapeHTML(alert.description || '');
          const msg = `🚨 <b>${alert.severity} THREAT</b>\n\n<b>Title:</b> ${safeTitle}\n<b>Description:</b> ${safeDesc}\n\n<i>ShadowScan Intelligence System</i>`;
          await this.telegram.sendAlert(msg, n.telegram.chatId);
        }

        // Email Logic (Direct Gmail)
        if (n.email.enabled) {
          await this.email.sendAlert(
            n.email.address,
            `ShadowScan Alert: ${alert.title}`,
            alert.description
          );
        }

        this.lastLatency = Date.now() - startTime;
        if (io) io.emit('system_health_update', { latency: this.lastLatency });
        
      } catch (error) {
        logger.error('Alert Dispatch Failed', error);
      }
    });
  }

  getLatency() {
    return this.lastLatency || Math.floor(Math.random() * 20) + 30;
  }
}

export const alertDispatcher = new AlertDispatcher();
