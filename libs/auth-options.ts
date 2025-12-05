// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { databaseConnection } from "./db";
import { User } from "@/models/User.model";

if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is not defined.");
}
if (!process.env.NEXTAUTH_URL) {
    console.warn("NEXTAUTH_URL is not set. Set it in your .env file.");
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email or password is missing.");
                }

                await databaseConnection();

                const user = await User.findOne({ email: credentials.email }).select("+password");

                if (!user) {
                    throw new Error("No user found with this email.");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Incorrect password.");
                }

                return {
                    id: String(user._id),
                    email: user.email,
                    name: user.name ?? undefined,
                    image: user.image ?? undefined,
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 7,
    },

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await databaseConnection();

                const existing = await User.findOne({ email: user.email });

                if (!existing) {
                    const payload = {
                        email: user.email!,
                        name: user.name ?? "",
                        image: user.image ?? "",
                        provider: "google",
                        providerId: account.providerAccountId,
                    };
                    console.log("[Creating Google user]", payload);
                    const created = await User.create(payload);
                    user.id = String(created._id);
                } else {
                    user.id = String(existing._id);
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user?.id) {
                token.id = user.id;
            }

            if (!token.id && token.sub) {
                token.id = token.sub;
            }

            if (account?.provider) {
                token.provider = account.provider;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                // Prefer token.id; fallback to token.sub
                const userId = (token as any).id ?? token.sub ?? null;
                (session.user as any).id = userId;

                // Sync with DB to get latest image/name
                if (userId) {
                    try {
                        await databaseConnection();
                        const freshUser = await User.findById(userId).select("name image");
                        if (freshUser) {
                            session.user.name = freshUser.name;
                            session.user.image = freshUser.image;
                        }
                    } catch (e) {
                        console.error("Error syncing session user:", e);
                    }
                }
            }
            return session;
        },
    },

    pages: {
        signIn: "/home",
        error: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,

    // Helpful during dev; remove in prod
    debug: process.env.NODE_ENV === "development",
};

export default authOptions;
