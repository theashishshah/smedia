"use client";

import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const all = useMemo(
    () => [
      "TypeScript",
      "Next.js",
      "Tailwind",
      "React Server Components",
      "Lucide Icons",
      "Edge runtime",
      "Build in public",
      "AI + product",
    ],
    []
  );

  function onChange(v: string) {
    setQ(v);
    const term = v.toLowerCase();
    setResults(all.filter((x) => x.toLowerCase().includes(term)).slice(0, 6));
  }

  return (
    <div className="rounded-2xl border border-input p-4">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search"
          className="w-full rounded-full border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {!!q && (
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {results.length === 0 && (
            <li className="bg-background p-3 text-muted-foreground">
              No results
            </li>
          )}
          {results.map((r) => (
            <li
              key={r}
              className="bg-background p-3 text-foreground hover:bg-accent cursor-pointer"
            >
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
