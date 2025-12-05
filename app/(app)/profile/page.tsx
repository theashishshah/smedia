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
import Link from "next/link";
import { Types } from "mongoose";

type CheckResult = {
  isOwnProfile: boolean;
  profileUser: any;
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await databaseConnection();

  const { userId } = await searchParams;
  let dbUser: any = null;
  let isOwnProfile = false;

  // Determine target user
  if (userId && typeof userId === "string") {
    // Fetch user by ID
    try {
      dbUser = await User.findById(userId).lean();
    } catch (e) {
      // Invalid ID format or not found
      dbUser = null;
    }

    // Check if it's me
    if (dbUser && session.user?.email === dbUser.email) {
      isOwnProfile = true;
    }
  } else {
    // Default to my profile
    dbUser = await User.findOne({ email: session.user?.email }).lean();
    isOwnProfile = true;
  }

  if (!dbUser) {
    return (
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr]">
        <Navbar />
        <div className="text-center text-zinc-500 py-20">User not found</div>
      </main>
    );
  }

  const [posts] = await Promise.all([
    Post.find({ authorEmail: dbUser.email }).sort({ createdAt: -1 }).lean(),
  ]);

  const user = {
    _id: dbUser._id.toString(),
    name: dbUser.name || "User",
    username: dbUser.username || "@user",
    bio: dbUser.bio || "",
    image: dbUser.image || undefined,
    email: dbUser.email || "",
  };

  const cards: FeedPost[] = posts.map((p: any) => ({
    id: String(p._id),
    author: {
      id: user._id,
      name: user.name,
      handle: user.username,
      avatar: user.image || "/avatar-placeholder.png",
      email: user.email,
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

        <ProfileHeader user={user} isOwnProfile={isOwnProfile} />

        {!isOwnProfile && (
          <div className="flex items-center gap-2 px-1">
            <Link
              href={`/messages?userId=${user._id}`}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Message
            </Link>
            <Link
              href={`/messages/persona/${user._id}`}
              className="rounded-full border border-purple-500/50 px-4 py-1.5 text-sm font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors"
            >
              Chat with Persona
            </Link>
          </div>
        )}

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
