/**
 * Honeytoken Management Service
 * Generates and monitors fake credentials to detect early-stage breaches.
 */

import { v4 as uuidv4 } from 'uuid';

export class HoneytokenService {
  generateToken(type: 'email' | 'api_key' | 'credentials') {
    const id = uuidv4().slice(0, 8);
    switch (type) {
      case 'email': return `canary_${id}@company-honey.com`;
      case 'api_key': return `sk_live_${uuidv4().replace(/-/g, '')}`;
      case 'credentials': return { user: `dev_admin_${id}`, pass: uuidv4().slice(0, 12) };
    }
  }

  isHoneytoken(value: string, knownTokens: string[]): boolean {
    return knownTokens.includes(value);
  }
}
