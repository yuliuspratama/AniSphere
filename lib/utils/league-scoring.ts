// Fantasy League Scoring Logic

export interface LeagueAnimeData {
  anime_id: string;
  mal_score?: number;
  popularity?: number;
  favorites?: number;
  user_count?: number;
}

/**
 * Calculate league points based on anime performance
 */
export function calculateAnimePoints(anime: LeagueAnimeData): number {
  let points = 0;

  // Base points from MAL score (0-10 scale, converted to 0-50 points)
  if (anime.mal_score) {
    points += anime.mal_score * 5;
  }

  // Popularity bonus (rank-based, higher rank = more points)
  if (anime.popularity) {
    // Inverse ranking: rank 1 gets 30 points, rank 100 gets ~3 points
    const popularityPoints = Math.max(0, 31 - Math.log10(anime.popularity));
    points += popularityPoints;
  }

  // Favorites bonus (logarithmic scale)
  if (anime.favorites) {
    const favoritesBonus = Math.min(20, Math.log10(anime.favorites + 1) * 5);
    points += favoritesBonus;
  }

  // User count bonus
  if (anime.user_count) {
    const userCountBonus = Math.min(10, Math.log10(anime.user_count + 1) * 2);
    points += userCountBonus;
  }

  return Math.round(points * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate total team points
 */
export function calculateTeamPoints(animes: LeagueAnimeData[]): number {
  return animes.reduce((total, anime) => total + calculateAnimePoints(anime), 0);
}

/**
 * Get current season for league
 */
export function getCurrentLeagueSeason(): {
  season: "winter" | "spring" | "summer" | "fall";
  year: number;
} {
  const now = new Date();
  const month = now.getMonth() + 1;
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

