import Navbar from "@/app/components/Navbar";
import Topbar from "@/app/components/Topbar";
import { demoPosts } from "@/app/data/posts";
import PostCard from "@/app/components//PostCard";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth-options";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    const user = {
        name: "Ashish Shah",
        username: "@theashishshahhh",
        bio: "Building smedia | Web3 + React enthusiast 🚀",
    };

    return (
        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr]">
            <Navbar />

            <section className="space-y-6">
                <Topbar />
                <div className="rounded-2xl border border-zinc-800 p-6 text-zinc-300">
                    <h2 className="text-xl font-bold text-white">{user.name}</h2>
                    <p className="text-zinc-500 mb-2">{user.username}</p>
                    <p>{user.bio}</p>
                </div>

                <div className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800">
                    {demoPosts.slice(0, 3).map((p) => (
                        <PostCard key={p.id} post={p} />
                    ))}
                </div>
            </section>
        </main>
    );
}
