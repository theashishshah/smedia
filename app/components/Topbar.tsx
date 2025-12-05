"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Topbar() {
    const [q, setQ] = useState("");
    return (
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-black/70 backdrop-blur md:hidden">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
                <Link href="/home" className="text-xl font-black text-white">
                    smedia
                </Link>
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search"
                        className="w-full rounded-full border border-zinc-800 bg-zinc-950 py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    />
                </div>
            </div>
        </header>
    );
}
