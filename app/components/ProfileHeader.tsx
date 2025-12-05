"use client";

import { useState } from "react";
import UserAvatar from "./UserAvatar";
import EditProfileModal from "./EditProfileModal";
import { Pencil } from "lucide-react";

type Props = {
  user: {
    name: string;
    username: string;
    bio: string;
    image?: string;
    email: string;
  };
  isOwnProfile: boolean;
};

export default function ProfileHeader({ user, isOwnProfile }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-zinc-800 p-6 text-zinc-300 flex items-start gap-6">
        <UserAvatar
          src={user.image}
          name={user.name}
          size={80}
          className="text-3xl"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-zinc-500 mb-2">{user.username}</p>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => setIsEditOpen(true)}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-900"
              >
                Edit Profile
              </button>
            )}
          </div>
          <p className="whitespace-pre-wrap">{user.bio || "No bio yet."}</p>
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileModal
          user={user}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}
