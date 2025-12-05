"use client";
import { Smile } from "lucide-react";

export default function EmojiButton({
  onPick,
}: {
  onPick: (emoji: string) => void;
}) {
  return (
    <button
      type="button"
      className="rounded-full p-2 hover:bg-zinc-800 text-sky-500"
      onClick={() => onPick("😊")}
      title="Add emoji"
    >
      <Smile className="h-5 w-5" />
    </button>
  );
}
