/**
 * Tor Forum Crawler Worker
 * Uses Tor proxy to scrape onion-based threat forums.
 */

import axios from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';

export class TorForumWorker {
  private proxyUrl: string;
  private agent: SocksProxyAgent;

  constructor(proxyUrl = 'socks5h://127.0.0.1:9050') {
    this.proxyUrl = proxyUrl;
    this.agent = new SocksProxyAgent(this.proxyUrl);
  }

  async scrapeOnion(url: string) {
    try {
      const response = await axios.get(url, {
        httpAgent: this.agent,
        httpsAgent: this.agent,
        timeout: 30000
      });
      
      return response.data; // HTML content
    } catch (error) {
      console.error(`Tor Scrape Failed for ${url}:`, (error as any).message);
      return null;
    }
  }
}
