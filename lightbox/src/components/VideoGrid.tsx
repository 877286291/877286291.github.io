import type { VodListItem } from "@/lib/types";
import VideoCard from "./VideoCard";

interface VideoGridProps {
  items: VodListItem[];
  emptyMessage?: string;
}

export default function VideoGrid({
  items,
  emptyMessage = "暂无内容",
}: VideoGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-[var(--muted)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <VideoCard key={item.vod_id} item={item} />
      ))}
    </div>
  );
}
