"use client";

import type { Category } from "@/lib/types";

interface CategoryTabsProps {
  categories: Category[];
  activeId: number | null;
  onChange: (typeId: number | null) => void;
}

export default function CategoryTabs({
  categories,
  activeId,
  onChange,
}: CategoryTabsProps) {
  const topCategories = categories.filter((c) => c.type_pid === 0);

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
          activeId === null
            ? "bg-[var(--accent)] text-white"
            : "bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-white"
        }`}
      >
        全部
      </button>
      {topCategories.map((cat) => (
        <button
          key={cat.type_id}
          onClick={() => onChange(cat.type_id)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
            activeId === cat.type_id
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-white"
          }`}
        >
          {cat.type_name}
        </button>
      ))}
    </div>
  );
}
