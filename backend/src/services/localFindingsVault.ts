import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const FINDINGS_FILE = path.join(DATA_DIR, 'findings_vault.json');

export class LocalFindingsVault {
  static async getAll() {
    try {
      if (!fs.existsSync(FINDINGS_FILE)) return [];
      const data = fs.readFileSync(FINDINGS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  static async add(finding: any) {
    try {
      const findings = await this.getAll();
      const newFinding = { 
        ...finding, 
        id: `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        discoveredAt: finding.discovered_at || new Date().toISOString()
      };
      findings.unshift(newFinding);
      fs.writeFileSync(FINDINGS_FILE, JSON.stringify(findings.slice(0, 1000), null, 2));
      return newFinding;
    } catch (e) {
      console.error('[VAULT_ERROR] Failed to save finding to local vault:', e);
      return finding;
    }
  }
}
