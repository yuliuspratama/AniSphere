// Anime Facts API Client
// Documentation: https://chandan-02.github.io/anime-facts-rest-api/

const ANIME_FACTS_API_BASE = "https://anime-facts-rest-api.herokuapp.com/api/v1";

export interface AnimeFact {
  success: boolean;
  data?: {
    anime_id: number;
    anime_name: string;
    anime_img: string;
  }[];
  total_facts?: number;
  anime_img?: string;
  fact_id?: number;
  fact?: string;
}

export class AnimeFactsClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ANIME_FACTS_API_BASE;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);

    if (!response.ok) {
      throw new Error(`Anime Facts API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getAllAnime(): Promise<AnimeFact["data"]> {
    const response = await this.fetch<AnimeFact>("/");
    return response.data || [];
  }

  async getAnimeFacts(animeName: string): Promise<{
    success: boolean;
    total_facts: number;
    anime_img: string;
    data: Array<{ fact_id: number; fact: string }>;
  }> {
    // Convert anime name to snake_case format used by API
    const formattedName = animeName.toLowerCase().replace(/\s+/g, "_");
    return this.fetch(`/${formattedName}`);
  }

  async getSpecificFact(animeName: string, factId: number): Promise<{
    success: boolean;
    data: { fact_id: number; fact: string };
  }> {
    const formattedName = animeName.toLowerCase().replace(/\s+/g, "_");
    return this.fetch(`/${formattedName}/${factId}`);
  }
}

export const animeFactsClient = new AnimeFactsClient();

