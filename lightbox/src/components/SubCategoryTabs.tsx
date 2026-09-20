"use client";

import type { Category } from "@/lib/types";

interface SubCategoryTabsProps {
  categories: Category[];
  parentId: number;
  activeId: number;
  onChange: (typeId: number) => void;
}

export default function SubCategoryTabs({
  categories,
  parentId,
  activeId,
  onChange,
}: SubCategoryTabsProps) {
  const subCategories = categories.filter((c) => c.type_pid === parentId);

  if (subCategories.length === 0) return null;

  return (
    <div className="scrollbar-hide touch-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-0 sm:px-0">
      {subCategories.map((cat) => (
        <button
          key={cat.type_id}
          onClick={() => onChange(cat.type_id)}
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition sm:py-1 ${
            activeId === cat.type_id
              ? "bg-[var(--accent)]/20 text-[var(--accent)] ring-1 ring-[var(--accent)]"
              : "bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-white"
          }`}
        >
          {cat.type_name}
        </button>
      ))}
    </div>
  );
}
