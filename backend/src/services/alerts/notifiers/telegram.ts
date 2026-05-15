/**
 * Telegram Notifier Service
 * Dispatches real-time threat alerts to the user's Telegram bot.
 */

import axios from 'axios';
import { logger } from '../../../utils/logger';
import { configStore } from '../../configStore';

export class TelegramNotifier {
  private token: string;
  private chatId: string;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
  }

  async sendAlert(message: string, overrideChatId?: string) {
    const config = configStore.get();
    const activeToken = config.notifications.telegram.botToken || this.token;
    const targetChatId = overrideChatId || config.notifications.telegram.chatId || this.chatId;

    if (!activeToken || !targetChatId) {
      logger.error('Telegram credentials missing (Token or ChatId)');
      return;
    }

    const baseUrl = `https://api.telegram.org/bot${activeToken}/sendMessage`;

    try {
      const payload = {
        chat_id: targetChatId,
        text: `<b>🕵️ SHADOWSCAN PRO ALERT</b>\n\n${message}`,
        parse_mode: 'HTML'
      };

      await axios.post(baseUrl, payload);
      logger.info('Telegram Alert Dispatched Successfully');
    } catch (error) {
      logger.error('Telegram Notification Failed', (error as any).message);
    }
  }
}
