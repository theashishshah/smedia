import Navbar from "@/app/components/Navbar";
import Topbar from "@/app/components/Topbar";
import PostCard from "@/app/components/PostCard";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth-options";
import { redirect } from "next/navigation";
import { databaseConnection } from "@/libs/db";
import { Post } from "@/models/Post.model";
import type { Post as FeedPost } from "@/app/data/posts";
import { User } from "@/models/User.model";
import ProfileHeader from "@/app/components/ProfileHeader";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await databaseConnection();

  const [posts, dbUser] = await Promise.all([
    Post.find({ authorEmail: session.user?.email })
      .sort({ createdAt: -1 })
      .lean(),
    User.findOne({ email: session.user?.email }).lean(),
  ]);

  const user = {
    name: dbUser?.name || session.user?.name || "User",
    username:
      dbUser?.username ||
      (session.user?.email ? `@${session.user.email.split("@")[0]}` : "@user"),
    bio: dbUser?.bio || "",
    image: dbUser?.image || session.user?.image || undefined,
    email: session.user?.email || "",
  };

  const cards: FeedPost[] = posts.map((p: any) => ({
    id: String(p._id),
    author: {
      name: user.name,
      handle: user.username,
      avatar: user.image || "/avatar-placeholder.png",
      email: session.user?.email || "",
    },
    createdAt: new Date(p.createdAt ?? Date.now()).toISOString(),
    content: p.text ?? "",
    image: p.imageUrl || undefined,
    stats: {
      replies: 0,
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
  }));

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr]">
      <Navbar />

      <section className="space-y-6">
        <Topbar />

        <ProfileHeader user={user} isOwnProfile={true} />
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
