import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

function SearchFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageClient />
    </Suspense>
  );
}
