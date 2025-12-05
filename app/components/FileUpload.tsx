"use client";

import { useRef, useState } from "react";
import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";

export function FileUpload() {
    const [progress, setProgress] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY!;

    const getAuthParams = async () => {
        const res = await fetch("/api/imagekit-auth");
        if (!res.ok) throw new Error("Error getting authentication params from imagekit.");
        return res.json();
    };

    const startUpload = async (file: File) => {
        setProgress(0);
        setUploading(true);
        setError(null);

        abortControllerRef.current = new AbortController();

        try {
            const { signature, expire, token } = await getAuthParams();
            const res = await upload({
                file,
                fileName: file.name,
                signature,
                expire,
                token,
                publicKey,
                onProgress: (evt) => {
                    setProgress((evt.loaded / evt.total) * 100);
                },
                abortSignal: abortControllerRef.current.signal,
            });
            setUploading(false);
            return res;
        } catch (err: any) {
            setUploading(false);

            if (err instanceof ImageKitAbortError) {
                setError("Upload aborted");
            } else if (err instanceof ImageKitInvalidRequestError) {
                setError("Invalid request: " + err.message);
            } else if (err instanceof ImageKitUploadNetworkError) {
                setError("Network error: " + err.message);
            } else if (err instanceof ImageKitServerError) {
                setError("Server error: " + err.message);
            } else {
                setError("Upload failed");
            }
            throw err;
        }
    };

    const abortUpload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    return { progress, uploading, error, startUpload, abortUpload };
}
