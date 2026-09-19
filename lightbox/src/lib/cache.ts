import type { Category, VodListItem } from "./types";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const TTL_MS = 10 * 60 * 1000;

const categoriesCache = new Map<string, CacheEntry<Category[]>>();
const listCache = new Map<string, CacheEntry<VodListItem[]>>();
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

export function getCachedList(key: string): VodListItem[] | null {
  return getCached(listCache, key);
}

export function setCachedList(key: string, data: VodListItem[]): void {
  setCached(listCache, key, data);
  for (const item of data) {
    searchIndex.set(item.vod_id, item);
  }
}

export function indexVodItems(items: VodListItem[]): void {
  for (const item of items) {
    searchIndex.set(item.vod_id, item);
  }
}

export function searchLocal(query: string, limit = 50): VodListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: VodListItem[] = [];
  for (const item of Array.from(searchIndex.values())) {
    const name = item.vod_name?.toLowerCase() || "";
    const actor = item.vod_actor?.toLowerCase() || "";
    const type = item.type_name?.toLowerCase() || "";
    if (name.includes(q) || actor.includes(q) || type.includes(q)) {
      results.push(item);
      if (results.length >= limit) break;
    }
  }
  return results;
}

export function getSearchIndexSize(): number {
  return searchIndex.size;
}
