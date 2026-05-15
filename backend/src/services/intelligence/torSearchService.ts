import axios from 'axios';
import * as cheerio from 'cheerio';
import { findingsStore } from '../findingsStore';
import { logger } from '../../utils/logger';

class TorSearchService {
  /**
   * Performs a real-world search on Ahmia.fi (Dark Web Indexer)
   * This is a LIVE detection against actual .onion sites
   */
  async searchAhmia(query: string) {
    logger.info(`[TOR_SEARCH] Initiating live dark web query for: ${query}`);
    
    try {
      // Ahmia is a public clear-web proxy to search the dark web
      const response = await axios.get(`https://ahmia.fi/search/?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const results: any[] = [];

      $('.result').each((i, el) => {
        if (i >= 5) return; // Limit to top 5 real results for performance

        const title = $(el).find('h4').text().trim();
        const url = $(el).find('cite').text().trim();
        const snippet = $(el).find('p').text().trim();

        if (url && (url.includes('.onion') || url.includes('ahmia.fi'))) {
          results.push({
            source: 'TOR_INDEX (AHMIA)',
            sourceUrl: url,
            data_type: 'LEAKED_ONION_REFERENCE',
            severity: 'HIGH',
            severity_score: 85,
            matched_value: query,
            rawData: snippet,
            normalizedData: `Title: ${title} | Link: ${url}`,
            status: 'new',
            discovered_at: new Date().toISOString()
          });
        }
      });

      if (results.length > 0) {
        logger.info(`[TOR_SEARCH] Found ${results.length} live matches on dark web index for: ${query}`);
        for (const finding of results) {
          await findingsStore.add(finding);
        }
        return results;
      }

      return [];
    } catch (error: any) {
      logger.error(`[TOR_SEARCH] Ahmia query failed for ${query}:`, error.message);
      return [];
    }
  }
}

export const torSearchService = new TorSearchService();
