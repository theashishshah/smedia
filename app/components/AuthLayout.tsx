"use client";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2">
        {/* Left branding pane */}
        <div className="relative hidden md:flex items-center justify-center p-8">
          <div className="absolute inset-0">
            <div className="h-full w-full bg-gradient-to-br from-zinc-100 via-white to-white dark:from-zinc-900 dark:via-black dark:to-black" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center gap-6">
            {/* Logo mark - stylized S */}
            <div className="flex h-48 w-48 items-center justify-center">
              {/* Replace with your SVG/Logo image if available */}
              <svg viewBox="0 0 512 512" className="h-44 w-44 text-foreground">
                <path
                  d="M384 96c-40-40-104-40-144 0l-24 24 56 56 24-24c13-13 35-13 48 0s13 35 0 48l-40 40-80 80-40 40c-13 13-35 13-48 0s-13-35 0-48l24-24-56-56-24 24c-40 40-40 104 0 144s104 40 144 0l160-160c40-40 40-104 0-144z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight">
              smedia.corp
            </h1>
            <p className="max-w-md text-muted-foreground">
              Join conversations that matter. Real-time posts, threads, and
              communities powered by smedia.corp.
            </p>
            <div className="text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} S Media Corp</span>
            </div>
          </div>
        </div>

        {/* Right auth pane */}
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-md">
            <h2 className="mb-2 text-4xl font-extrabold">{title}</h2>
            {subtitle && (
              <p className="mb-6 text-muted-foreground">{subtitle}</p>
            )}
            {children}
            <p className="mt-8 text-xs text-muted-foreground">
              By continuing, you agree to our Terms and acknowledge our Privacy
              Policy and Cookie Use.
            </p>
            <div className="mt-6 text-xs text-muted-foreground">
              <Link href="/legal/privacy" className="hover:underline mr-3">
                Privacy
              </Link>
              <Link href="/legal/terms" className="hover:underline mr-3">
                Terms
              </Link>
              <Link href="/help" className="hover:underline">
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
