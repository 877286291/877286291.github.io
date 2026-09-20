import type { Category, VodListItem } from "./types";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const TTL_MS = 10 * 60 * 1000;

const categoriesCache = new Map<string, CacheEntry<Category[]>>();

export interface ListCacheData {
  list: VodListItem[];
  page: number;
  pagecount: number;
  total: number;
}

const listCache = new Map<string, CacheEntry<ListCacheData>>();
const searchIndex = new Map<number, VodListItem>();

function getCached<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = map.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    map.delete(key);
    return null;
  }
  return entry.data;
}

function setCached<T>(map: Map<string, CacheEntry<T>>, key: string, data: T): void {
  map.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

export function getCachedCategories(key: string): Category[] | null {
  return getCached(categoriesCache, key);
}

export function setCachedCategories(key: string, data: Category[]): void {
  setCached(categoriesCache, key, data);
}

export function getCachedList(key: string): ListCacheData | null {
  return getCached(listCache, key);
}

export function setCachedList(key: string, data: ListCacheData): void {
  setCached(listCache, key, data);
  for (const item of data.list) {
    searchIndex.set(item.vod_id, item);
  }
}

export function indexVodItems(items: VodListItem[]): void {
  for (const item of items) {
    searchIndex.set(item.vod_id, item);
  }
}

export function matchesQuery(item: VodListItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;

  const fields = [
    item.vod_name,
    item.vod_actor,
    item.type_name,
    item.vod_blurb,
  ];
  return fields.some((field) => field?.toLowerCase().includes(q));
}

export function searchLocal(query: string, limit = 50): VodListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: VodListItem[] = [];
  for (const item of Array.from(searchIndex.values())) {
    if (matchesQuery(item, q)) {
      results.push(item);
      if (results.length >= limit) break;
    }
  }
  return results;
}

export function getSearchIndexSize(): number {
  return searchIndex.size;
}
