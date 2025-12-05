import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth-options";
import { databaseConnection } from "@/libs/db";
import Message from "@/models/Message.model";
import { User } from "@/models/User.model";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await databaseConnection();
        const currentUserId = (session.user as any).id;

        // Find all unique users interacted with
        const messages = await Message.find({
            $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        }).sort({ createdAt: -1 });

        const userIds = new Set<string>();
        messages.forEach((msg) => {
            if (msg.senderId !== currentUserId) userIds.add(msg.senderId);
            if (msg.receiverId !== currentUserId) userIds.add(msg.receiverId);
        });

        const users = await User.find({ _id: { $in: Array.from(userIds) } }).select(
            "name image email"
        );

        // Map users to conversation previews (last message)
        const conversations = await Promise.all(
            users.map(async (user) => {
                const lastMsg = await Message.findOne({
                    $or: [
                        { senderId: currentUserId, receiverId: user._id },
                        { senderId: user._id, receiverId: currentUserId },
                    ],
                }).sort({ createdAt: -1 });

                return {
                    user: {
                        id: user._id,
                        name: user.name,
                        image: user.image,
                        email: user.email,
                    },
                    lastMessage: lastMsg?.text || "",
                    updatedAt: lastMsg?.createdAt || user.updatedAt,
                };
            })
        );

        // Sort by most recent activity
        conversations.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
