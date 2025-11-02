// Common anime/manga types used across the application

export interface Anime {
  id: string | number;
  title: string;
  title_en?: string;
  title_japanese?: string;
  synopsis?: string;
  poster_image?: string;
  cover_image?: string;
  type?: "anime" | "manga";
  status?: string;
  episode_count?: number;
  chapter_count?: number;
  rating?: string;
  score?: number;
  popularity?: number;
  genres?: Genre[];
  studios?: Studio[];
  producers?: Producer[];
  start_date?: string;
  end_date?: string;
  season?: string;
  year?: number;
}

export interface Manga extends Omit<Anime, "episode_count" | "studios" | "season"> {
  chapter_count?: number;
  volume_count?: number;
  serialization?: string;
  authors?: Author[];
}

export interface Genre {
  id: string | number;
  name: string;
  slug?: string;
}

export interface Studio {
  id: string | number;
  name: string;
}

export interface Producer {
  id: string | number;
  name: string;
}

export interface Author {
  id: string | number;
  name: string;
}

export interface Character {
  id: string | number;
  name: string;
  name_japanese?: string;
  image?: string;
  role?: string;
  voice_actor?: Staff;
}

export interface Staff {
  id: string | number;
  name: string;
  name_japanese?: string;
  image?: string;
  role?: string; // seiyuu, director, etc.
}

export interface Episode {
  id: string | number;
  number: number;
  title?: string;
  aired?: string;
  filler?: boolean;
}

export interface Chapter {
  id: string | number;
  number: number;
  title?: string;
  published?: string;
}

export interface UserAnimeList {
  id: string;
  user_id: string;
  anime_id: string;
  status: "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";
  progress: number;
  score?: number;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRating {
  id: string;
  user_id: string;
  anime_id?: string;
  manga_id?: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  anime_id: string;
  episode_number: number;
  watched_at: string;
  created_at: string;
}

export interface Season {
  year: number;
  season: "winter" | "spring" | "summer" | "fall";
}

export interface WatchOrder {
  anime_id: string;
  title: string;
  order: number;
  type: "anime" | "movie" | "ova" | "special";
  year: number;
  description?: string;
}

