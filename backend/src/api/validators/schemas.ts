/**
 * Validation Schemas
 * Ensures all incoming API data matches the expected format.
 */

import { z } from 'zod';

export const WatchlistSchema = z.object({
  type: z.enum(['email', 'domain', 'keyword', 'ip', 'crypto']),
  value: z.string().min(1),
  label: z.string().optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']).default('MEDIUM')
});

export const FindingStatusSchema = z.object({
  status: z.enum(['new', 'investigating', 'resolved', 'false_positive'])
});
