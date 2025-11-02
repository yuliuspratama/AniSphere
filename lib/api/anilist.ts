// AniList GraphQL API Client
// Documentation: https://anilist.co/api/v2/graphql
// GraphQL endpoint: https://graphql.anilist.co

import { GraphQLClient } from "graphql-request";

const ANILIST_GRAPHQL_ENDPOINT = "https://graphql.anilist.co";

export interface AniListAnime {
  id: number;
  idMal?: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  description?: string;
  format?: string;
  status?: string;
  episodes?: number;
  duration?: number;
  chapters?: number;
  volumes?: number;
  genres?: string[];
  tags?: Array<{
    id: number;
    name: string;
    description?: string;
    category?: string;
  }>;
  isAdult?: boolean;
  averageScore?: number;
  meanScore?: number;
  popularity?: number;
  trending?: number;
  favourites?: number;
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  season?: string;
  seasonYear?: number;
  studios?: {
    nodes: Array<{
      id: number;
      name: string;
      isAnimationStudio: boolean;
    }>;
  };
  coverImage?: {
    large?: string;
    medium?: string;
    extraLarge?: string;
    color?: string;
  };
  bannerImage?: string;
  characters?: {
    nodes: Array<{
      id: number;
      name: {
        full: string;
        native?: string;
      };
      image: {
        large?: string;
        medium?: string;
      };
    }>;
  };
  staff?: {
    nodes: Array<{
      id: number;
      name: {
        full: string;
        native?: string;
      };
      image: {
        large?: string;
        medium?: string;
      };
      primaryOccupations?: string[];
    }>;
  };
}

export interface AniListPageInfo {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

export interface AniListSearchResult {
  media: AniListAnime[];
  pageInfo: AniListPageInfo;
}

export class AniListClient {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(ANILIST_GRAPHQL_ENDPOINT);
  }

  async searchAnime(
    query: string,
    perPage = 20,
    page = 1
  ): Promise<AniListSearchResult> {
    const searchQuery = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
            id
            idMal
            title {
              romaji
              english
              native
              userPreferred
            }
            description
            format
            status
            episodes
            duration
            genres
            averageScore
            meanScore
            popularity
            trending
            favourites
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            season
            seasonYear
            coverImage {
              large
              medium
              extraLarge
              color
            }
            bannerImage
            studios {
              nodes {
                id
                name
                isAnimationStudio
              }
            }
          }
        }
      }
    `;

    const variables = {
      search: query,
      page,
      perPage,
    };

    const data = await this.client.request<{ Page: AniListSearchResult }>(
      searchQuery,
      variables
    );

    return data.Page;
  }

  async getAnimeById(id: number): Promise<AniListAnime | null> {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          idMal
          title {
            romaji
            english
            native
            userPreferred
          }
          description
          format
          status
          episodes
          duration
          genres
          tags {
            id
            name
            description
            category
          }
          isAdult
          averageScore
          meanScore
          popularity
          trending
          favourites
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          season
          seasonYear
          coverImage {
            large
            medium
            extraLarge
            color
          }
          bannerImage
          studios {
            nodes {
              id
              name
              isAnimationStudio
            }
          }
          characters(page: 1, perPage: 10) {
            nodes {
              id
              name {
                full
                native
              }
              image {
                large
                medium
              }
            }
          }
          staff(page: 1, perPage: 10) {
            nodes {
              id
              name {
                full
                native
              }
              image {
                large
                medium
              }
              primaryOccupations
            }
          }
        }
      }
    `;

    const variables = { id };

    const data = await this.client.request<{ Media: AniListAnime | null }>(
      query,
      variables
    );

    return data.Media;
  }

  async getTrendingAnime(perPage = 10): Promise<AniListAnime[]> {
    const query = `
      query ($perPage: Int) {
        Page(perPage: $perPage) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
              userPreferred
            }
            description
            format
            status
            episodes
            averageScore
            popularity
            trending
            coverImage {
              large
              medium
              extraLarge
              color
            }
            bannerImage
            studios {
              nodes {
                id
                name
                isAnimationStudio
              }
            }
          }
        }
      }
    `;

    const variables = { perPage };

    const data = await this.client.request<{ Page: { media: AniListAnime[] } }>(
      query,
      variables
    );

    return data.Page.media;
  }

  async getSeasonalAnime(
    season: "WINTER" | "SPRING" | "SUMMER" | "FALL",
    year: number,
    perPage = 20
  ): Promise<AniListAnime[]> {
    const query = `
      query ($season: MediaSeason, $seasonYear: Int, $perPage: Int) {
        Page(perPage: $perPage) {
          media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
              userPreferred
            }
            description
            format
            status
            episodes
            averageScore
            popularity
            trending
            coverImage {
              large
              medium
              extraLarge
              color
            }
            bannerImage
            studios {
              nodes {
                id
                name
                isAnimationStudio
              }
            }
          }
        }
      }
    `;

    const variables = {
      season,
      seasonYear: year,
      perPage,
    };

    const data = await this.client.request<{ Page: { media: AniListAnime[] } }>(
      query,
      variables
    );

    return data.Page.media;
  }

  async searchByStudio(studioName: string, perPage = 20): Promise<AniListAnime[]> {
    const query = `
      query ($search: String, $perPage: Int) {
        Page(perPage: $perPage) {
          media(type: ANIME, studio: $search, sort: POPULARITY_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
              userPreferred
            }
            description
            format
            status
            episodes
            averageScore
            popularity
            coverImage {
              large
              medium
              extraLarge
              color
            }
            studios {
              nodes {
                id
                name
                isAnimationStudio
              }
            }
          }
        }
      }
    `;

    const variables = {
      search: studioName,
      perPage,
    };

    const data = await this.client.request<{ Page: { media: AniListAnime[] } }>(
      query,
      variables
    );

    return data.Page.media;
  }
}

export const anilistClient = new AniListClient();

