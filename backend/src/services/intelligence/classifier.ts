/**
 * Data Type Classifier
 * Identifies the type of data found using patterns and heuristics.
 */

import { DataType } from './scorer';

const PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  credit_card: /\b(?:\d{4}[\s-]?){4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  api_key: /(?:key|api|token|secret)[-_=:\s]+[a-zA-Z0-9]{32,}/gi,
  crypto_btc: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g,
  phone: /\+?\d{1,4}[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
};

export const classifyData = (content: string): DataType => {
  if (PATTERNS.credit_card.test(content)) return 'financial';
  if (PATTERNS.api_key.test(content)) return 'keys';
  if (PATTERNS.ssn.test(content) || PATTERNS.phone.test(content)) return 'pii';
  if (PATTERNS.email.test(content)) return 'credentials';
  return 'mentions';
};

export const extractEntities = (content: string) => {
  return {
    emails: content.match(PATTERNS.email) || [],
    cards: content.match(PATTERNS.credit_card) || [],
    keys: content.match(PATTERNS.api_key) || [],
    ips: content.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) || [],
  };
};
