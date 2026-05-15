import { calculateSeverityScore } from '../intelligence/scorer';
import { classifyData, extractEntities } from '../intelligence/classifier';
import { generateFindingHash } from '../intelligence/deduplicator';
import { io } from '../../index';
import { logger } from '../../utils/logger';
import { findingsStore } from '../findingsStore';
import { statsService } from '../stats';
import { alertsStore } from '../alertsStore';
import { alertDispatcher } from '../alerts/dispatcher';

export class MonitoringEngine {
  private findingBuffer: any[] = [];
  private emissionTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startEmissionLoop();
  }

  private startEmissionLoop() {
    if (this.emissionTimer) return;
    this.emissionTimer = setInterval(() => {
      if (this.findingBuffer.length > 0 && io) {
        const batch = this.findingBuffer.splice(0, 10);
        batch.forEach(finding => {
          io.emit('new_finding', finding);
        });
        statsService.broadcast();
      }
    }, 500);
  }

  async processRawFinding(source: any, rawData: string, matchedItem: any) {
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawData);
    } catch (e) {
      parsedData = { rawData };
    }

    const dataType = parsedData.dataType || classifyData(rawData);
    const entities = parsedData.snippet ? { snippet: parsedData.snippet } : extractEntities(rawData);
    
    const findingData: any = {
      source: source.name,
      sourceUrl: parsedData.url || source.url,
      data_type: dataType, 
      rawData: parsedData.snippet || rawData,
      normalizedData: JSON.stringify(entities),
      discovered_at: parsedData.discoveredAt || new Date().toISOString(),
      matched_value: matchedItem.value,
      severity: parsedData.severity || 'LOW',
      severity_score: 0,
      id: `F-${Math.random().toString(36).substring(7).toUpperCase()}`
    };

    const { score, label } = calculateSeverityScore(
      source.name, 
      dataType as any, 
      1.0, 
      0.5
    );

    findingData.severity = label;
    findingData.severity_score = score;

    try {
      const savedFinding = await findingsStore.add(findingData);
      
      // Buffer for throttled emission to avoid ECONNABORTED in proxy
      this.findingBuffer.push(savedFinding);

      // CRITICAL ALERT TRIGGERING
      if (findingData.severity === 'CRITICAL' || findingData.severity === 'HIGH') {
        const alertObj = {
          title: findingData.severity === 'CRITICAL' ? 'Critical Threat Exposure' : 'High-Risk Detection',
          description: `Detection of ${findingData.matched_value} in ${findingData.source} requires immediate tactical review.`,
          severity: findingData.severity,
          source: findingData.source,
          matched_value: findingData.matched_value
        };

        const finalAlert = await alertsStore.add(alertObj);
        
        if (io) {
          setImmediate(() => {
            io.emit('new_alert', finalAlert);
            alertDispatcher.dispatch(finalAlert);
          });
        }
      }
      
      logger.monitor(source.name, `New finding detected for ${matchedItem.value} [${label}]`);
      return findingData;
    } catch (err) {
      logger.error('Failed to save finding', err);
      return null;
    }
  }
}
