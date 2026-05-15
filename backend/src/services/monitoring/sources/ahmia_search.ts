/**
 * Ahmia Onion Search Source
 * Replacement for IntelX using public Tor gateway scraping.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { configStore } from '../../configStore';

export class AhmiaSearchSource {
  async search(query: string) {
    const config = configStore.get().engine;
    const proxyUrl = `socks5h://${config.torHost}:${config.torPort}`;
    const agent = new SocksProxyAgent(proxyUrl);

    console.log(`[SOURCE][AHMIA] Interrogating Tor Index via Tunnel: ${proxyUrl}`);
    
    try {
      // PRIMARY: True Dark Web surveillance via SOCKS5 Tunnel
      const url = `http://msydqltlzre6ruid.onion/search/?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url, { 
        httpAgent: agent,
        httpsAgent: agent,
        timeout: 15000 
      });
      return this.parseAhmiaResults(response.data);
    } catch (error: any) {
      console.warn(`[SOURCE][AHMIA] Tunnel Offline. Attempting Clear-Web Proxy Fallback...`);
      
      try {
        // SECONDARY: Fallback via Public Tor Gateway (No local Tor required)
        const fallbackUrl = `https://ahmia.fi/search/?q=${encodeURIComponent(query)}`;
        const response = await axios.get(fallbackUrl, { timeout: 10000 });
        return this.parseAhmiaResults(response.data);
      } catch (fallbackError: any) {
        console.error(`[SOURCE][AHMIA] All Gateways Failed: ${fallbackError.message}`);
        return [];
      }
    }
  }

  private parseAhmiaResults(html: string) {
    const $ = cheerio.load(html);
    const results: any[] = [];
    $('.result').each((i, el) => {
      const title = $(el).find('h4').text().trim();
      const url = $(el).find('cite').text().trim();
      const snippet = $(el).find('p').text().trim();
      
      // DEEP_INTEL_EXTRACTION: Look for leak patterns in snippet
      let dataType = 'ONION_REFERENCE';
      let severity = 'MEDIUM';
      
      if (snippet.toLowerCase().includes('password') || snippet.toLowerCase().includes('credential')) {
        dataType = 'LEAKED_CREDENTIALS';
        severity = 'CRITICAL';
      } else if (snippet.toLowerCase().includes('database') || snippet.toLowerCase().includes('dump')) {
        dataType = 'DATABASE_EXPOSURE';
        severity = 'HIGH';
      }

      results.push({
        title,
        url,
        snippet: snippet.substring(0, 500),
        dataType,
        severity,
        discoveredAt: new Date().toISOString()
      });
    });
    return results;
  }
}
