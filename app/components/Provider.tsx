"use client";

import React from "react";
import { ImageKitProvider } from "@imagekit/next";
import { SessionProvider } from "next-auth/react";
import TimerManager from "./TimerManager";
import { Toaster } from "sonner";
import { ThemeProvider } from "./ThemeProvider";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ImageKitProvider urlEndpoint={urlEndpoint}>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TimerManager />
          <Toaster position="top-center" richColors />
          {children}
        </ThemeProvider>
      </SessionProvider>
    </ImageKitProvider>
  );
}
