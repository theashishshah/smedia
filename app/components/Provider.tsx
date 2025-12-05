"use client";

import React from "react";
import { ImageKitProvider } from "@imagekit/next";
import { SessionProvider } from "next-auth/react";
import AutoLogoutListener from "./AutoLogoutListener";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;

export default function Provider({ children }: { children: React.ReactNode }) {
    return (
        <ImageKitProvider urlEndpoint={urlEndpoint}>
            <SessionProvider>
                <AutoLogoutListener />
                {children}
            </SessionProvider>
        </ImageKitProvider>
    );
}
