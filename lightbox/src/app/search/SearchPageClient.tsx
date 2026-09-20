"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VideoGrid from "@/components/VideoGrid";
import type { VodListItem } from "@/lib/types";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<VodListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextStartPage, setNextStartPage] = useState(1);
  const [scannedTo, setScannedTo] = useState(0);

  const doSearch = useCallback(
    async (q: string, startPage = 1, append = false) => {
      if (!q.trim()) return;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q,
          startPage: String(startPage),
          maxPages: "15",
        });
        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setResults((prev) => {
          if (!append) return data.results || [];
          const seen = new Set(prev.map((item) => item.vod_id));
          const merged = [...prev];
          for (const item of data.results || []) {
            if (!seen.has(item.vod_id)) {
              merged.push(item);
              seen.add(item.vod_id);
            }
          }
          return merged;
        });
        setHasMore(Boolean(data.hasMore));
        setScannedTo(data.scannedTo || 0);
        setNextStartPage((data.scannedTo || startPage) + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "搜索失败");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    if (query) {
      setResults([]);
      doSearch(query, 1, false);
    }
  }, [query, doSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">搜索结果</h1>
        {query && (
          <p className="mt-1 text-[var(--muted)]">
            关键词：「{query}」
            {!loading && ` · 共 ${results.length} 条`}
            {scannedTo > 0 && !loading && ` · 已扫描 ${scannedTo} 页片库`}
          </p>
        )}
        {query && !loading && (
          <p className="mt-1 text-xs text-[var(--muted)]">
            上游 API 已禁用关键词搜索，光匣在本地片库中匹配；可点「加载更多」继续扫描
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      ) : (
        <VideoGrid
          items={results}
          emptyMessage={
            query ? "未找到相关影片，可尝试加载更多或换关键词" : "请输入搜索关键词"
          }
        />
      )}

      {!loading && hasMore && query && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => doSearch(query, nextStartPage, true)}
            disabled={loadingMore}
            className="rounded-md bg-[var(--card)] px-6 py-2 text-sm text-white hover:bg-[var(--card-hover)] disabled:opacity-50"
          >
            {loadingMore ? "扫描中..." : "加载更多结果"}
          </button>
        </div>
      )}
    </div>
  );
}
