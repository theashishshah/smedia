import Navbar from "@/app/components/Navbar";
import Topbar from "@/app/components/Topbar";
import Upload from "@/app/components/Upload";
import Search from "@/app/components/Search";
import { demoPosts } from "@/app/data/posts";
import PostCard from "@/app/components//PostCard";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth-options";
import { redirect } from "next/navigation";

export default async function ExplorePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    return (
        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr]">
            <Navbar />

            <section className="space-y-6">
                <Topbar />
                <div className="rounded-2xl border border-zinc-800 p-4 text-zinc-300">
                    <h2 className="text-lg font-bold text-white mb-4">Trending Topics</h2>
                    <ul className="space-y-2 text-sm text-zinc-400">
                        <li>#Web3</li>
                        <li>#NextJSConf</li>
                        <li>#OpenSource</li>
                        <li>#AIRevolution</li>
                    </ul>
                </div>

                <div className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800">
                    {demoPosts.map((p) => (
                        <PostCard key={p.id} post={p} />
                    ))}
                </div>
            </section>

            <aside className="hidden md:block">
                <Search />
            </aside>
        </main>
    );
}
