export interface Category {
  type_id: number;
  type_pid: number;
  type_name: string;
}

export interface VodListItem {
  vod_id: number;
  vod_name: string;
  type_id: number;
  type_name: string;
  vod_remarks: string;
  vod_pic?: string;
  vod_play_from?: string;
  vod_time?: string;
  vod_actor?: string;
  vod_blurb?: string;
}

export interface Episode {
  title: string;
  url: string;
}

export interface PlaySource {
  source: string;
  episodes: Episode[];
}

export interface VodDetail extends VodListItem {
  vod_sub?: string;
  vod_actor?: string;
  vod_director?: string;
  vod_content?: string;
  vod_blurb?: string;
  vod_area?: string;
  vod_lang?: string;
  vod_year?: string;
  vod_score?: string;
  vod_play_url?: string;
  playSources?: PlaySource[];
}

export interface ListResponse {
  code: number;
  msg: string;
  page: number;
  pagecount: number;
  limit: number;
  total: number;
  list: VodListItem[];
  class?: Category[];
}

export interface DetailResponse {
  code: number;
  msg: string;
  list: VodDetail[];
}

export interface ApiError {
  error: string;
  code?: number;
}
