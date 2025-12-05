"use client";

import AuthLayout from "@/app/components/AuthLayout";
import AuthForm from "@/app/components/AuthForm";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signInWithCredentials = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        return;
      }

      router.push("/home?startTimer=1");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = () => {
    console.log("Sign in with Google");
    signIn("google", { callbackUrl: "/home?startTimer=1" });
  };

  return (
    <AuthLayout title="Happening now." subtitle="Sign in to smedia.corp">
      <AuthForm
        mode="login"
        onEmailPasswordSubmit={signInWithCredentials}
        onGoogle={signInWithGoogle}
        loading={loading}
        error={error ?? undefined}
      />
      <div className="mt-6 text-zinc-400">
        Don&apos;t have an account?{" "}
        <a className="text-white font-semibold hover:underline" href="/signup">
          Create one
        </a>
      </div>
    </AuthLayout>
  );
}

// "use client";

// import AuthLayout from "@/app/components/AuthLayout";
// import AuthForm from "@/app/components/AuthForm";
// import { redirect } from "next/navigation";

// // Replace with your real implementations:
// async function signInWithCredentials(email: string, password: string) {
//     // Example via API route
//     const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//     });

//     if (!res.ok) throw new Error((await res.json()).error ?? "Invalid credentials");

//     redirect("/home");
// }

// async function signInWithGoogle() {
//     // If using NextAuth: signIn('google', { callbackUrl: '/home' })
//     window.location.href = "/api/auth/callback/google"; // your OAuth start route
// }

// export default function Page() {
//     return (
//         <AuthLayout title="Happening now." subtitle="Sign in to smedia.corp">
//             <AuthForm
//                 mode="login"
//                 onEmailPasswordSubmit={signInWithCredentials}
//                 onGoogle={signInWithGoogle}
//             />
//             <div className="mt-6 text-zinc-400">
//                 Don&apos;t have an account?{" "}
//                 <a className="text-white font-semibold hover:underline" href="/signup">
//                     Create one
//                 </a>
//             </div>
//         </AuthLayout>
//     );
// }
