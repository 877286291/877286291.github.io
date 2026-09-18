"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import EpisodeList from "@/components/EpisodeList";
import VideoPlayer from "@/components/VideoPlayer";
import { getPreferredSource } from "@/lib/parser";
import type { VodDetail } from "@/lib/types";

interface DetailPageClientProps {
  id: string;
}

export default function DetailPageClient({ id }: DetailPageClientProps) {
  const [detail, setDetail] = useState<VodDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState("mtm3u8");
  const [activeEpisode, setActiveEpisode] = useState(0);
  const [playUrl, setPlayUrl] = useState("");
  const [playLoading, setPlayLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/detail?id=${id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const vod: VodDetail = data.detail;
      setDetail(vod);

      const preferred = getPreferredSource(vod.playSources || []);
      if (preferred) {
        setActiveSource(preferred.source);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载详情失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const resolvePlayUrl = useCallback(
    async (rawUrl: string, source: string) => {
      setPlayLoading(true);
      try {
        const useParser = source !== "mtm3u8";
        const params = new URLSearchParams({
          url: rawUrl,
          parser: useParser ? "true" : "false",
        });
        const res = await fetch(`/api/play?${params}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setPlayUrl(data.playUrl || data.url);
      } catch (err) {
        setPlayUrl(rawUrl);
        console.error(err);
      } finally {
        setPlayLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    if (!detail?.playSources?.length) return;

    const source =
      detail.playSources.find((s) => s.source === activeSource) ||
      detail.playSources[0];
    const episode = source?.episodes[activeEpisode];
    if (episode?.url) {
      resolvePlayUrl(episode.url, source.source);
    }
  }, [detail, activeSource, activeEpisode, resolvePlayUrl]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-red-300">{error || "未找到该视频"}</p>
        <Link href="/" className="text-[var(--accent)] hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  const synopsis =
    detail.vod_blurb ||
    detail.vod_content?.replace(/<[^>]+>/g, "").slice(0, 300) ||
    "暂无简介";

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-[var(--muted)] hover:text-white"
      >
        ← 返回首页
      </Link>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="mx-auto w-full max-w-[280px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              detail.vod_pic ||
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='420' fill='%232a2a3e'%3E%3Crect width='280' height='420'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%238b8b9e'%3E暂无封面%3C/text%3E%3C/svg%3E"
            }
            alt={detail.vod_name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {detail.vod_name}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-[var(--muted)]">
              {detail.type_name && (
                <span className="rounded bg-[var(--card)] px-2 py-0.5">
                  {detail.type_name}
                </span>
              )}
              {detail.vod_remarks && (
                <span className="rounded bg-[var(--accent)]/20 px-2 py-0.5 text-[var(--accent)]">
                  {detail.vod_remarks}
                </span>
              )}
              {detail.vod_year && <span>{detail.vod_year}</span>}
              {detail.vod_area && <span>{detail.vod_area}</span>}
              {detail.vod_score && detail.vod_score !== "0.0" && (
                <span>评分 {detail.vod_score}</span>
              )}
            </div>
          </div>

          {detail.vod_actor && (
            <p className="text-sm">
              <span className="text-[var(--muted)]">主演：</span>
              <span className="text-white">{detail.vod_actor}</span>
            </p>
          )}

          {detail.vod_director && (
            <p className="text-sm">
              <span className="text-[var(--muted)]">导演：</span>
              <span className="text-white">{detail.vod_director}</span>
            </p>
          )}

          <p className="text-sm leading-relaxed text-[var(--muted)] line-clamp-3">
            {synopsis}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">正在播放</h2>
        {playLoading ? (
          <div className="flex aspect-video items-center justify-center rounded-lg bg-black">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          </div>
        ) : (
          <VideoPlayer src={playUrl} title={detail.vod_name} />
        )}
      </section>

      {detail.playSources && detail.playSources.length > 0 ? (
        <section>
          <EpisodeList
            sources={detail.playSources}
            activeSource={activeSource}
            activeEpisode={activeEpisode}
            onSourceChange={(source) => {
              setActiveSource(source);
              setActiveEpisode(0);
            }}
            onEpisodeChange={setActiveEpisode}
          />
        </section>
      ) : (
        <p className="text-[var(--muted)]">暂无播放资源</p>
      )}
    </div>
  );
}
