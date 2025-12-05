import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth-options";
import { databaseConnection } from "@/libs/db";
import { Post } from "@/models/Post.model";
import { User } from "@/models/User.model";
import imagekit from "@/libs/imagekit";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await databaseConnection();
        const { searchParams } = new URL(req.url);
        const limit = Math.min(50, Number(searchParams.get("limit") || 20));

        const posts = await Post.find().sort({ createdAt: -1 }).limit(limit).lean();

        // Get unique author emails
        const authorEmails = Array.from(new Set(posts.map((p: any) => p.authorEmail).filter(Boolean)));
        
        // Fetch user details
        const users = await User.find({ email: { $in: authorEmails } }).lean();
        const userMap = new Map(users.map((u: any) => [u.email, u]));

        const feedPosts = posts.map((p: any) => {
            const author = userMap.get(p.authorEmail);
            const fallbackName = p.authorName || "Unknown User";
            const fallbackHandle = p.authorEmail ? `@${p.authorEmail.split("@")[0]}` : "@unknown";
            
            return {
                id: String(p._id),
                author: {
                    name: author?.name || fallbackName,
                    handle: author?.username || (author?.email ? `@${author.email.split("@")[0]}` : fallbackHandle),
                    avatar: author?.image || p.authorAvatar || "/avatar-placeholder.png",
                    email: p.authorEmail,
                },
                createdAt: new Date(p.createdAt ?? Date.now()).toISOString(),
                content: p.text ?? "",
                image: p.imageUrl || undefined,
                stats: {
                    replies: 0,
                    reposts: p.reposts?.length || 0,
                    likes: p.likes?.length || 0,
                    views: p.views || 0,
                },
                likedByMe: p.likes?.includes(session.user?.email),
                repostedByMe: p.reposts?.includes(session.user?.email),
                comments: p.comments?.map((c: any) => ({
                    id: c.id,
                    text: c.text,
                    authorName: c.authorName,
                    authorAvatar: c.authorAvatar,
                    createdAt: new Date(c.createdAt).toISOString(),
                })) || [],
            };
        });

        return NextResponse.json({ success: true, posts: feedPosts });
    } catch (e) {
        console.error("GET /api/posts error", e);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const text = formData.get("text") as string;
        const files = formData.getAll("files") as File[];
        
        let imageUrl = "";

        if (files && files.length > 0) {
            const file = files[0];
            const buffer = Buffer.from(await file.arrayBuffer());
            
            const uploadResponse = await imagekit.upload({
                file: buffer,
                fileName: file.name,
                folder: "/posts"
            });
            
            imageUrl = uploadResponse.url;
        }
        
        await databaseConnection();

        const created = await Post.create({
            authorId: (session.user as any).id,
            authorEmail: session.user.email ?? undefined,
            text: text?.trim() || "",
            imageUrl: imageUrl || undefined,
        });

        return NextResponse.json({ success: true, post: created }, { status: 201 });
    } catch (e) {
        console.error("POST /api/posts error", e);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
