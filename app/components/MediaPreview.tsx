"use client";

import { MediaItem } from "@/app/types/post";

type Props = {
    media: MediaItem[];
    onRemove: (id: string) => void;
};

export default function MediaPreview({ media, onRemove }: Props) {
    if (media.length === 0) return null;

    return (
        <div className="mt-3 grid grid-cols-2 gap-2">
            {media.map((m) => (
                <div
                    key={m.id}
                    className="group relative overflow-hidden rounded-2xl border border-zinc-800"
                >
                    {m.type === "image" && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt="upload" className="h-56 w-full object-cover" />
                    )}
                    {m.type === "video" && (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <video className="h-56 w-full object-cover" controls src={m.url} />
                    )}
                    {m.type === "gif" && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt="gif" className="h-56 w-full object-cover" />
                    )}
                    <button
                        type="button"
                        onClick={() => onRemove(m.id)}
                        className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 border border-zinc-700"
                        aria-label="Remove media"
                    >
                        Remove
                    </button>
                </div>
            ))}
        </div>
    );
}
