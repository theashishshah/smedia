import Navbar from "@/app/components/Navbar";
import Topbar from "@/app/components/Topbar";
import PostCard from "@/app/components/PostCard";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth-options";
import { redirect } from "next/navigation";
import { databaseConnection } from "@/libs/db";
import { Post } from "@/models/Post.model";
import { User } from "@/models/User.model";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await databaseConnection();

  // Fetch posts by this user that have reports > 0
  const posts = await Post.find({
    authorEmail: session.user?.email,
    reports: { $gt: 0 },
  })
    .sort({ reports: -1, createdAt: -1 })
    .lean();

  // Fetch user details for the posts (which is just 'me', but for consistency with PostCard)
  const dbUser = (await User.findOne({
    email: session.user?.email,
  }).lean()) as any;

  const user = {
    _id: dbUser?._id?.toString() || "",
    name: dbUser?.name || session.user?.name || "User",
    username: dbUser?.username || "@user",
    image: dbUser?.image || session.user?.image || undefined,
    email: session.user?.email || "",
  };

  const cards = posts.map((p: any) => ({
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
      replies: p.comments?.length || 0,
      reposts: p.reposts?.length || 0,
      likes: p.likes?.length || 0,
      views: p.views || 0,
    },
    likedByMe: p.likes?.includes(session.user?.email),
    repostedByMe: p.reposts?.includes(session.user?.email),
    // Pass report count to display? PostCard doesn't support showing it yet,
    // but we can wrap it or show a header.
    // For now, listing them is the main goal.
    reportCount: p.reports || 0,
  }));

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr]">
      <Navbar />

      <section className="space-y-6">
        <Topbar />

        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Post Reports
              </h1>
              <p className="text-muted-foreground mt-1">
                Posts are automatically removed after receiving 5 reports.
                Monitor your content status here.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {cards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-border">
              <p>Good job! None of your posts have been reported.</p>
            </div>
          ) : (
            cards.map((p) => (
              <div key={p.id} className="relative group">
                <div className="absolute top-4 right-4 z-10 bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                  <AlertTriangle className="h-3 w-3" />
                  {/* Typescript hack/extension: we added reportCount to card map but PostCard expects Post type.
                                        We can just show it here overlaying or above. */}
                  {(p as any).reportCount} / 5 Reports
                </div>
                <div className="border border-border rounded-xl overflow-hidden hover:border-red-500/30 transition-colors">
                  <PostCard post={p} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
