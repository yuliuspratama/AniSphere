import type { UserAnimeList } from "@/types/anime.types";

export interface RecommendationParams {
  userList: UserAnimeList[];
  genrePreferences?: string[];
  scorePreferences?: number;
}

/**
 * Simple recommendation algorithm based on user's watch history
 * In production, this would be more sophisticated (collaborative filtering, ML, etc.)
 */
export function generateRecommendations(params: RecommendationParams): string[] {
  const { userList } = params;

  // Extract genres from completed/watching anime (would need anime data)
  // For now, return empty array - this would be enhanced with actual anime data
  const watchedAnimeIds = userList
    .filter((item) => ["completed", "watching"].includes(item.status))
    .map((item) => item.anime_id);

  // Extract high-rated anime IDs for recommendation basis
  const highRatedAnimeIds = userList
    .filter((item) => item.score && item.score >= 8)
    .map((item) => item.anime_id);

  // Return empty for now - would be populated with actual recommendation logic
  // This would query similar anime based on genres, studios, etc.
  return [];
}

/**
 * Get current season based on date
 */
export function getCurrentSeason(): {
  season: "winter" | "spring" | "summer" | "fall";
  year: number;
} {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  let season: "winter" | "spring" | "summer" | "fall";
  if (month >= 12 || month <= 2) {
    season = "winter";
  } else if (month >= 3 && month <= 5) {
    season = "spring";
  } else if (month >= 6 && month <= 8) {
    season = "summer";
  } else {
    season = "fall";
  }

  return { season, year };
}

/**
 * Get watch order data for complex series
 */
export const watchOrderGuides: Record<string, Array<{
  title: string;
  order: number;
  type: "anime" | "movie" | "ova" | "special";
  year: number;
  description?: string;
}>> = {
  fate: [
    { title: "Fate/stay night", order: 1, type: "anime", year: 2006, description: "Original visual novel adaptation" },
    { title: "Fate/stay night: Unlimited Blade Works", order: 2, type: "anime", year: 2014, description: "UBW route adaptation" },
    { title: "Fate/stay night: Heaven's Feel", order: 3, type: "movie", year: 2017, description: "HF route movie trilogy" },
    { title: "Fate/Zero", order: 4, type: "anime", year: 2011, description: "Prequel to FSN" },
    { title: "Fate/Apocrypha", order: 5, type: "anime", year: 2017, description: "Alternative timeline" },
  ],
  monogatari: [
    { title: "Bakemonogatari", order: 1, type: "anime", year: 2009, description: "First season" },
    { title: "Nisemonogatari", order: 2, type: "anime", year: 2012, description: "Fake season" },
    { title: "Nekomonogatari: Kuro", order: 3, type: "anime", year: 2012, description: "Tsubasa Cat" },
    { title: "Monogatari Series: Second Season", order: 4, type: "anime", year: 2013, description: "Main arc" },
    { title: "Hanamonogatari", order: 5, type: "anime", year: 2014, description: "Suruga Devil" },
    { title: "Tsukimonogatari", order: 6, type: "anime", year: 2014, description: "Yotsugi Doll" },
    { title: "Owarimonogatari", order: 7, type: "anime", year: 2015, description: "End story" },
    { title: "Koyomimonogatari", order: 8, type: "anime", year: 2016, description: "Calendar" },
    { title: "Owarimonogatari II", order: 9, type: "anime", year: 2017, description: "Final season" },
  ],
};

