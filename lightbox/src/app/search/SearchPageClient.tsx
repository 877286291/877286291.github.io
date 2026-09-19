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
  const [error, setError] = useState<string | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "搜索失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query) doSearch(query);
  }, [query, doSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">搜索结果</h1>
        {query && (
          <p className="mt-1 text-[var(--muted)]">
            关键词：「{query}」
            {!loading && ` · 共 ${results.length} 条`}
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
            query ? "未找到相关影片，请尝试其他关键词" : "请输入搜索关键词"
          }
        />
      )}
    </div>
  );
}
