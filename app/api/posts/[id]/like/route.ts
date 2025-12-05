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
        await databaseConnection();
        const post = await Post.findById(id);

        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        const email = session.user.email;
        const index = post.likes.indexOf(email);

        if (index === -1) {
            post.likes.push(email);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();

        return NextResponse.json({ 
            success: true, 
            likes: post.likes.length, 
            liked: index === -1 
        });
    } catch (error) {
        console.error("Like post error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
