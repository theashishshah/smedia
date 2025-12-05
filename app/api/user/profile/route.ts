import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth-options";
import { databaseConnection } from "@/libs/db";
import { User } from "@/models/User.model";

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, username, bio, image } = body;

        await databaseConnection();

        // Check if username is taken
        if (username) {
            const existing = await User.findOne({ username, email: { $ne: session.user.email } });
            if (existing) {
                return NextResponse.json({ error: "Username already taken" }, { status: 400 });
            }
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { 
                $set: { 
                    name, 
                    username, 
                    bio,
                    image
                } 
            },
            { new: true }
        );

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
