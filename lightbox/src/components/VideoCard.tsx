"use client";

import Link from "next/link";
import type { VodListItem } from "@/lib/types";

interface VideoCardProps {
  item: VodListItem;
}

export default function VideoCard({ item }: VideoCardProps) {
  const poster = item.vod_pic || "/placeholder.svg";

  return (
    <Link
      href={`/detail/${item.vod_id}`}
      className="group block overflow-hidden rounded-lg bg-[var(--card)] transition hover:bg-[var(--card-hover)] hover:ring-1 hover:ring-[var(--accent)]/50"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-[var(--border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt={item.vod_name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' fill='%232a2a3e'%3E%3Crect width='200' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%238b8b9e' font-size='14'%3E暂无封面%3C/text%3E%3C/svg%3E";
          }}
        />
        {item.vod_remarks && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
            {item.vod_remarks}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-white group-hover:text-[var(--accent)]">
          {item.vod_name}
        </h3>
        <p className="mt-1 text-xs text-[var(--muted)]">{item.type_name}</p>
      </div>
    </Link>
  );
}
