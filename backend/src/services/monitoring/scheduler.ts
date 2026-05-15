/**
 * Monitoring Scheduler
 * Orchestrates the execution of self-hosted monitoring sources.
 */

import { MonitoringEngine } from './engine';
import { BreachDBSource } from './sources/breach_db';
import { AhmiaSearchSource } from './sources/ahmia_search';
import { NetworkScannerSource } from './sources/network_scanner';
import { GitHubScraperSource } from './sources/github_scraper';
import { TelegramMonitorSource } from './sources/telegram_monitor';
import { shadowLinkSource } from './sources/shadowLink';
import { logger } from '../../utils/logger';
import { watchlistStore } from '../watchlistStore';
import { statsService } from '../stats';
import { configStore } from '../configStore';
import { engineStatus } from '../engineStatus';

export class MonitoringScheduler {
  private engine: MonitoringEngine;
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.engine = new MonitoringEngine();
  }

  start() {
    const config = configStore.get();
    engineStatus.update({ autoScanEnabled: config.engine?.autoScan !== false });

    // TACTICAL_FLUSH: Always clear interval to prevent double-scheduling or leak
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }

    // Only start if auto-scan is enabled in config
    if (config.engine?.autoScan === false) {
      logger.info('ShadowScan Intelligence Scheduler: Auto-scan is DISABLED');
      return;
    }

    logger.info('ShadowScan Intelligence Scheduler Started/Resumed');
    
    const run = async () => {
      try {
        const current = engineStatus.get();
        if (!current.isRunning) {
          await this.runAllJobs();
        }
      } catch (err) {
        logger.error('Critical Scheduler Error', err);
      } finally {
        const config = configStore.get();
        const intervalMs = (config.engine?.interval || 15) * 60000;
        this.interval = setTimeout(run, intervalMs) as any;
      }
    };

    run();
  }

  restart() {
    this.start();
  }

  getStatus() {
    return engineStatus.get();
  }

  async triggerNow() {
    const current = engineStatus.get();
    if (current.isRunning) return;
    logger.info('Manual Intelligence Trigger Initiated');
    await this.runAllJobs();
  }

  private async runAllJobs() {
    engineStatus.update({ isRunning: true });
    try {
      logger.info('Initiating Intelligence Surveillance Cycle...');
      // FETCH ALL ACTIVE TARGETS FROM DATABASE
      let watchlist = await watchlistStore.getActive();

      if (watchlist.length === 0) {
        logger.warn('No active targets in watchlist. Surveillance idling.');
        return;
      }

      for (const item of (watchlist as any)) {
        try {
          logger.info(`[SURVEILLANCE] Processing targets for: ${item.value}`);
          
          const tasks = [
            // 1. LIVE DARK WEB SEARCH (Ahmia)
            (async () => {
              try {
                const ahmia = new AhmiaSearchSource();
                const ahmiaResults = await ahmia.search(item.value);
                for (const res of ahmiaResults) {
                  statsService.broadcastSignal(`[DARK_WEB_LEAK] Found reference to ${item.value} on ${res.url}`, 'HIGH');
                  await this.engine.processRawFinding({ name: 'Ahmia_Dark_Index', url: 'http://msydqltlzre6ruid.onion/' }, JSON.stringify(res), item);
                }
              } catch (e) { logger.warn(`Ahmia task failed for ${item.value}`); }
            })(),

            // 2. LIVE INFRASTRUCTURE RECON
            (async () => {
              if (item.type === 'domain') {
                try {
                  const axios = require('axios');
                  const dnsRes = await axios.get(`https://dns.google/resolve?name=${item.value}`);
                  const data = dnsRes.data.Answer || [];
                  const res = { target: item.value, records: data, status: 'RECON_COMPLETE' };
                  statsService.broadcastSignal(`[INFRA_RECON] Mapped ${data.length} DNS nodes for ${item.value}`, 'MEDIUM');
                  await this.engine.processRawFinding({ name: 'Infrastructure_Recon', url: 'DNS_UPLINK' }, JSON.stringify(res), item);
                } catch (e) { logger.warn(`DNS Recon failed for ${item.value}`); }
              }
            })(),

            // 3. CODE LEAK MONITOR (GitHub)
            (async () => {
              try {
                const github = new GitHubScraperSource();
                const githubResults = await github.scrape(item.value);
                for (const res of githubResults) {
                  statsService.broadcastSignal(`[CODE_LEAK] Exposed repository detected for ${item.value}`, 'CRITICAL');
                  await this.engine.processRawFinding({ name: 'GitHub_Surveillance', url: 'github.com' }, JSON.stringify(res), item);
                }
              } catch (e) { logger.warn(`GitHub task failed for ${item.value}`); }
            })(),

            // 4. SHADOW_LINK INFRASTRUCTURE MAPPING
            (async () => {
              if (item.type === 'domain') {
                try {
                  const shadowResults = await shadowLinkSource.discover(item.value);
                  for (const res of shadowResults) {
                    statsService.broadcastSignal(`[SHADOW_LINK] Linked asset discovered: ${res.matched_value}`, 'LOW');
                    await this.engine.processRawFinding({ name: 'ShadowLink_Recon', url: 'crt.sh' }, JSON.stringify(res), item);
                  }
                } catch (e) { logger.warn(`ShadowLink Recon failed for ${item.value}`); }
              }
            })()
          ];

          await Promise.allSettled(tasks);
        } catch (error) {
          logger.error(`Critical failure in surveillance cycle for ${item.value}`, error);
        }
      }

      statsService.broadcast();
    } finally {
      engineStatus.update({ isRunning: false, lastScanAt: new Date().toISOString() });
      logger.info('Intelligence Surveillance Cycle Complete.');
    }
  }
}

export const monitoringScheduler = new MonitoringScheduler();
