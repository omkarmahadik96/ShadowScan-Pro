/**
 * Tor Forum Crawler Source
 * Uses Tor proxy to scrape onion-based threat forums.
 */

import axios from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';

export class TorCrawlerSource {
  private agent: SocksProxyAgent;

  constructor(proxyUrl = 'socks5h://127.0.0.1:9050') {
    this.agent = new SocksProxyAgent(proxyUrl);
  }

  async crawl(url: string) {
    console.log(`[SOURCE][TOR] Crawling onion: ${url}`);
    try {
      const response = await axios.get(url, {
        httpAgent: this.agent,
        httpsAgent: this.agent,
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }
}
