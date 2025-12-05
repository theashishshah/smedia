"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import EmojiButton from "./EmojiButton";
import GifPicker from "./GifPicker";
import MediaPreview from "./MediaPreview";
import { MediaItem } from "@/app/types/post";
import { useSession } from "next-auth/react";
import UserAvatar from "./UserAvatar";

const MAX_CHARS = 280;

type Props = {
  onSubmitPost?: (payload: {
    text: string;
    media: { type: "image" | "video" | "gif"; url: string }[];
  }) => Promise<void> | void;
};

export default function PostComposer({ onSubmitPost }: Props) {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pending, setPending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const remaining = MAX_CHARS - text.length;
  const canPost =
    (text.trim().length > 0 || media.length > 0) && remaining >= 0 && !pending;

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const items: MediaItem[] = [];
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const typePrefix = file.type.split("/")[0];
      if (typePrefix === "image") {
        items.push({ id: crypto.randomUUID(), type: "image", file, url });
      } else if (typePrefix === "video") {
        items.push({ id: crypto.randomUUID(), type: "video", file, url });
      }
    });
    setMedia((prev) => [...prev, ...items].slice(0, 4)); // limit to 4 items
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = e.clipboardData.files;
      if (files && files.length > 0) {
        e.preventDefault();
        addFiles(files);
      }
    },
    [addFiles]
  );

  function removeMedia(id: string) {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }

  function insertEmoji(emoji: string) {
    const el = textareaRef.current;
    if (!el) {
      setText((t) => t + emoji);
      return;
    }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + emoji.length;
      el.focus();
    });
  }

  //   function addGif(gif: { id: string; url: string }) {
  //     setMedia((prev) => [...prev, { id: crypto.randomUUID(), type: 'gif', url: gif.url }].slice(0, 4));
  //   }

  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!canPost) return;
    setPending(true);
    setSuccess(false);
    try {
      // Convert local files to FormData for upload
      const form = new FormData();
      form.append("text", text);
      media.forEach((m, idx) => {
        if (m.file) form.append("files", m.file, m.file.name);
        else form.append(`gif_${idx}`, m.url);
      });

      // Send to your API route. Replace with your endpoint.
      const res = await fetch("/api/posts", { method: "POST", body: form });
      if (!res.ok) throw new Error("Failed to post");

      // Optional callback for higher-level cache refresh
      await onSubmitPost?.({
        text,
        media: media.map((m) => ({ type: m.type, url: m.url })),
      });

      // Reset
      setText("");
      setMedia([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Could not publish post.");
    } finally {
      setPending(false);
    }
  }

  const charColor = useMemo(() => {
    if (remaining < 0) return "text-red-400";
    if (remaining <= 20) return "text-yellow-400";
    return "text-zinc-500";
  }, [remaining]);

  return (
    <div
      className="rounded-2xl border border-zinc-800 bg-black p-4"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex gap-3">
        {/* Avatar placeholder */}
        <UserAvatar
          src={session?.user?.image}
          name={session?.user?.name}
          size={40}
        />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 2000))}
            onPaste={onPaste}
            placeholder="What is happening?!"
            className="min-h-24 w-full resize-none bg-transparent text-lg text-white placeholder-zinc-500 outline-none"
            rows={3}
          />
          <MediaPreview media={media} onRemove={removeMedia} />

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Upload image/video */}
              <label className="rounded-full p-2 hover:bg-zinc-800 cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
                <span className="text-xl" aria-hidden>
                  📎
                </span>
                <span className="sr-only">Add media</span>
              </label>

              {/* Emoji */}
              <EmojiButton onPick={insertEmoji} />

              {/* GIFs */}
              {/* <GifPicker onPick={(g) => addGif({ id: g.id, url: g.url })} /> */}
            </div>

            <div className="flex items-center gap-3">
              {success && (
                <span className="text-sm font-semibold text-green-500 animate-pulse">
                  Posted!
                </span>
              )}
              <span className={`text-sm ${charColor}`}>{remaining}</span>
              <button
                type="button"
                disabled={!canPost}
                onClick={handleSubmit}
                className="rounded-full bg-white px-5 py-2.5 font-semibold text-black hover:bg-zinc-200 disabled:opacity-60"
              >
                Post
              </button>
            </div>
          </div>

          <p className="mt-2 text-xs text-zinc-500">
            Drag & drop images or videos, paste from clipboard, add emojis and
            GIFs. Up to 4 media items.
          </p>
        </div>
      </div>
    </div>
  );
}
