"use client";

import { useState, FormEvent } from "react";
import AuthLayout from "@/app/components/AuthLayout";

export default function Page() {
    const [email, setEmail] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    async function requestPasswordReset(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setPending(true);
        try {
            const res = await fetch("/api/auth/forgot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error ?? "Unable to send reset link");
            }
            setSent(true);
        } catch (err: any) {
            // Show a generic message to avoid account enumeration
            setSent(true);
            if (process.env.NODE_ENV !== "production") {
                setError(err?.message ?? "Something went wrong");
            }
        } finally {
            setPending(false);
        }
    }

    return (
        <AuthLayout title="Forgot your password?" subtitle="We’ll email you a reset link.">
            {sent ? (
                <div className="space-y-4">
                    <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300">
                        If an account exists for {email || "that address"}, a reset link has been
                        sent.
                    </div>
                    <div className="text-zinc-400">
                        Didn’t get an email? Check your spam folder, or try again.
                    </div>
                    <div className="flex items-center gap-3">
                        <a className="text-white font-semibold hover:underline" href="/login">
                            Back to sign in
                        </a>
                        <button
                            className="rounded-full bg-white px-5 py-2 font-bold text-black hover:bg-zinc-200 transition"
                            onClick={() => {
                                setSent(false);
                                setError(null);
                            }}
                        >
                            Send another link
                        </button>
                    </div>
                    {error && (
                        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={requestPasswordReset} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-zinc-300">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                            placeholder="name@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full rounded-full bg-white px-5 py-3 font-bold text-black hover:bg-zinc-200 transition disabled:opacity-70"
                    >
                        {pending ? "Sending…" : "Send reset link"}
                    </button>

                    <div className="text-right">
                        <a className="text-sm text-zinc-400 hover:underline" href="/login">
                            Back to sign in
                        </a>
                    </div>

                    {error && (
                        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}
                </form>
            )}
        </AuthLayout>
    );
}
