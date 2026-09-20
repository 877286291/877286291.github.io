"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-base font-bold text-white sm:h-9 sm:w-9 sm:text-lg">
            光
          </div>
          <span className="hidden text-xl font-bold tracking-wide md:inline">
            光匣
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex min-w-0 flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索影片、演员..."
              className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] py-2.5 pl-4 pr-[4.25rem] text-base text-white placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] sm:py-2 sm:pr-16 sm:text-sm"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 min-h-[2rem] min-w-[2.75rem] -translate-y-1/2 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent-hover)] sm:min-h-0 sm:min-w-0 sm:py-1"
            >
              搜索
            </button>
          </div>
        </form>

        <Link
          href="/"
          className="hidden shrink-0 text-sm text-[var(--muted)] hover:text-white sm:block"
        >
          首页
        </Link>
      </div>
    </header>
  );
}
