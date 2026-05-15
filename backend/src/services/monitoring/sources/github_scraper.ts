/**
 * GitHub Code Scraper Source
 * Scrapes GitHub for exposed secrets without API limits.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export class GitHubScraperSource {
  async scrape(query: string) {
    console.log(`[SOURCE][GITHUB] Scarping code for: ${query}`);
    try {
      const url = `https://github.com/search?type=code&q=${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const $ = cheerio.load(response.data);
      const items: any[] = [];
      $('.code-list-item').each((i, el) => {
        items.push({ repo: $(el).find('.link-gray-dark').text().trim() });
      });
      return items;
    } catch (error) {
      return [];
    }
  }
}
