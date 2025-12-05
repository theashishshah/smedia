"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTimerStore } from "@/libs/store";
import { toast } from "sonner";

function TimerStarterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const startTimer = useTimerStore((state) => state.startTimer);

  useEffect(() => {
    if (searchParams.get("startTimer")) {
      startTimer(10);
      toast.success("Session timer started for 10 minutes");
      // Remove the param
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("startTimer");
      router.replace(`/home?${newParams.toString()}`);
    }
  }, [searchParams, startTimer, router]);

  return null;
}

export default function TimerStarter() {
  return (
    <Suspense>
      <TimerStarterContent />
    </Suspense>
  );
}
