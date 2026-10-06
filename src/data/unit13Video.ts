import videoAsset from "@/assets/media/homestead-hill-unit-13.mp4.asset.json";

/**
 * Unit 13 video tour assets, MP4 on the Lovable CDN, poster in public/media
 * (durable, same-origin, correct video/mp4 + image/jpeg content types).
 */
export interface Unit13VideoConfig {
  /** URL of the finished vertical MP4 (36.2s, 1080x1920). */
  videoUrl: string;
  /** URL of the poster image shown before playback. */
  posterUrl: string;
}

export const UNIT13_VIDEO: Unit13VideoConfig = {
  videoUrl: videoAsset.url,
  posterUrl: "/media/homestead-hill-unit-13-poster.jpg",
};
