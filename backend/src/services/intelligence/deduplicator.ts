/**
 * Finding Deduplication Engine
 * Ensures the same finding isn't processed and alerted multiple times.
 */

import crypto from 'crypto';

export const generateFindingHash = (finding: any): string => {
  // Hash source, normalized value, and data type to detect duplicates
  const salt = 'shadowscan_pro_v1';
  const data = `${finding.source}:${finding.matched_value}:${finding.data_type}:${salt}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const isDuplicate = async (hash: string, existingHashes: Set<string>): Promise<boolean> => {
  return existingHashes.has(hash);
};
