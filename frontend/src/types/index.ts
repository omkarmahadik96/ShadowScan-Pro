/**
 * Global Type Definitions
 * Shared interfaces for frontend components and services.
 */

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface Finding {
  id: string;
  source: string;
  sourceUrl?: string;
  dataType: string;
  severity: Severity;
  severityScore: number;
  matchedValue: string;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  discoveredAt: string;
  rawData?: any;
  normalizedData: {
    emails: string[];
    ips: string[];
    keys: string[];
    [key: string]: any;
  };
}

export interface WatchlistItem {
  id: string;
  type: 'email' | 'domain' | 'keyword' | 'ip' | 'crypto';
  value: string;
  label?: string;
  priority: Severity;
  isActive: boolean;
}
