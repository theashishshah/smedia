"use client";

import { useEffect, useRef, useState } from "react";

type Gif = { id: string; url: string; preview: string };

type Props = {
  onPick: (gif: Gif) => void;
  fetchGifs?: (q: string) => Promise<Gif[]>; // optional override to connect to GIPHY/Tenor
};

async function defaultFetchGifs(q: string): Promise<Gif[]> {
  // Placeholder demo results. Replace with real API (e.g., Tenor/GIPHY) in production.
  // You can fetch from your backend to keep keys safe.
  const demo = [
    {
      id: "1",
      url: "https://media.tenor.com/images/30d7.gif",
      preview: "https://media.tenor.com/images/30d7.gif",
    },
    {
      id: "2",
      url: "https://media.tenor.com/images/aa21.gif",
      preview: "https://media.tenor.com/images/aa21.gif",
    },
    {
      id: "3",
      url: "https://media.tenor.com/images/bb12.gif",
      preview: "https://media.tenor.com/images/bb12.gif",
    },
  ];
  // Return a few filtered by q just to show UX
  return demo.filter((g) => g.id.includes(q.trim()) || q.trim() === "");
}

export default function GifPicker({
  onPick,
  fetchGifs = defaultFetchGifs,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Gif[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetchGifs(q);
      if (active) setItems(res.slice(0, 12));
    })();
    return () => {
      active = false;
    };
  }, [q, fetchGifs]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Insert GIF"
        className="rounded-full p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-xl">GIF</span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-border bg-popover shadow-xl">
          <div className="p-2 border-b border-border">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search GIFs"
              className="w-full rounded-lg bg-input px-3 py-2 text-sm text-foreground outline-none border border-input focus:border-ring"
            />
          </div>
          <div className="grid max-h-72 grid-cols-3 gap-1 overflow-auto p-2">
            {items.map((g) => (
              <button
                key={g.id}
                type="button"
                className="group relative"
                onClick={() => {
                  onPick(g);
                  setOpen(false);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.preview}
                  alt="gif"
                  className="h-24 w-full object-cover rounded-lg hover:opacity-80 transition-opacity"
                />
              </button>
            ))}
            {items.length === 0 && (
              <div className="col-span-3 p-4 text-center text-sm text-muted-foreground">
                No GIFs
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
