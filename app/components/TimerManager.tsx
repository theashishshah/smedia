"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/libs/store";
import { signOut, useSession } from "next-auth/react";

export default function TimerManager() {
  const { status } = useSession();
  const { running, deadline, resetTimer } = useTimerStore();

  useEffect(() => {
    // Only run if authenticated and timer is running
    if (status !== "authenticated" || !running || !deadline) return;

    const interval = setInterval(() => {
      if (Date.now() >= deadline) {
        // Time's up
        resetTimer(); // Stop the timer
        signOut({ redirect: true, callbackUrl: "/login" });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, running, deadline, resetTimer]);

  return null;
}
