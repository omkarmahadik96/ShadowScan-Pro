import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.get('/', (req, res) => {
  // Real logic: Check environment variables to see if these services are actually configured
  const smtpActive = !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
  const telegramActive = !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID;
  const webhookActive = !!process.env.WEBHOOK_URL;
  const smsActive = !!process.env.TWILIO_SID;

  res.json({
    success: true,
    data: [
      { 
        name: 'SMTP_GATEWAY', 
        desc: 'Email Notifications', 
        status: smtpActive ? 'ACTIVE' : 'OFFLINE (Config Missing)', 
        color: smtpActive ? 'var(--accent-green)' : 'var(--accent-red)' 
      },
      { 
        name: 'TELEGRAM_BOT', 
        desc: 'Mobile Alerts', 
        status: telegramActive ? 'ACTIVE' : 'OFFLINE (Config Missing)', 
        color: telegramActive ? 'var(--accent-green)' : 'var(--accent-red)' 
      },
      { 
        name: 'WEBHOOK_MESH', 
        desc: 'SIEM Integration', 
        status: webhookActive ? 'ACTIVE' : 'STANDBY (No Webhook URL)', 
        color: webhookActive ? 'var(--accent-green)' : 'var(--text-dim)' 
      },
      { 
        name: 'SMS_FALLBACK', 
        desc: 'Critical Out-of-band', 
        status: smsActive ? 'ACTIVE' : 'OFFLINE (Twilio Missing)', 
        color: smsActive ? 'var(--accent-green)' : 'var(--accent-red)' 
      }
    ]
  });
});

export default router;
