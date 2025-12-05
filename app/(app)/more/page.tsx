"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Navbar from "@/app/components/Navbar";
import Topbar from "@/app/components/Topbar";
import { useRouter } from "next/navigation";

const STORAGE_KEY_DEADLINE = "logoutDeadline";
const STORAGE_KEY_ACTIVE = "logoutActive";
const STORAGE_KEY_DURATION = "logoutDurationMinutes";
const CHANNEL = "auto-logout";
const DEFAULT_MINUTES = 10;

export default function MorePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    // ---- Timer state
    const [minutes, setMinutes] = useState<number>(() => {
        const stored = Number(localStorage?.getItem(STORAGE_KEY_DURATION) || "");
        return Number.isFinite(stored) && stored > 0 ? stored : DEFAULT_MINUTES;
    });
    const [running, setRunning] = useState<boolean>(
        () => localStorage?.getItem(STORAGE_KEY_ACTIVE) === "1"
    );
    const [deadline, setDeadline] = useState<number>(() =>
        Number(localStorage?.getItem(STORAGE_KEY_DEADLINE) || "0")
    );
    const [now, setNow] = useState<number>(Date.now());

    // keep unauthenticated users off this page
    useEffect(() => {
        if (status === "unauthenticated") router.replace("/login");
    }, [status, router]);

    // Tick every second while running
    useEffect(() => {
        if (!running) return;
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, [running]);

    // BroadcastChannel to sync other tabs/pages
    useEffect(() => {
        const bc = new BroadcastChannel(CHANNEL);
        bc.onmessage = (e) => {
            if (e.data?.type === "deadline-update") {
                setDeadline(Number(localStorage.getItem(STORAGE_KEY_DEADLINE) || "0"));
                setRunning(localStorage.getItem(STORAGE_KEY_ACTIVE) === "1");
            }
        };
        return () => bc.close();
    }, []);

    // When time is up → logout
    useEffect(() => {
        if (!running || !deadline) return;
        if (Date.now() >= deadline) {
            void forceLogout();
        }
    }, [running, deadline, now]);

    const remainingMs = useMemo(() => Math.max(0, (deadline || 0) - now), [deadline, now]);
    const remainingLabel = useMemo(() => msToLabel(remainingMs), [remainingMs]);

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

    function startTimer() {
        const dur = minutes > 0 ? minutes : DEFAULT_MINUTES;
        const newDeadline = Date.now() + dur * 60_000;
        setDeadline(newDeadline);
        setRunning(true);

        localStorage.setItem(STORAGE_KEY_DURATION, String(dur));
        localStorage.setItem(STORAGE_KEY_DEADLINE, String(newDeadline));
        localStorage.setItem(STORAGE_KEY_ACTIVE, "1");
        notifyOthers();
    }

    function pauseTimer() {
        setRunning(false);
        localStorage.setItem(STORAGE_KEY_ACTIVE, "0");
        notifyOthers();
    }

    function resetTimer() {
        setRunning(false);
        setDeadline(0);
        localStorage.removeItem(STORAGE_KEY_DEADLINE);
        localStorage.setItem(STORAGE_KEY_ACTIVE, "0");
        notifyOthers();
    }

    function notifyOthers() {
        const bc = new BroadcastChannel(CHANNEL);
        bc.postMessage({ type: "deadline-update" });
        bc.close();
    }

    async function forceLogout() {
        // Clean up
        localStorage.removeItem(STORAGE_KEY_DEADLINE);
        localStorage.setItem(STORAGE_KEY_ACTIVE, "0");
        notifyOthers();

        try {
            await signOut({ redirect: true, callbackUrl: "/login" });
        } catch (e) {
            console.error("Auto logout failed", e);
        }
    }

    return (
        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_minmax(640px,2fr)_1fr]">
            <Navbar />

            <section className="space-y-6">
                <Topbar />

                {/* Profile card */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
                    <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-zinc-800">
                            <Image
                                src={(session?.user?.image as string) || "/avatar-placeholder.png"}
                                alt="User avatar"
                                fill
                                sizes="48px"
                            />
                        </div>
                        <div>
                            <p className="text-white font-semibold">
                                {session?.user?.name || "Signed in user"}
                            </p>
                            <p className="text-zinc-400 text-sm">{session?.user?.email || "—"}</p>
                        </div>
                    </div>
                </div>

                {/* ---- Timer card ---- */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-semibold">Auto-Logout Timer</p>
                            <p className="text-sm text-zinc-400">
                                Pick a duration and start the clock. You’ll be signed out
                                automatically.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-white"
                                value={minutes}
                                onChange={(e) => setMinutes(Number(e.target.value))}
                                disabled={running}
                            >
                                {[0.1, 0.5, 10, 15, 20, 30, 45, 60].map((m) => (
                                    <option key={m} value={m}>
                                        {m} min
                                    </option>
                                ))}
                            </select>

                            {!running ? (
                                <button
                                    onClick={startTimer}
                                    className="rounded-md bg-white px-4 py-2 text-black font-semibold hover:bg-zinc-200"
                                >
                                    Start
                                </button>
                            ) : (
                                <button
                                    onClick={pauseTimer}
                                    className="rounded-md bg-zinc-800 px-4 py-2 text-white font-semibold hover:bg-zinc-700"
                                >
                                    Pause
                                </button>
                            )}

                            <button
                                onClick={resetTimer}
                                className="rounded-md border border-zinc-700 px-4 py-2 text-white font-semibold hover:bg-zinc-900"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="text-4xl font-mono tracking-widest text-white">
                        {running && deadline ? remainingLabel : "--:--"}
                    </div>
                </div>

                {/* Actions */}
                <div className="overflow-hidden rounded-2xl border border-zinc-800">
                    <ListItem as={Link} href="/settings" label="Settings" emoji="⚙️" />
                    <Divider />
                    <ListItem as={Link} href="/developer" label="Developer Options" emoji="🧑‍💻" />
                    <Divider />
                    <ListItem as={Link} href="/legal" label="Terms & Privacy" emoji="📜" />
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

                <p className="text-xs text-zinc-500">© {new Date().getFullYear()} S Media Corp</p>
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
                className={`${base} ${danger ? "hover:bg-red-950/40" : ""} disabled:opacity-70`}
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
