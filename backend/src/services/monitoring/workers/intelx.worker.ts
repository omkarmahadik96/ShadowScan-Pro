/**
 * Ahmia Onion Search Worker (Replacement for IntelX)
 * Scrapes Ahmia.fi to find mentions on the Tor network without API costs.
 */

import axios from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import * as cheerio from 'cheerio';

export class AhmiaWorker {
  private agent: SocksProxyAgent;
  private baseUrl = 'https://ahmia.fi/search/?q=';

  constructor(proxyUrl = 'socks5h://127.0.0.1:9050') {
    this.agent = new SocksProxyAgent(proxyUrl);
  }

  async searchOnion(query: string) {
    try {
      // Ahmia is a public surface-web portal to onion content
      const url = `${this.baseUrl}${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
        timeout: 20000
      });
      
      const $ = cheerio.load(response.data);
      const results: any[] = [];

      $('.result').each((i, el) => {
        results.push({
          title: $(el).find('h4').text().trim(),
          url: $(el).find('cite').text().trim(),
          snippet: $(el).find('p').text().trim(),
          source: 'Ahmia Search'
        });
      });

      return results;
    } catch (error) {
      console.error('Ahmia Search Scraper Failed:', (error as any).message);
      return [];
    }
  }
}
