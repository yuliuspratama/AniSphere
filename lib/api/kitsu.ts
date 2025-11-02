// Kitsu API Client
// Documentation: https://kitsu.docs.apiary.io/

const KITSU_API_BASE = "https://kitsu.io/api/edge";

export interface KitsuAnime {
  id: string;
  type: string;
  attributes: {
    slug: string;
    synopsis: string;
    titles: {
      en?: string;
      en_jp?: string;
      ja_jp?: string;
    };
    canonicalTitle: string;
    abbreviatedTitles?: string[];
    averageRating?: string;
    ratingFrequencies?: Record<string, string>;
    userCount: number;
    favoritesCount: number;
    startDate?: string;
    endDate?: string;
    popularityRank: number;
    ratingRank?: number;
    ageRating?: string;
    ageRatingGuide?: string;
    subtype?: string;
    status: string;
    tba?: string;
    posterImage?: {
      tiny?: string;
      small?: string;
      medium?: string;
      large?: string;
      original?: string;
    };
    coverImage?: {
      tiny?: string;
      small?: string;
      large?: string;
      original?: string;
    };
    episodeCount?: number;
    episodeLength?: number;
    totalLength?: number;
    youtubeVideoId?: string;
    showType?: string;
    nsfw?: boolean;
  };
  relationships: {
    genres?: { data: Array<{ id: string; type: string }> };
    categories?: { data: Array<{ id: string; type: string }> };
    castings?: { data: Array<{ id: string; type: string }> };
    installments?: { data: Array<{ id: string; type: string }> };
    mappings?: { data: Array<{ id: string; type: string }> };
    reviews?: { data: Array<{ id: string; type: string }> };
    mediaRelationships?: { data: Array<{ id: string; type: string }> };
    characters?: { data: Array<{ id: string; type: string }> };
    staff?: { data: Array<{ id: string; type: string }> };
    productions?: { data: Array<{ id: string; type: string }> };
    quotes?: { data: Array<{ id: string; type: string }> };
  };
}

export interface KitsuManga extends Omit<KitsuAnime, "attributes"> {
  attributes: KitsuAnime["attributes"] & {
    chapterCount?: number;
    volumeCount?: number;
    serialization?: string;
  };
}

export interface KitsuResponse<T> {
  data: T[];
  meta?: {
    count: number;
  };
  links?: {
    first?: string;
    next?: string;
    last?: string;
  };
}

export class KitsuClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = KITSU_API_BASE;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Kitsu API error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchAnime(query: string, limit = 20): Promise<KitsuAnime[]> {
    const response = await this.fetch<KitsuResponse<KitsuAnime>>(
      `/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=${limit}`
    );
    return response.data;
  }

  async getAnimeById(id: string): Promise<KitsuAnime> {
    const response = await this.fetch<{ data: KitsuAnime }>(`/anime/${id}`);
    return response.data;
  }

  async getTrendingAnime(limit = 10): Promise<KitsuAnime[]> {
    const response = await this.fetch<KitsuResponse<KitsuAnime>>(
      `/anime?sort=-popularityRank&page[limit]=${limit}`
    );
    return response.data;
  }

  async getSeasonalAnime(
    year: number,
    season: "winter" | "spring" | "summer" | "fall",
    limit = 20
  ): Promise<KitsuAnime[]> {
    // Kitsu uses different season mapping
    const seasonStartMonth = {
      winter: "01",
      spring: "04",
      summer: "07",
      fall: "10",
    }[season];

    const response = await this.fetch<KitsuResponse<KitsuAnime>>(
      `/anime?filter[seasonYear]=${year}&filter[season]=${season}&page[limit]=${limit}`
    );
    return response.data;
  }

  async searchManga(query: string, limit = 20): Promise<KitsuManga[]> {
    const response = await this.fetch<KitsuResponse<KitsuManga>>(
      `/manga?filter[text]=${encodeURIComponent(query)}&page[limit]=${limit}`
    );
    return response.data;
  }

  async getMangaById(id: string): Promise<KitsuManga> {
    const response = await this.fetch<{ data: KitsuManga }>(`/manga/${id}`);
    return response.data;
  }

  async searchCharacters(query: string, limit = 20): Promise<any[]> {
    const response = await this.fetch<{ data: any[] }>(
      `/characters?filter[name]=${encodeURIComponent(query)}&page[limit]=${limit}`
    );
    return response.data || [];
  }

  async searchByStudio(studioName: string, limit = 20): Promise<KitsuAnime[]> {
    // This requires fetching productions first
    const response = await this.fetch<KitsuResponse<KitsuAnime>>(
      `/anime?filter[producers.name]=${encodeURIComponent(studioName)}&page[limit]=${limit}`
    );
    return response.data;
  }
}

export const kitsuClient = new KitsuClient();

