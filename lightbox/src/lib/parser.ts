import type { PlaySource, VodDetail } from "./types";

export function parsePlaySources(vod: VodDetail): PlaySource[] {
  const fromRaw = vod.vod_play_from || "";
  const urlRaw = vod.vod_play_url || "";

  if (!fromRaw || !urlRaw) return [];

  const froms = fromRaw.split("$$$");
  const urls = urlRaw.split("$$$");

  const sources: PlaySource[] = froms
    .map((source, i) => {
      const line = urls[i] || "";
      if (!line || source === "no") return null;

      const episodes = line
        .split("#")
        .filter(Boolean)
        .map((ep) => {
          const idx = ep.indexOf("$");
          if (idx === -1) return { title: ep, url: ep };
          return {
            title: ep.slice(0, idx),
            url: ep.slice(idx + 1),
          };
        });

      return { source, episodes };
    })
    .filter((s): s is PlaySource => s !== null && s.episodes.length > 0);

  return sortSourcesPreferMtm3u8(sources);
}

export function sortSourcesPreferMtm3u8(sources: PlaySource[]): PlaySource[] {
  return [...sources].sort((a, b) => {
    if (a.source === "mtm3u8") return -1;
    if (b.source === "mtm3u8") return 1;
    return 0;
  });
}

export function getPreferredSource(sources: PlaySource[]): PlaySource | null {
  if (sources.length === 0) return null;
  return sources.find((s) => s.source === "mtm3u8") || sources[0];
}

export const PARSER_BASE = "https://maotai888.vip:966/?url=";

export function buildParserUrl(playUrl: string): string {
  return `${PARSER_BASE}${encodeURIComponent(playUrl)}`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
