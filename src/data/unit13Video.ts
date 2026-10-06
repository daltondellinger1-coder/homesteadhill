/**
 * Unit 13 video tour assets.
 *
 * The MP4 and poster are hosted as durable CDN assets via Lovable asset
 * pointers. Fill in the URLs from the `.asset.json` pointer files once the
 * finished video and poster are uploaded. While `videoUrl` is empty the
 * section renders nothing on the public site.
 */
export interface Unit13VideoConfig {
  /** CDN URL of the finished vertical MP4 (36.2s). Empty until uploaded. */
  videoUrl: string;
  /** CDN URL of the poster image shown before playback. Empty until uploaded. */
  posterUrl: string;
}

export const UNIT13_VIDEO: Unit13VideoConfig = {
  videoUrl: "",
  posterUrl: "",
};
