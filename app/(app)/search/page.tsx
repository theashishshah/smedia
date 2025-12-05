import Navbar from "@/app/components/Navbar";
import Topbar from "@/app/components/Topbar";
import Search from "@/app/components/Search";
import PostCard from "@/app/components/PostCard";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth-options";
import { redirect } from "next/navigation";
import { databaseConnection } from "@/libs/db";
import PostModel from "@/models/Post.model";
import { User } from "@/models/User.model";

export default async function ExplorePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await databaseConnection();

  // Fetch trending posts (sort by views + likes for simple trending logic)
  // For now just sort by views desc
  const posts = await PostModel.find()
    .sort({ views: -1, createdAt: -1 })
    .limit(20)
    .lean();

  // Get authors
  const authorIds = [...new Set(posts.map((p: any) => p.authorId))];
  const authors = await User.find({ _id: { $in: authorIds } }).lean();
  const authorMap = new Map(authors.map((a: any) => [String(a._id), a]));

  const cards = posts.map((p: any) => {
    const author = authorMap.get(p.authorId) || {};
    return {
      id: String(p._id),
      author: {
        id: author._id ? String(author._id) : undefined,
        name: author.name || "Unknown",
        handle: author.username || "@unknown",
        avatar: author.image,
        email: author.email,
      },
      createdAt: new Date(p.createdAt ?? Date.now()).toISOString(),
      content: p.text ?? "",
      image: p.imageUrl || undefined,
      stats: {
        replies: p.comments.length || 0,
        reposts: p.reposts?.length || 0,
        likes: p.likes?.length || 0,
        views: p.views || 0,
      },
      likedByMe: p.likes?.includes(session.user?.email),
      repostedByMe: p.reposts?.includes(session.user?.email),
      comments:
        p.comments?.map((c: any) => ({
          id: c.id,
          text: c.text,
          authorName: c.authorName,
          authorAvatar: c.authorAvatar,
          createdAt: new Date(c.createdAt).toISOString(),
        })) || [],
    };
  });

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
          {cards.map((p) => (
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
