"use client";

import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import type { Post as FeedPost } from "@/app/data/posts";

type Props = {
  initialPosts: FeedPost[];
};

export default function Feed({ initialPosts }: Props) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts?limit=20");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPosts(data.posts);
          }
        }
      } catch (error) {
        console.error("Failed to fetch posts", error);
      }
    };

    const interval = setInterval(fetchPosts, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (posts.length === 0) {
    return <div className="p-8 text-center text-zinc-500">No posts yet.</div>;
  }

  return (
    <div className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
