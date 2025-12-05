import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth-options";
import { databaseConnection } from "@/libs/db";
import { Post } from "@/models/Post.model";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { text } = body;

        await databaseConnection();
        const post = await Post.findById(id);

        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        // Check ownership
        // We use authorEmail because that's what we have in session easily
        if (post.authorEmail !== session.user?.email) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        post.text = text;
        await post.save();

        return NextResponse.json({ success: true, post });
    } catch (error) {
        console.error("Update post error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await databaseConnection();
        const post = await Post.findById(id);

        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        if (post.authorEmail !== session.user?.email) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await Post.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete post error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
