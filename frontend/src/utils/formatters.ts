/**
 * Data Formatters
 * Helpers for displaying technical and date data consistently.
 */

import { format } from 'date-fns';

export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
};

export const truncateHash = (hash: string) => {
  return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
};

export const formatSeverity = (score: number) => {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
};
