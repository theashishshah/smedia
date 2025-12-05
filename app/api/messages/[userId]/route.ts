import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth-options";
import { databaseConnection } from "@/libs/db";
import Message from "@/models/Message.model";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId: otherUserId } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await databaseConnection();
        const currentUserId = (session.user as any).id;

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: currentUserId },
            ],
        }).sort({ createdAt: 1 });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId: receiverId } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { text } = await req.json();
        if (!text?.trim()) {
            return NextResponse.json({ error: "Message text required" }, { status: 400 });
        }

        await databaseConnection();
        const currentUserId = (session.user as any).id;

        const newMessage = await Message.create({
            senderId: currentUserId,
            receiverId,
            text: text.trim(),
            read: false,
        });

        return NextResponse.json({ message: newMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
