import { rateLimitedFetch } from "./rate-limiter";
import {
  getCachedCategories,
  getCachedList,
  indexVodItems,
  matchesQuery,
  searchLocal,
  setCachedCategories,
  setCachedList,
} from "./cache";
import { parsePlaySources } from "./parser";
import type {
  Category,
  DetailResponse,
  ListResponse,
  VodDetail,
  VodListItem,
} from "./types";

const BASE_URL =
  process.env.MAOTAI_API_BASE ||
  "https://caiji.maotai999.vip/api.php/provide/vod/at/josn/";

async function fetchMaotai<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  let response: Response;
  try {
    response = await rateLimitedFetch(url.toString());
  } catch {
    throw new Error("无法连接资源服务器，请稍后重试");
  }

  if (!response.ok) {
    throw new Error(`资源服务器响应异常 (${response.status})`);
  }

  const data = (await response.json()) as T & { code?: number; msg?: string };

  if (data.code !== undefined && data.code !== 1) {
    throw new Error(data.msg || "资源服务器返回错误");
  }

  return data;
}

export async function getCategories(): Promise<Category[]> {
  const cacheKey = "categories";
  const cached = getCachedCategories(cacheKey);
  if (cached) return cached;

  const data = await fetchMaotai<ListResponse>({ ac: "list", pg: "1" });
  const categories = data.class || [];
  setCachedCategories(cacheKey, categories);
  if (data.list?.length) {
    indexVodItems(data.list);
  }
  return categories;
}

export async function getList(
  page: number,
  typeId?: number
): Promise<{
  list: VodListItem[];
  page: number;
  pagecount: number;
  total: number;
}> {
  const cacheKey = `list:${typeId ?? "all"}:${page}`;
  const cached = getCachedList(cacheKey);
  if (cached) {
    return {
      list: cached.list,
      page: cached.page,
      pagecount: cached.pagecount,
      total: cached.total,
    };
  }

  const params: Record<string, string> = {
    ac: "videolist",
    pg: String(page),
  };
  if (typeId) params.t = String(typeId);

  const data = await fetchMaotai<ListResponse>(params);
  const list = data.list || [];
  const payload = {
    list,
    page: data.page,
    pagecount: data.pagecount,
    total: data.total,
  };
  setCachedList(cacheKey, payload);

  return payload;
}

export async function getDetail(id: number): Promise<VodDetail | null> {
  const data = await fetchMaotai<DetailResponse>({
    ac: "detail",
    ids: String(id),
  });

  const vod = data.list?.[0];
  if (!vod) return null;

  const detail: VodDetail = { ...vod };
  detail.playSources = parsePlaySources(detail);
  indexVodItems([detail]);
  return detail;
}

export async function searchVods(
  query: string,
  options?: { startPage?: number; maxPages?: number; limit?: number }
): Promise<{
  results: VodListItem[];
  scannedFrom: number;
  scannedTo: number;
  hasMore: boolean;
}> {
  const q = query.trim();
  const startPage = Math.max(1, options?.startPage ?? 1);
  const maxPages = Math.min(50, options?.maxPages ?? 15);
  const limit = options?.limit ?? 50;

  if (!q) {
    return { results: [], scannedFrom: 0, scannedTo: 0, hasMore: false };
  }

  const results: VodListItem[] = [];
  const seen = new Set<number>();

  if (startPage === 1) {
    for (const item of searchLocal(q, limit)) {
      results.push(item);
      seen.add(item.vod_id);
    }
    if (results.length >= limit) {
      return {
        results,
        scannedFrom: 1,
        scannedTo: 0,
        hasMore: true,
      };
    }
  }

  let scannedTo = startPage - 1;
  let pagecount = 1;
  let hasMore = false;

  for (let page = startPage; page < startPage + maxPages; page++) {
    try {
      const data = await getList(page);
      pagecount = data.pagecount;
      scannedTo = page;
      indexVodItems(data.list);

      for (const item of data.list) {
        if (seen.has(item.vod_id)) continue;
        if (matchesQuery(item, q)) {
          results.push(item);
          seen.add(item.vod_id);
          if (results.length >= limit) break;
        }
      }

      if (results.length >= limit || page >= pagecount) break;
    } catch {
      break;
    }
  }

  hasMore = scannedTo < pagecount;

  return {
    results,
    scannedFrom: startPage,
    scannedTo,
    hasMore,
  };
}
