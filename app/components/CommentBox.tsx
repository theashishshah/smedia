"use client";

import { useState } from "react";

type Props = {
  onSubmit: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export default function CommentBox({
  onSubmit,
  placeholder,
  autoFocus,
}: Props) {
  const [text, setText] = useState("");

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <textarea
        autoFocus={autoFocus}
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder ?? "Write a comment…"}
        className="w-full resize-none bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none"
      />
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => {
            const v = text.trim();
            if (!v) return;
            onSubmit(v);
            setText("");
          }}
          disabled={!text.trim()}
          className="rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background disabled:opacity-50 hover:bg-foreground/90 transition-colors"
        >
          Reply
        </button>
      </div>
    </div>
  );
}
