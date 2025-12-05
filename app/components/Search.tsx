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
        <div className="rounded-2xl border border-zinc-800 p-4">
            <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                <input
                    value={q}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search"
                    className="w-full rounded-full border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                />
            </div>
            {!!q && (
                <ul className="mt-3 divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800">
                    {results.length === 0 && (
                        <li className="bg-black p-3 text-zinc-500">No results</li>
                    )}
                    {results.map((r) => (
                        <li key={r} className="bg-black p-3 text-zinc-300 hover:bg-zinc-900">
                            {r}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
