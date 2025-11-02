// Jikan API Client (Unofficial MyAnimeList API)
// Documentation: https://jikan.moe/

const JIKAN_API_BASE = "https://api.jikan.moe/v4";

export interface JikanAnime {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url?: string;
      small_image_url?: string;
      large_image_url?: string;
    };
    webp: {
      image_url?: string;
      small_image_url?: string;
      large_image_url?: string;
    };
  };
  trailer?: {
    youtube_id?: string;
    url?: string;
    embed_url?: string;
  };
  approved: boolean;
  titles: Array<{
    type: string;
    title: string;
  }>;
  title: string;
  title_english?: string;
  title_japanese?: string;
  title_synonyms?: string[];
  type?: string;
  source?: string;
  episodes?: number;
  status?: string;
  airing: boolean;
  aired: {
    from?: string;
    to?: string;
    prop: {
      from: { day?: number; month?: number; year?: number };
      to: { day?: number; month?: number; year?: number };
    };
    string?: string;
  };
  duration?: string;
  rating?: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  synopsis?: string;
  background?: string;
  season?: string;
  year?: number;
  broadcast?: {
    day?: string;
    time?: string;
    timezone?: string;
    string?: string;
  };
  producers?: Array<{ mal_id: number; type: string; name: string; url: string }>;
  licensors?: Array<{ mal_id: number; type: string; name: string; url: string }>;
  studios?: Array<{ mal_id: number; type: string; name: string; url: string }>;
  genres?: Array<{ mal_id: number; type: string; name: string; url: string }>;
  explicit_genres?: Array<{ mal_id: number; type: string; name: string; url: string }>;
  themes?: Array<{ mal_id: number; type: string; name: string; url: string }>;
  demographics?: Array<{ mal_id: number; type: string; name: string; url: string }>;
}

export interface JikanSeasonalAnime {
  data: JikanAnime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
  season?: {
    year: number;
    season: string;
  };
}

export interface JikanEpisode {
  mal_id: number;
  url?: string;
  title?: string;
  title_japanese?: string;
  title_romanji?: string;
  aired?: string;
  score?: number;
  filler: boolean;
  recap: boolean;
  forum_url?: string;
}

export interface JikanCharacter {
  mal_id: number;
  url?: string;
  images: {
    jpg?: {
      image_url?: string;
    };
    webp?: {
      image_url?: string;
    };
  };
  name: string;
  name_kanji?: string;
  nicknames?: string[];
  favorites?: number;
  about?: string;
  anime?: Array<{
    role: string;
    anime: {
      mal_id: number;
      title: string;
      images?: {
        jpg?: {
          image_url?: string;
        };
      };
    };
  }>;
  manga?: Array<{
    role: string;
    manga: {
      mal_id: number;
      title: string;
      images?: {
        jpg?: {
          image_url?: string;
        };
      };
    };
  }>;
  voices?: Array<{
    language: string;
    person: {
      mal_id: number;
      name: string;
      images?: {
        jpg?: {
          image_url?: string;
        };
      };
    };
  }>;
}

export interface JikanPerson {
  mal_id: number;
  url?: string;
  images: {
    jpg?: {
      image_url?: string;
    };
  };
  name: string;
  given_name?: string;
  family_name?: string;
  alternate_names?: string[];
  birthday?: string;
  favorites?: number;
  about?: string;
}

export interface JikanStudio {
  mal_id: number;
  type: string;
  name: string;
  url?: string;
}

export class JikanClient {
  private baseUrl: string;
  private rateLimitDelay: number = 400; // Jikan recommends 2 requests per second

  constructor() {
    this.baseUrl = JIKAN_API_BASE;
  }

