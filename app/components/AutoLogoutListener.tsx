"use client";
import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

const STORAGE_KEY_DEADLINE = "logoutDeadline";
const STORAGE_KEY_ACTIVE = "logoutActive";
const CHANNEL = "auto-logout";

export default function AutoLogoutListener() {
    const { status } = useSession();

    useEffect(() => {
        if (status !== "authenticated") return;

        let id: number | null = null;

        const check = () => {
            const active = localStorage.getItem(STORAGE_KEY_ACTIVE) === "1";
            const deadline = Number(localStorage.getItem(STORAGE_KEY_DEADLINE) || "0");
            if (active && deadline && Date.now() >= deadline) {
                void signOut({ redirect: true, callbackUrl: "/login" });
            }
        };

        id = window.setInterval(check, 1000);

        const bc = new BroadcastChannel(CHANNEL);
        bc.onmessage = () => check();

        return () => {
            if (id) window.clearInterval(id);
            bc.close();
        };
    }, [status]);

    return null;
}
