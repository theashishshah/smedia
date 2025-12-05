"use client";

import Image from "next/image";
import { useMemo } from "react";
import { cn } from "@/libs/utils";

type Props = {
  src?: string | null;
  name?: string | null;
  className?: string;
  size?: number;
};

const gradients = [
  "bg-gradient-to-br from-pink-500 to-rose-500",
  "bg-gradient-to-br from-purple-500 to-indigo-500",
  "bg-gradient-to-br from-cyan-500 to-blue-500",
  "bg-gradient-to-br from-emerald-500 to-teal-500",
  "bg-gradient-to-br from-orange-500 to-amber-500",
  "bg-gradient-to-br from-fuchsia-500 to-violet-500",
];

export default function UserAvatar({ src, name, className, size = 40 }: Props) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  const gradientClass = useMemo(() => {
    if (!name) return gradients[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  }, [name]);

  if (src && src !== "/avatar-placeholder.png") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-zinc-800",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt={name || "Avatar"}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-white font-bold shadow-inner",
        gradientClass,
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {initial}
    </div>
  );
}
