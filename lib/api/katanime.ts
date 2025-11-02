// Katanime API Client - Random anime quotes in Indonesian
// Documentation available through various sources

const KATANIME_API_BASE = "https://katanime.vercel.app/api";

export interface KatanimeQuote {
  anime: string;
  character: string;
  quote: string;
  episode?: string;
}

export class KatanimeClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = KATANIME_API_BASE;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);

    if (!response.ok) {
      throw new Error(`Katanime API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getRandomQuote(): Promise<KatanimeQuote> {
    try {
      return this.fetch<KatanimeQuote>("/getrandom");
    } catch (error) {
      // Fallback if API structure is different
      const response = await this.fetch<{ result: KatanimeQuote }>("/getrandom");
      return response.result;
    }
  }

  async getQuotesByAnime(animeName: string): Promise<KatanimeQuote[]> {
    try {
      const response = await this.fetch<{ result: KatanimeQuote[] }>(
        `/getbyanime?anime=${encodeURIComponent(animeName)}`
      );
      return response.result || [];
    } catch (error) {
      // Fallback handling
      return [];
    }
  }

  async getAllAnime(): Promise<string[]> {
    try {
      const response = await this.fetch<{ result: string[] }>("/getlistanime");
      return response.result || [];
    } catch (error) {
      return [];
    }
  }
}

export const katanimeClient = new KatanimeClient();

