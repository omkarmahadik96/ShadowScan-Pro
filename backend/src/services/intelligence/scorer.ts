/**
 * Severity Scoring Engine
 * Formula: Score = (Source_Trust × 0.3) + (Data_Sensitivity × 0.4) + (Recency × 0.2) + (Volume × 0.1)
 */

export type SourceType = 'HIBP' | 'DeHashed' | 'IntelX' | 'Shodan' | 'VirusTotal' | 'TorForum' | 'Pastebin' | 'Telegram' | 'GitHub';
export type DataType = 'credentials' | 'pii' | 'financial' | 'keys' | 'mentions';

const SOURCE_TRUST: Record<string, number> = {
  HIBP: 0.95,
  DeHashed: 0.9,
  IntelX: 0.85,
  Shodan: 0.9,
  VirusTotal: 0.9,
  TorForum: 0.6,
  Pastebin: 0.5,
  Telegram: 0.4,
  GitHub: 0.8,
  BreachDB: 0.95,
  Ahmia: 0.7,
  NetworkScanner: 0.85,
  GitHubScraper: 0.85,
  TelegramMonitor: 0.65,
};

const DATA_SENSITIVITY: Record<DataType, number> = {
  credentials: 0.9,
  pii: 0.8,
  financial: 1.0,
  keys: 0.95,
  mentions: 0.3,
};

export const calculateSeverityScore = (
  source: SourceType,
  type: DataType,
  recency: number, // 0 to 1
  volume: number   // 0 to 1
): { score: number; label: string } => {
  const trust = SOURCE_TRUST[source] || 0.5;
  const sensitivity = DATA_SENSITIVITY[type] || 0.5;

  const score = (trust * 0.3) + (sensitivity * 0.4) + (recency * 0.2) + (volume * 0.1);

  let label = 'INFO';
  if (score >= 0.8) label = 'CRITICAL';
  else if (score >= 0.6) label = 'HIGH';
  else if (score >= 0.4) label = 'MEDIUM';
  else if (score >= 0.2) label = 'LOW';

  return { score: Math.round(score * 100), label };
};
