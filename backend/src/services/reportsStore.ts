import fs from 'fs';
import path from 'path';

interface ReportEntry {
  id: string;
  name: string;
  date: string;
  type: string;
  stats: any;
}

console.log('[DEBUG] ReportsStore module loading...');
class ReportsStore {
  private filePath = path.join(__dirname, '..', '..', 'data', 'reports.json');
  private reports: ReportEntry[] = [];

  constructor() {
    this.ensureDirectory();
    this.load();
    // Force initial save if empty
    if (this.reports.length === 0) {
      this.reports = [
        { id: 'R-904', name: 'Q1 Threat Audit', date: '2026-03-31', type: 'EXECUTIVE_STRATEGIC_SUMMARY', stats: {} },
        { id: 'R-852', name: 'Identity Leak Log', date: '2026-04-15', type: 'TECHNICAL_FORENSIC_DEEP_DIVE', stats: {} }
      ];
      this.save();
    }
  }

  private ensureDirectory() {
    const dir = path.dirname(this.filePath);
    console.log(`[REPORTS_STORE] Target Storage: ${this.filePath}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        this.reports = JSON.parse(data);
      } else {
        this.reports = [
          { id: 'R-904', name: 'Q1 Threat Audit', date: '2026-03-31', type: 'EXECUTIVE', stats: {} },
          { id: 'R-852', name: 'Identity Leak Log', date: '2026-04-15', type: 'TECHNICAL', stats: {} }
        ];
        this.save();
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
      this.reports = [];
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.reports, null, 2));
    } catch (error) {
      console.error('Failed to save reports:', error);
    }
  }

  getAll() {
    return this.reports;
  }

  add(report: ReportEntry) {
    this.reports.unshift(report);
    if (this.reports.length > 20) this.reports.pop(); // Keep last 20
    this.save();
  }

  clear() {
    this.reports = [];
    this.save();
  }
}

export const reportsStore = new ReportsStore();
