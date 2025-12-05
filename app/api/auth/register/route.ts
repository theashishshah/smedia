import { NextRequest, NextResponse } from "next/server";
import { databaseConnection } from "@/libs/db";
import { User } from "@/models/User.model";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required." },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: "Invalid email format." },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password must be at least 6 characters long.",
                },
                { status: 400 }
            );
        }

        await databaseConnection();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to register user. Email already exists.",
                },
                { status: 409 }
            );
        }

        const user = await User.create({
            email,
            password,
            provider: "credentials",
        });

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully.",
                user: {
                    _id: user._id,
                    email: user.email,
                    createdAt: user.createdAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.log("Registration Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        await databaseConnection();

        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (email) {
            const user = await User.findOne({ email }).select("-password");
            if (!user) {
                return NextResponse.json(
                    { success: false, message: "User not found." },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { success: true, message: "User fetched successfully.", user },
                { status: 200 }
            );
        }
    } catch (error) {
        console.log("GET Users Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
