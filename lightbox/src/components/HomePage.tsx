"use client";

import { useCallback, useEffect, useState } from "react";
import CategoryTabs from "@/components/CategoryTabs";
import SubCategoryTabs from "@/components/SubCategoryTabs";
import VideoGrid from "@/components/VideoGrid";
import type { Category, VodListItem } from "@/lib/types";

function getChildCategories(categories: Category[], parentId: number) {
  return categories.filter((c) => c.type_pid === parentId);
}

function resolveTypeId(
  categories: Category[],
  parentId: number | null
): number | null {
  if (parentId === null) return null;

  const children = getChildCategories(categories, parentId);
  if (children.length > 0) return children[0].type_id;

  return parentId;
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeParentId, setActiveParentId] = useState<number | null>(null);
  const [activeTypeId, setActiveTypeId] = useState<number | null>(null);
  const [items, setItems] = useState<VodListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pagecount, setPagecount] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载分类失败");
    }
  }, []);

  const fetchList = useCallback(async (pg: number, typeId: number | null) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(pg) });
      if (typeId) params.set("typeId", String(typeId));
      const res = await fetch(`/api/list?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItems(data.list || []);
      setPagecount(data.pagecount || 1);
      setTotal(data.total || 0);
      setPage(data.page || pg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchList(1, activeTypeId);
  }, [activeTypeId, fetchList]);

  const handleCategoryChange = (parentId: number | null) => {
    setActiveParentId(parentId);
    setActiveTypeId(resolveTypeId(categories, parentId));
    setPage(1);
  };

  const handleSubCategoryChange = (typeId: number) => {
    setActiveTypeId(typeId);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagecount) return;
    fetchList(newPage, activeTypeId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="mb-1 text-2xl font-bold text-white sm:text-3xl">
          欢迎，Aurora
        </h1>
        <p className="text-[var(--muted)]">发现精彩影视内容</p>
      </section>

      <CategoryTabs
        categories={categories}
        activeId={activeParentId}
        onChange={handleCategoryChange}
      />

      {activeParentId !== null && (
        <SubCategoryTabs
          categories={categories}
          parentId={activeParentId}
          activeId={activeTypeId ?? 0}
          onChange={handleSubCategoryChange}
        />
      )}

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      ) : (
        <VideoGrid items={items} />
      )}

      {!loading && pagecount > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-md bg-[var(--card)] px-4 py-2 text-sm text-white disabled:opacity-40 hover:bg-[var(--card-hover)]"
          >
            上一页
          </button>
          <span className="text-sm text-[var(--muted)]">
            第 {page} / {pagecount} 页
            {total > 0 && ` · 共 ${total.toLocaleString()} 部`}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= pagecount}
            className="rounded-md bg-[var(--card)] px-4 py-2 text-sm text-white disabled:opacity-40 hover:bg-[var(--card-hover)]"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
