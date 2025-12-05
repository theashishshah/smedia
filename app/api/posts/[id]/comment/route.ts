import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth-options";
import { databaseConnection } from "@/libs/db";
import { Post } from "@/models/Post.model";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { text } = body;

        if (!text || !text.trim()) {
            return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
        }

        await databaseConnection();
        const post = await Post.findById(id);

        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        const newComment = {
            id: crypto.randomUUID(),
            text,
            authorEmail: session.user.email,
            authorName: session.user.name || "User",
            authorAvatar: session.user.image || "/avatar-placeholder.png",
            createdAt: new Date(),
        };

        post.comments.push(newComment);
        await post.save();

        return NextResponse.json({ success: true, comment: newComment });
    } catch (error) {
        console.error("Comment error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
