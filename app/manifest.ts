import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AniSphere - Platform Anime & Manga Terpadu",
    short_name: "AniSphere",
    description:
      "Platform komprehensif untuk tracking, discovery, gamifikasi, dan interaksi sosial seputar anime dan manga",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["entertainment", "social", "lifestyle"],
    shortcuts: [
      {
        name: "Beranda",
        short_name: "Beranda",
        description: "Lihat rekomendasi dan anime trending",
        url: "/beranda",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Koleksiku",
        short_name: "Koleksiku",
        description: "Kelola daftar tonton Anda",
        url: "/koleksiku",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Arena",
        short_name: "Arena",
        description: "Liga, kuis, dan komunitas",
        url: "/arena",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}

