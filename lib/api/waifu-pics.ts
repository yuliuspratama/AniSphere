// Waifu.pics API Client
// Documentation: https://waifu.pics/docs
// Note: NSFW content requires login/authentication

const WAIFU_PICS_API_BASE = "https://api.waifu.pics";

export interface WaifuPicsResponse {
  files: string[];
}

export class WaifuPicsClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = WAIFU_PICS_API_BASE;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Waifu.pics API error: ${response.statusText}`);
    }

    return response.json();
  }

  // SFW endpoints (no auth required)
  async getSFWImage(category: "waifu" | "neko" | "shinobu" | "megumin" | "bully" | "cuddle" | "cry" | "hug" | "awoo" | "kiss" | "lick" | "pat" | "smug" | "bonk" | "yeet" | "blush" | "smile" | "wave" | "highfive" | "handhold" | "nom" | "bite" | "glomp" | "slap" | "kill" | "kick" | "happy" | "wink" | "poke" | "dance" | "cringe"): Promise<string> {
    const response = await this.fetch<{ url: string }>(`/sfw/${category}`);
    return response.url;
  }

  async getMultipleSFWImages(
    category: "waifu" | "neko" | "shinobu" | "megumin",
    count: number = 10
  ): Promise<string[]> {
    const response = await this.fetch<WaifuPicsResponse>(
      `/many/sfw/${category}`
    );
    return response.files.slice(0, count);
  }
}

export const waifuPicsClient = new WaifuPicsClient();

