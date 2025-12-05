"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageSquare, User2, MoreHorizontal, PencilLine } from "lucide-react";
import clsx from "clsx";

const items = [
    { label: "Home", href: "/home", icon: Home },
    { label: "Explore", href: "/search", icon: Search },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Profile", href: "/profile", icon: User2 },
    { label: "More", href: "/more", icon: MoreHorizontal },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <aside className="sticky top-0 hidden h-screen w-64 flex-col justify-between border-r border-zinc-800 px-3 py-5 md:flex">
            <div className="space-y-2">
                <Link
                    href="/home"
                    className="mb-4 block text-2xl font-black tracking-tight text-white"
                >
                    smedia
                </Link>
                <nav className="space-y-1">
                    {items.map(({ href, label, icon: Icon }) => {
                        const active = pathname?.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={clsx(
                                    "flex items-center gap-3 rounded-full px-4 py-3 text-zinc-300 hover:bg-zinc-900 hover:text-white",
                                    active && "bg-zinc-900 text-white"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-lg">{label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <Link
                href="/compose"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
            >
                <PencilLine className="mr-2 h-4 w-4" /> Post
            </Link>
        </aside>
    );
}
