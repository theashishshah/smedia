"use client";

import AuthLayout from "@/app/components/AuthLayout";
import AuthForm from "@/app/components/AuthForm";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Page() {
    const router = useRouter();

    const signUpWithCredentials = async (email: string, password: string) => {
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? "Sign up failed");
            }

            // Option A: immediately log them in (recommended)
            await signIn("credentials", {
                redirect: true,
                callbackUrl: "/home",
                email,
                password,
            });
        } catch (err) {
            console.error(err);
        }
    };

    const signUpWithGoogle = async () => {
        console.log("Sign up with Google");
        signIn("google", { callbackUrl: "/home" });
    };

    return (
        <AuthLayout title="Join today." subtitle="Create your account">
            <AuthForm
                mode="signup"
                onEmailPasswordSubmit={signUpWithCredentials}
                onGoogle={signUpWithGoogle}
            />
            <div className="mt-6 text-zinc-400">
                Already have an account?{" "}
                <a className="text-white font-semibold hover:underline" href="/login">
                    Sign in
                </a>
            </div>
        </AuthLayout>
    );
}
