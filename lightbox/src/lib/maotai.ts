import { rateLimitedFetch } from "./rate-limiter";
import {
  getCachedCategories,
  getCachedList,
  indexVodItems,
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
    return { list: cached, page, pagecount: 0, total: cached.length };
  }

  const params: Record<string, string> = {
    ac: "list",
    pg: String(page),
  };
  if (typeId) params.t = String(typeId);

  const data = await fetchMaotai<ListResponse>(params);
  const list = data.list || [];
  setCachedList(cacheKey, list);

  return {
    list,
    page: data.page,
    pagecount: data.pagecount,
    total: data.total,
  };
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

export async function searchVods(query: string): Promise<VodListItem[]> {
  let results = searchLocal(query);

  if (results.length < 10 && query.trim()) {
    for (let page = 1; page <= 3; page++) {
      try {
        const { list } = await getList(page);
        indexVodItems(list);
      } catch {
        break;
      }
    }
    results = searchLocal(query);
  }

  return results;
}
