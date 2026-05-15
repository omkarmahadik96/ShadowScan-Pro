import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

export class LocalVault {
  static getPath(filename: string) {
    return path.join(DATA_DIR, filename);
  }

  static async read(filename: string): Promise<any[]> {
    try {
      const filePath = this.getPath(filename);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (e) {
      console.error(`[VAULT] Failed to read ${filename}:`, e);
    }
    return [];
  }

  static async write(filename: string, data: any[]) {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(this.getPath(filename), JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`[VAULT] Failed to write ${filename}:`, e);
    }
  }
}
