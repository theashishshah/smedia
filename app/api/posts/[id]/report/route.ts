import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth-options";
import { databaseConnection } from "@/libs/db";
import Post from "@/models/Post.model";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await databaseConnection();

        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Check if user already reported
        if (post.reportedBy?.includes(session.user.email)) {
            return NextResponse.json(
                { message: "You have already reported this post" },
                { status: 400 }
            );
        }

        // Increment report count and add user to reportedBy
        post.reports = (post.reports || 0) + 1;
        post.reportedBy = [...(post.reportedBy || []), session.user.email];

        // Automatic moderation: Delete if reports >= 5
        if (post.reports >= 5) {
            await Post.findByIdAndDelete(id);
            // TODO: Notify the creator (placeholder)
            console.log(`Post ${id} deleted due to excessive reports.`);
            return NextResponse.json({ message: "Post deleted due to reports" });
        }

        await post.save();

        return NextResponse.json({
            message: "Post reported successfully",
            reports: post.reports,
        });
    } catch (error) {
        console.error("Error reporting post:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
