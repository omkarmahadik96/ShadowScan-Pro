/**
 * Internal Network Scanner Source
 * Replacement for Shodan using Nmap service detection.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export class NetworkScannerSource {
  async scan(target: string) {
    console.log(`[SOURCE][SCANNER] Initiating port scan: ${target}`);
    try {
      const { stdout } = await execPromise(`nmap -F ${target}`);
      return { target, results: stdout };
    } catch (error) {
      return { target, error: 'Scanner binary not found.' };
    }
  }
}
