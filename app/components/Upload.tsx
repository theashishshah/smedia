"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageIcon, Video, MapPin } from "lucide-react";

export default function Upload() {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [videoName, setVideoName] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLInputElement>(null);

    function onPickImage() {
        fileRef.current?.click();
    }
    function onPickVideo() {
        videoRef.current?.click();
    }

    return (
        <div className="rounded-2xl border border-zinc-800 bg-black p-4 text-white">
            <div className="flex gap-3">
                <Image
                    src="https://avatars.githubusercontent.com/u/0?v=4"
                    alt="avatar"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full"
                />
                <div className="flex-1">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What's happening?"
                        rows={3}
                        className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-base placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    />
                    {imagePreview && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-zinc-800">
                            <img
                                src={imagePreview}
                                alt="preview"
                                className="max-h-72 w-full object-cover"
                            />
                        </div>
                    )}
                    {videoName && (
                        <div className="mt-2 text-sm text-zinc-400">
                            Attached video: {videoName}
                        </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-zinc-400">
                            <button
                                onClick={onPickImage}
                                className="rounded-full p-2 hover:bg-zinc-900"
                            >
                                <ImageIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={onPickVideo}
                                className="rounded-full p-2 hover:bg-zinc-900"
                            >
                                <Video className="h-5 w-5" />
                            </button>
                            <button className="rounded-full p-2 hover:bg-zinc-900">
                                <MapPin className="h-5 w-5" />
                            </button>
                        </div>
                        <button
                            disabled={!text && !imagePreview && !videoName}
                            className="rounded-full bg-white px-5 py-2 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Post
                        </button>
                    </div>

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const reader = new FileReader();
                            reader.onload = () => setImagePreview(String(reader.result));
                            reader.readAsDataURL(f);
                        }}
                    />
                    <input
                        ref={videoRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setVideoName(f.name);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
