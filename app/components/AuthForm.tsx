"use client";

import { useState, useEffect, FormEvent } from "react";
import { GoogleIcon } from "./GoogleIcon";

type Props = {
  mode: "login" | "signup";
  onEmailPasswordSubmit?: (
    email: string,
    password: string,
    name?: string
  ) => Promise<void> | void;
  onGoogle?: () => Promise<void> | void;
  loading?: boolean; // external loading (optional)
  error?: string; // external error (optional)
};

function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        opacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
    </svg>
  );
}

export default function AuthForm({
  mode,
  onEmailPasswordSubmit,
  onGoogle,
  loading,
  error: errorProp,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pendingLocal, setPendingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // reflect parent-provided error in UI
  useEffect(() => {
    if (errorProp) setError(errorProp);
  }, [errorProp]);

  const isLoading = Boolean(loading || pendingLocal);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPendingLocal(true);
    try {
      await onEmailPasswordSubmit?.(email, password, name);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setPendingLocal(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setPendingLocal(true);
    try {
      await onGoogle?.();
    } catch (err: any) {
      setError(err?.message ?? "Google sign-in failed");
    } finally {
      setPendingLocal(false);
    }
  }

  return (
    <div className="space-y-4 relative" aria-busy={isLoading}>
      {/* Top loading bar */}
      {isLoading && (
        <div className="absolute inset-x-0 -top-2 h-0.5 overflow-hidden rounded-full">
          <div className="h-full w-1/3 animate-[progress_1.2s_linear_infinite] bg-primary" />
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>

      <button
        onClick={handleGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-input bg-background px-5 py-3 font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition hover:cursor-pointer disabled:opacity-70"
        disabled={isLoading}
        aria-label="Continue with Google"
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>Connecting…</span>
          </>
        ) : (
          <>
            <GoogleIcon className="h-5 w-5" />
            <span>Continue with Google</span>
          </>
        )}
      </button>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <div>
            <label className="mb-1 block text-sm text-foreground">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="John Doe"
              autoComplete="name"
              disabled={isLoading}
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm text-foreground">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-foreground">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="••••••••"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            minLength={8}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-foreground px-5 py-3 font-bold text-background hover:bg-foreground/90 transition disabled:opacity-70 hover:cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              {mode === "login" ? "Signing in…" : "Creating account…"}
            </span>
          ) : (
            <>{mode === "login" ? "Sign in" : "Create account"}</>
          )}
        </button>
      </form>

      {mode === "login" && (
        <div className="text-right">
          <a
            className="text-sm text-muted-foreground hover:underline"
            href="/forgot"
          >
            Forgot password?
          </a>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
    </div>
  );
}
