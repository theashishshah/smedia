"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Topbar() {
  const [q, setQ] = useState("");
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/home" className="text-xl font-black text-foreground">
          smedia
        </Link>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full rounded-full border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </header>
  );
}
