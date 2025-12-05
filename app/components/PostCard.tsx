"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import useIsClient from "@/app/hooks/useIsClient";
import {
  MessageSquare,
  Repeat2,
  Heart,
  BarChart3,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Post } from "@/app/data/posts";
import { useEffect, useState } from "react";
import CommentBox from "./CommentBox";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserAvatar from "./UserAvatar";

type Props = { post: Post };

const heartVariants = {
  initial: { scale: 1 },
  liked: { scale: [1, 1.25, 1], transition: { duration: 0.25 } },
};
const repeatVariants = {
  initial: { rotate: 0 },
  boosted: { rotate: [0, 20, 0], transition: { duration: 0.25 } },
};

function formatTimeUTC(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm} UTC`;
}

export default function PostCard({ post }: Props) {
  const isClient = useIsClient();
  const { data: session } = useSession();
  const router = useRouter();

  const isOwner = session?.user?.email === post.author.email;
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [openComments, setOpenComments] = useState(false);

  // Interaction State
  const [likes, setLikes] = useState(post.stats.likes);
  const [liked, setLiked] = useState(post.likedByMe ?? false);
  const [reposts, setReposts] = useState(post.stats.reposts);
  const [reposted, setReposted] = useState(post.repostedByMe ?? false);
  const [comments, setComments] = useState(post.comments ?? []);

  // Increment view on mount
  useEffect(() => {
    // Fire and forget view increment
    fetch(`/api/posts/${post.id}/view`, { method: "POST" }).catch(
      console.error
    );
  }, [post.id]);

  const onToggleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => Math.max(0, prev + (newLiked ? 1 : -1)));

    try {
      await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      router.refresh();
    } catch (e) {
      console.error(e);
      setLiked(!newLiked);
      setLikes((prev) => Math.max(0, prev + (!newLiked ? 1 : -1)));
    }
  };

  const onToggleRepost = async () => {
    const newReposted = !reposted;
    setReposted(newReposted);
    setReposts((prev) => Math.max(0, prev + (newReposted ? 1 : -1)));

    try {
      await fetch(`/api/posts/${post.id}/repost`, { method: "POST" });
      router.refresh();
    } catch (e) {
      console.error(e);
      setReposted(!newReposted);
      setReposts((prev) => Math.max(0, prev + (!newReposted ? 1 : -1)));
    }
  };

  const onAddComment = async (text: string) => {
    try {
      const res = await fetch(`/api/posts/${post.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [data.comment, ...prev]);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editedText }),
      });
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const replyCount = (post.stats.replies || 0) + comments.length;

  return (
    <article className="bg-background p-4 text-foreground border-b border-border">
      <div className="mb-2 flex items-start gap-3">
        <UserAvatar
          src={post.author.avatar}
          name={post.author.name}
          size={40}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-white">
                {post.author.name}
              </span>
              <span className="truncate text-zinc-500">
                {post.author.handle} · {formatTimeUTC(post.createdAt)}
              </span>
            </div>
            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-zinc-500 hover:text-white"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-zinc-500 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 p-2 text-white focus:outline-none focus:ring-1 focus:ring-zinc-500"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex items-center gap-1 rounded bg-foreground px-3 py-1 text-xs font-bold text-background hover:bg-foreground/90 transition-colors"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedText(post.content);
                  }}
                  className="rounded border border-input px-3 py-1 text-xs font-bold text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-[15px] leading-6">
              {post.content}
            </p>
          )}
        </div>
      </div>

      {post.image && (
        <div className="ml-13 mt-3 overflow-hidden rounded-xl border border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image} alt="post" className="w-full object-cover" />
        </div>
      )}

      {/* Action row */}
      <div className="ml-13 mt-3 grid grid-cols-4 text-sm text-zinc-500">
        {/* COMMENTS (toggle panel) */}
        <button
          onClick={() => setOpenComments((o) => !o)}
          className="group flex items-center gap-2"
          aria-expanded={openComments}
        >
          <MessageSquare className="h-4 w-4 group-hover:text-sky-400" />
          <AnimatePresence mode="popLayout">
            <motion.span
              key={replyCount}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.18 }}
              suppressHydrationWarning
            >
              {replyCount}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* REPOST */}
        <button
          onClick={onToggleRepost}
          className="group flex items-center gap-2"
          aria-pressed={reposted}
          title={reposted ? "Undo repost" : "Repost"}
        >
          <motion.span
            variants={repeatVariants}
            animate={reposted ? "boosted" : "initial"}
            className="inline-flex"
          >
            <Repeat2
              className={`h-4 w-4 transition-colors ${
                reposted ? "text-emerald-400" : "text-zinc-500"
              } group-hover:text-emerald-400`}
            />
          </motion.span>

          <AnimatePresence mode="popLayout">
            <motion.span
              key={reposts}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className={reposted ? "text-emerald-400" : ""}
              suppressHydrationWarning
            >
              {reposts}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* LIKE */}
        <button
          onClick={onToggleLike}
          className="group flex items-center gap-2"
          aria-pressed={liked}
        >
          <motion.span
            variants={heartVariants}
            animate={liked ? "liked" : "initial"}
            className="inline-flex"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                liked ? "fill-red-500 text-red-500" : "text-zinc-500"
              } group-hover:text-red-400`}
            />
          </motion.span>

          {/* Show count only if owner */}
          {isOwner && (
            <AnimatePresence mode="popLayout">
              <motion.span
                key={likes}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -6, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={liked ? "text-red-400" : ""}
                suppressHydrationWarning
              >
                {likes}
              </motion.span>
            </AnimatePresence>
          )}
        </button>

        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> {post.stats.views}
        </div>
      </div>

      {/* Comments panel */}
      <AnimatePresence initial={false}>
        {openComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-13 mt-3 space-y-3 overflow-hidden"
          >
            <CommentBox onSubmit={onAddComment} autoFocus />
            <ul className="space-y-3">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-200"
                >
                  <div className="mb-1 text-xs text-zinc-500">
                    <span className="font-bold text-zinc-400 mr-2">
                      {c.authorName}
                    </span>
                    {formatTimeUTC(c.createdAt)}
                  </div>
                  <div className="whitespace-pre-wrap">{c.text}</div>
                </li>
              ))}
              {comments.length === 0 && (
                <div className="text-sm text-zinc-500">
                  Be the first to reply.
                </div>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
