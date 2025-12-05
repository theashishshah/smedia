"use client";

type Post = {
    id: string;
    author: { name: string; handle: string };
    text: string;
    createdAt: string;
};

export default function Feed() {
    // Placeholder content. Replace with server-fetched data.
    const posts: Post[] = [
        {
            id: "1",
            author: { name: "S Media", handle: "smedia" },
            text: "Welcome to smedia.corp 🚀",
            createdAt: new Date().toISOString(),
        },
    ];

    return (
        <div className="divide-y divide-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {posts.map((p) => (
                <article key={p.id} className="bg-black p-4">
                    <div className="mb-1 flex items-center gap-2 text-sm text-zinc-400">
                        <div className="h-8 w-8 rounded-full bg-zinc-800" />
                        <span className="text-white font-semibold">{p.author.name}</span>
                        <span>@{p.author.handle}</span>
                        <span>
                            ·{" "}
                            {new Date(p.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                    <p className="whitespace-pre-wrap text-zinc-100">{p.text}</p>
                </article>
            ))}
        </div>
    );
}
