"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  user: {
    name: string;
    username: string;
    bio: string;
  };
  isOpen: boolean;
  onClose: () => void;
};

export default function EditProfileModal({ user, isOpen, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username.replace("@", ""));
  const [bio, setBio] = useState(user.bio);
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Simple client-side upload helper reusing logic from FileUpload component
  // or we can import the hook if it's exportable and usable here.
  // Given FileUpload is a component/hook mix, let's just implement the upload function directly
  // or use the hook if possible. `FileUpload` in `FileUpload.tsx` is a hook function.
  // Let's import it.

  // Actually FileUpload.tsx exports a hook function `FileUpload`. I will use it.
  // Note: I need to import it first.

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        // We need to implement the upload logic here or use a helper.
        // Since I cannot easily import the hook without seeing the import list (I can add it),
        // I will implement a fetch to the imagekit auth and then upload using client SDK or a simple fetch if I knew the endpoint.
        // But simpler: just use the same logic as the hook.

        const file = e.target.files[0];
        const authRes = await fetch("/api/imagekit-auth");
        if (!authRes.ok) throw new Error("Auth failed");
        const { signature, expire, token } = await authRes.json();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("publicKey", process.env.NEXT_PUBLIC_PUBLIC_KEY!);
        formData.append("signature", signature);
        formData.append("expire", expire);
        formData.append("token", token);
        formData.append("folder", "/avatars");

        const uploadRes = await fetch(
          "https://upload.imagekit.io/api/v1/files/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) throw new Error("Upload failed");
        const data = await uploadRes.json();
        setImage(data.url);
      } catch (err) {
        console.error(err);
        setError("Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: any = {
        name,
        username: username ? `@${username}` : "",
        bio,
      };
      if (image) payload.image = image;

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-800 bg-black p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {image && (
                    <img
                      src={image}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                  />
                  {uploading && (
                    <span className="text-xs text-zinc-500">Uploading...</span>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500">@</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 pl-7 pr-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-zinc-600 focus:outline-none"
                  rows={3}
                  maxLength={160}
                />
              </div>

              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full rounded-full bg-white py-2 font-bold text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