  private async fetchWithRateLimit<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Simple rate limiting
    await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay));

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait before making another request.");
      }
      throw new Error(`Jikan API error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchAnime(query: string, limit = 25, page = 1): Promise<JikanAnime[]> {
    const response = await this.fetchWithRateLimit<{
      data: JikanAnime[];
      pagination: { last_visible_page: number; has_next_page: boolean };
    }>(`/anime?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`);
    return response.data;
  }

  async getAnimeById(id: number): Promise<JikanAnime> {
    const response = await this.fetchWithRateLimit<{ data: JikanAnime }>(
      `/anime/${id}/full`
    );
    return response.data;
  }

  async getSeasonalAnime(
    year: number,
    season: "winter" | "spring" | "summer" | "fall"
  ): Promise<JikanSeasonalAnime> {
    return this.fetchWithRateLimit<JikanSeasonalAnime>(
      `/seasons/${year}/${season}`
    );
  }

  async getCurrentSeasonAnime(): Promise<JikanSeasonalAnime> {
    return this.fetchWithRateLimit<JikanSeasonalAnime>("/seasons/now");
  }

  async getAnimeEpisodes(id: number, page = 1): Promise<JikanEpisode[]> {
    const response = await this.fetchWithRateLimit<{
      data: JikanEpisode[];
      pagination: { last_visible_page: number; has_next_page: boolean };
    }>(`/anime/${id}/episodes?page=${page}`);
    return response.data;
  }

  async getAnimeCharacters(id: number): Promise<JikanCharacter[]> {
    const response = await this.fetchWithRateLimit<{
      data: Array<{ character: JikanCharacter; role: string; voice_actors?: Array<{ person: JikanPerson }> }>;
    }>(`/anime/${id}/characters`);
    return response.data.map((item) => item.character);
  }

  async getAnimeStaff(id: number): Promise<JikanPerson[]> {
    const response = await this.fetchWithRateLimit<{
      data: Array<{ person: JikanPerson; positions: string[] }>;
    }>(`/anime/${id}/staff`);
    return response.data.map((item) => item.person);
  }

  async searchPeople(query: string, limit = 25): Promise<JikanPerson[]> {
    const response = await this.fetchWithRateLimit<{
      data: JikanPerson[];
      pagination: { last_visible_page: number; has_next_page: boolean };
    }>(`/people?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  }

  async getPersonById(id: number): Promise<JikanPerson> {
    const response = await this.fetchWithRateLimit<{ data: JikanPerson }>(
      `/people/${id}/full`
    );
    return response.data;
  }

  async getTopAnime(type: "all" | "airing" | "upcoming" | "bypopularity" | "favorite", limit = 25, page = 1): Promise<JikanAnime[]> {
    try {
      const response = await this.fetchWithRateLimit<{
        data: JikanAnime[];
        pagination?: { last_visible_page?: number; has_next_page?: boolean };
      }>(`/top/anime?type=${type}&limit=${limit}&page=${page}`);
      
      // Handle different response structures
      if (!response) {
        throw new Error("Empty response from Jikan API");
      }
      
      // Response might be directly an array or have a data property
      if (Array.isArray(response)) {
        return response;
      }
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Log for debugging
      console.warn("Unexpected response structure:", response);
      throw new Error("Invalid response structure from Jikan API");
    } catch (error: any) {
      console.error(`Error fetching top anime (type: ${type}):`, error);
      throw error;
    }
  }

  async getAnimeGenres(): Promise<Array<{ mal_id: number; name: string; url: string }>> {
    const response = await this.fetchWithRateLimit<{
      data: Array<{ mal_id: number; name: string; url: string }>;
    }>("/genres/anime");
    return response.data;
  }

  async getCharacterById(id: number): Promise<JikanCharacter> {
    const response = await this.fetchWithRateLimit<{ data: JikanCharacter }>(
      `/characters/${id}/full`
    );
    return response.data;
  }

  async searchCharacters(query: string, limit = 25): Promise<JikanCharacter[]> {
    const response = await this.fetchWithRateLimit<{
      data: JikanCharacter[];
      pagination: { last_visible_page: number; has_next_page: boolean };
    }>(`/characters?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  }
}

export const jikanClient = new JikanClient();

