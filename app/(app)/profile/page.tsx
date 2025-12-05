import Navbar from "@/app/components/Navbar";
import Topbar from "@/app/components/Topbar";
import PostCard from "@/app/components/PostCard";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth-options";
import { redirect } from "next/navigation";
import { databaseConnection } from "@/libs/db";
import { Post } from "@/models/Post.model";
import type { Post as FeedPost } from "@/app/data/posts";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await databaseConnection();

  const posts = await Post.find({ authorEmail: session.user?.email })
    .sort({ createdAt: -1 })
    .lean();

  const user = {
    name: session.user?.name || "User",
    username: session.user?.email
      ? `@${session.user.email.split("@")[0]}`
      : "@user",
    bio: "Building smedia | Web3 + React enthusiast 🚀",
  };

  const cards: FeedPost[] = posts.map((p: any) => ({
    id: String(p._id),
    author: {
      name: user.name,
      handle: user.username,
      avatar: (session.user?.image as string) || "/avatar-placeholder.png",
      email: session.user?.email || "",
    },
    createdAt: new Date(p.createdAt ?? Date.now()).toISOString(),
    content: p.text ?? "",
    image: p.imageUrl || undefined,
    stats: {
      replies: 0,
      reposts: 0,
      likes: 0,
      views: 0,
    },
  }));

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
          {cards.length > 0 ? (
            cards.map((p) => <PostCard key={p.id} post={p} />)
          ) : (
            <div className="p-8 text-center text-zinc-500">No posts yet.</div>
          )}
        </div>
      </section>
    </main>
  );
}
