// app/home/page.tsx (your file)
import Navbar from "@/app/components/Navbar";
import Topbar from "@/app/components/Topbar";
import Upload from "@/app/components/Upload"; // keep if you want
import Search from "@/app/components/Search";
import { demoPosts } from "@/app/data/posts";
import PostCard from "@/app/components//PostCard";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth-options";
import { redirect } from "next/navigation";
import { databaseConnection } from "@/libs/db";
import { Post } from "@/models/Post.model";
import CreatePost from "@/app/components/CreatePost";
import type { Post as FeedPost } from "@/app/data/posts";

import TimerStarter from "@/app/components/TimerStarter";

import { User } from "@/models/User.model";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  await databaseConnection();
  const posts = await Post.find().sort({ createdAt: -1 }).lean();

  // Fetch authors
  const emails = [
    ...new Set(posts.map((p: any) => p.authorEmail).filter(Boolean)),
  ];
  const users = await User.find({ email: { $in: emails } }).lean();
  const userMap = new Map(users.map((u: any) => [u.email, u]));

  const cards: FeedPost[] = posts.map((p: any) => {
    const author = userMap.get(p.authorEmail);
    const fallbackName = p.authorName || "Unknown User";
    const fallbackHandle = p.authorEmail
      ? `@${p.authorEmail.split("@")[0]}`
      : "@unknown";

    return {
      id: String(p._id),
      author: {
        name: author?.name || fallbackName,
        handle: author?.email
          ? `@${author.email.split("@")[0]}`
          : fallbackHandle,
        avatar: author?.image || p.authorAvatar || "/avatar-placeholder.png",
        email: p.authorEmail,
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
    };
  });

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr]">
      <TimerStarter />
      <Navbar />

      <section className="space-y-6">
        <Topbar />

        {/* Composer */}
        <CreatePost
          onCreated={
            undefined /* client-only; if you want instant prepend, move feed client-side */
          }
        />

        {/* Real posts on top */}
        <div className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800">
          {cards.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}

          {/* Demo posts below */}
          {demoPosts.map((p) => (
            <PostCard key={`demo-${p.id}`} post={p} />
          ))}
        </div>
      </section>

      <aside className="hidden md:block">
        <Search />
        <div className="mt-6 rounded-2xl border border-zinc-800 p-4 text-zinc-300">
          <h3 className="mb-2 text-lg font-bold text-white">Trends for you</h3>
          <ul className="space-y-3 text-sm">
            <li className="text-zinc-400">#NextJSConf</li>
            <li className="text-zinc-400">#React19</li>
            <li className="text-zinc-400">#BuildInPublic</li>
          </ul>
        </div>
      </aside>
    </main>
  );
}

// import Navbar from "@/app/components/Navbar";
// import Topbar from "@/app/components/Topbar";
// import Upload from "@/app/components/Upload";
// import Search from "@/app/components/Search";
// import { demoPosts } from "@/app/data/posts";
// import PostCard from "@/app/components//PostCard";
// import { getServerSession } from "next-auth";
// import authOptions from "@/libs/auth-options";
// import { redirect } from "next/navigation";

// export default async function HomePage() {
//     const session = await getServerSession(authOptions);
//     if (!session) redirect("/login");
//     return (
//         <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr]">
//             <Navbar />

//             <section className="space-y-6">
//                 <Topbar />
//                 <Upload />

//                 <div className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800">
//                     {demoPosts.map((p) => (
//                         <PostCard key={p.id} post={p} />
//                     ))}
//                 </div>
//             </section>

//             <aside className="hidden md:block">
//                 <Search />
//                 <div className="mt-6 rounded-2xl border border-zinc-800 p-4 text-zinc-300">
//                     <h3 className="mb-2 text-lg font-bold text-white">Trends for you</h3>
//                     <ul className="space-y-3 text-sm">
//                         <li className="text-zinc-400">#NextJSConf</li>
//                         <li className="text-zinc-400">#React19</li>
//                         <li className="text-zinc-400">#BuildInPublic</li>
//                     </ul>
//                 </div>
//             </aside>
//         </main>
//     );
// }
