import { prisma } from '../lib/prisma';
import { adversariesStore } from './adversariesStore';
import { LocalFindingsVault } from './localFindingsVault';
import { logger } from '../utils/logger';

class FindingsStore {
  async add(finding: any) {
    try {
      const savedFinding = await prisma.finding.create({
        data: {
          source: finding.source,
          sourceUrl: finding.sourceUrl,
          dataType: finding.data_type,
          severity: finding.severity,
          severityScore: finding.severity_score,
          matchedValue: finding.matched_value,
          rawData: finding.rawData,
          normalizedData: finding.normalizedData,
          status: finding.status || 'new',
          discoveredAt: finding.discovered_at ? new Date(finding.discovered_at) : new Date()
        }
      });
      
      // BROADCAST_TACTICAL_DATA: Instant UI update via global socket instance
      const io = (global as any).io;
      if (io) io.emit('new_finding', savedFinding);
      
      this.handleAdversaryDiscovery(finding);
      return savedFinding;
    } catch (error: any) {
      logger.error(`[DB_UPLINK_FAIL] Falling back to LocalVault for finding: ${finding.source}`);
      const localFinding = await LocalFindingsVault.add(finding);
      const io = (global as any).io;
      if (io) io.emit('new_finding', localFinding);
      return localFinding;
    }
  }

  private async handleAdversaryDiscovery(finding: any) {
    try {
      if (finding.severity === 'CRITICAL' || finding.severity === 'HIGH') {
        const existing = await adversariesStore.getAll();
        const isKnown = existing.some((a: any) => 
          a.name.toLowerCase() === finding.source.toLowerCase() || 
          (a.aliases || []).some((al: string) => al.toLowerCase() === finding.source.toLowerCase())
        );
        
        if (!isKnown && finding.source && !finding.source.includes('Fallback')) {
          await adversariesStore.add({
            name: finding.source,
            aliases: [`Auto_Detect_${Math.floor(Math.random() * 1000)}`],
            origin: 'Under Analysis',
            active: 'Detected ' + new Date().getFullYear(),
            motivation: 'Suspicious ' + finding.data_type,
            targets: ['Infrastructure', 'Cross-Sector'],
            severity: finding.severity,
            status: 'Active'
          });
        }
      }
    } catch (e) {
      logger.warn('[ADVERSARY_SYNC] Failed to auto-discover adversary from finding');
    }
  }

  async clearAll() {
    try {
      await prisma.finding.deleteMany({});
    } catch (e) {
      logger.warn('[DB_CLEAR_FAIL] LocalVault cleanup only');
    }
    return true;
  }

  async getAll() {
    try {
      const dbFindings = await prisma.finding.findMany({
        orderBy: { discoveredAt: 'desc' },
        take: 500
      });
      return dbFindings;
    } catch (error) {
      logger.warn('[DB_SYNC_LOST] Retrieving findings from LocalVault');
      return await LocalFindingsVault.getAll();
    }
  }
}

export const findingsStore = new FindingsStore();

