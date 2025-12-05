import { NextRequest, NextResponse } from "next/server";
import { databaseConnection } from "@/libs/db";
import { Post } from "@/models/Post.model";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await databaseConnection();
        // Use findByIdAndUpdate for atomic increment
        await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("View increment error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
