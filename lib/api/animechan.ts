// AnimeChan API Client - Random anime quotes
// Documentation: https://animechan.xyz/

const ANIMECHAN_API_BASE = "https://animechan.xyz/api";

export interface AnimeChanQuote {
  anime: string;
  character: string;
  quote: string;
}

export class AnimeChanClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ANIMECHAN_API_BASE;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);

    if (!response.ok) {
      throw new Error(`AnimeChan API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getRandomQuote(): Promise<AnimeChanQuote> {
    return this.fetch<AnimeChanQuote>("/random");
  }

  async getRandomQuotes(count: number = 10): Promise<AnimeChanQuote[]> {
    return this.fetch<AnimeChanQuote[]>(`/random/${count}`);
  }

  async getQuotesByAnime(animeName: string, page: number = 1): Promise<AnimeChanQuote[]> {
    return this.fetch<AnimeChanQuote[]>(
      `/quotes/anime?title=${encodeURIComponent(animeName)}&page=${page}`
    );
  }

  async getQuotesByCharacter(characterName: string, page: number = 1): Promise<AnimeChanQuote[]> {
    return this.fetch<AnimeChanQuote[]>(
      `/quotes/character?name=${encodeURIComponent(characterName)}&page=${page}`
    );
  }
}

export const animeChanClient = new AnimeChanClient();

