"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Navbar from "@/app/components/Navbar";
import Topbar from "@/app/components/Topbar";
import { useRouter } from "next/navigation";
import { useTimerStore } from "@/libs/store";

import { useTheme } from "next-themes";
import UserAvatar from "@/app/components/UserAvatar";

export default function MorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const {
    minutes,
    running,
    deadline,
    remaining,
    startTimer,
    pauseTimer,
    resumeTimer,
    increaseTimer,
    decreaseTimer,
  } = useTimerStore();

  const [now, setNow] = useState(Date.now());

  // keep unauthenticated users off this page
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Tick every second for UI display
  useEffect(() => {
    setMounted(true);
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Calculate display time
  let displayMs = 0;
  if (running && deadline) {
    displayMs = Math.max(0, deadline - now);
  } else if (remaining !== null) {
    displayMs = remaining;
  } else {
    displayMs = minutes * 60 * 1000;
  }

  const remainingLabel = msToLabel(displayMs);

  if (status === "loading") return null;

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut({ redirect: true, callbackUrl: "/login" });
    } catch (e) {
      console.error("Logout failed", e);
      setLoggingOut(false);
    }
  };

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr]">
      <Navbar />

      <section className="space-y-6">
        <Topbar />

        {/* Profile card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
          <div className="flex items-center gap-4">
            <UserAvatar
              src={session?.user?.image}
              name={session?.user?.name}
              size={48}
            />
            <div>
              <p className="text-white font-semibold">
                {session?.user?.name || "Signed in user"}
              </p>
              <p className="text-zinc-400 text-sm">
                {session?.user?.email || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ---- Theme Toggle ---- */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">Appearance</p>
            <p className="text-sm text-zinc-400">
              Choose your preferred theme.
            </p>
          </div>
          {mounted && (
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-white"
            >
              <option value="system">System</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          )}
        </div>

        {/* ---- Timer card ---- */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Auto-Logout Timer</p>
              <p className="text-sm text-zinc-400">
                Manage your session timer.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center justify-center py-4">
            <div className="text-6xl font-mono tracking-widest text-white">
              {remainingLabel}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => decreaseTimer(1)}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
                title="Decrease 1 min"
              >
                -1m
              </button>
              <button
                onClick={() => decreaseTimer(5)}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
                title="Decrease 5 min"
              >
                -5m
              </button>

              {!running ? (
                <button
                  onClick={() =>
                    remaining !== null ? resumeTimer() : startTimer()
                  }
                  className="rounded-md bg-white px-6 py-2 text-black font-semibold hover:bg-zinc-200"
                >
                  {remaining !== null ? "Resume" : "Start"}
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="rounded-md bg-zinc-800 px-6 py-2 text-white font-semibold hover:bg-zinc-700"
                >
                  Pause
                </button>
              )}

              <button
                onClick={() => increaseTimer(1)}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
                title="Increase 1 min"
              >
                +1m
              </button>
              <button
                onClick={() => increaseTimer(5)}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
                title="Increase 5 min"
              >
                +5m
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <ListItem as={Link} href="/settings" label="Settings" emoji="⚙️" />
          <Divider />
          <ListItem as={Link} href="/reports" label="Reports" emoji="🚩" />
          <Divider />
          <ListItem
            as={Link}
            href="/developer"
            label="Developer Options"
            emoji="🧑‍💻"
          />
          <Divider />
          <ListItem
            as={Link}
            href="/legal"
            label="Terms & Privacy"
            emoji="📜"
          />
          <Divider />
          <ListItem
            as="button"
            onClick={handleLogout}
            label={loggingOut ? "Logging out…" : "Logout"}
            emoji="🚪"
            danger
            disabled={loggingOut}
          />
        </div>

        <p className="text-xs text-zinc-500">
          © {new Date().getFullYear()} S Media Corp
        </p>
      </section>
    </main>
  );
}

type ListItemBaseProps = {
  label: string;
  emoji: string;
  danger?: boolean;
  disabled?: boolean;
};

type LinkItemProps = ListItemBaseProps & {
  as: typeof Link;
  href: string;
  onClick?: never;
};

type ButtonItemProps = ListItemBaseProps & {
  as: "button";
  href?: never;
  onClick: () => void | Promise<void>;
};

function Divider() {
  return <div className="h-px w-full bg-zinc-800" />;
}

function ListItem(props: LinkItemProps | ButtonItemProps) {
  const base =
    "flex w-full items-center justify-between px-5 py-4 text-zinc-300 hover:bg-zinc-900 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 hover:cursor-pointer";

  const content = (
    <>
      <span className="flex items-center gap-3">
        <span className="text-lg">{props.emoji}</span>
        <span
          className={`text-sm ${
            "danger" in props && props.danger ? "text-red-400" : "text-zinc-200"
          }`}
        >
          {props.label}
        </span>
      </span>
      <span className="text-zinc-600">›</span>
    </>
  );

  if (props.as === "button") {
    const { onClick, danger, disabled } = props as ButtonItemProps;
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${
          danger ? "hover:bg-red-950/40" : ""
        } disabled:opacity-70`}
        aria-label={props.label}
      >
        {content}
      </button>
    );
  }

  const { href } = props as LinkItemProps;
  return (
    <Link href={href} className={base} aria-label={props.label}>
      {content}
    </Link>
  );
}

function msToLabel(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
