"use client";

import type { Episode, PlaySource } from "@/lib/types";

interface EpisodeListProps {
  sources: PlaySource[];
  activeSource: string;
  activeEpisode: number;
  onSourceChange: (source: string) => void;
  onEpisodeChange: (index: number) => void;
}

export default function EpisodeList({
  sources,
  activeSource,
  activeEpisode,
  onSourceChange,
  onEpisodeChange,
}: EpisodeListProps) {
  const currentSource =
    sources.find((s) => s.source === activeSource) || sources[0];

  if (!currentSource) {
    return (
      <p className="text-sm text-[var(--muted)]">暂无可用播放源</p>
    );
  }

  return (
    <div className="space-y-4">
      {sources.length > 1 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-[var(--muted)]">
            播放线路
          </h3>
          <div className="flex flex-wrap gap-2">
            {sources.map((s) => (
              <button
                key={s.source}
                onClick={() => onSourceChange(s.source)}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  activeSource === s.source
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--card)] text-[var(--muted)] hover:text-white"
                }`}
              >
                {s.source}
                {s.source === "mtm3u8" && " (推荐)"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-medium text-[var(--muted)]">
          选集 ({currentSource.episodes.length})
        </h3>
        <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6 md:grid-cols-8">
          {currentSource.episodes.map((ep: Episode, idx: number) => (
            <button
              key={`${ep.title}-${idx}`}
              onClick={() => onEpisodeChange(idx)}
              className={`rounded-md px-2 py-2 text-xs transition ${
                activeEpisode === idx
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-white"
              }`}
              title={ep.title}
            >
              {ep.title.replace(/^第/, "").replace(/集$/, "") || idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
