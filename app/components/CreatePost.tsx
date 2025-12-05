// app/components/CreatePost.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/app/components/FileUpload"; // your hook provider

type UploadResult = { url: string; fileId: string };

export default function CreatePost({ onCreated }: { onCreated?: (post: any) => void }) {
    const { status } = useSession();
    const [text, setText] = useState("");
    const [image, setImage] = useState<{ url: string; fileId: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { progress, uploading, error, startUpload, abortUpload } = FileUpload();

    const pickFile = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const res = (await startUpload(file)) as UploadResult | undefined;
            if (res?.url) setImage({ url: res.url, fileId: res.fileId });
        } catch (e) {
            console.error(e);
        }
    };

    const submitPost = async () => {
        if (status !== "authenticated") return;

        const payload: any = { text: text.trim() };
        if (image?.url) {
            payload.imageUrl = image.url;
            if (image.fileId) payload.imageFileId = image.fileId;
        }
        if (!payload.text && !payload.imageUrl) return; // nothing to post

        const res = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            const data = await res.json();
            setText("");
            setImage(null);
            onCreated?.(data.post);
        } else {
            console.error(await res.json());
        }
    };

    return (
        <div className="rounded-2xl border border-zinc-800 p-4 bg-zinc-950/40 space-y-3">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="What's happening?"
                className="w-full resize-none rounded-md border border-zinc-800 bg-black px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            />

            {/* Image preview */}
            {image?.url && (
                <div className="relative h-56 w-full overflow-hidden rounded-md border border-zinc-800">
                    <Image
                        src={image.url}
                        alt="upload"
                        fill
                        sizes="100vw"
                        className="object-cover"
                    />
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={pickFile}
                        className="rounded-md border border-zinc-700 px-3 py-2 text-white hover:bg-zinc-900"
                        disabled={uploading}
                    >
                        {image ? "Change image" : "Add image"}
                    </button>

                    {image && (
                        <button
                            type="button"
                            onClick={() => setImage(null)}
                            className="rounded-md border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-zinc-900"
                            disabled={uploading}
                        >
                            Remove
                        </button>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                <Button onClick={submitPost} disabled={uploading || (!text.trim() && !image)}>
                    Post
                </Button>
            </div>

            {uploading && <Progress value={progress} max={100} className="h-2" />}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <p className="text-xs text-zinc-500">{text.length}/2000</p>
        </div>
    );
}
