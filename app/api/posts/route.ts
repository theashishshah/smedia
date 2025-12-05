// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/libs/auth-options";
import { databaseConnection } from "@/libs/db";
import { Post } from "@/models/Post.model";

export async function GET(req: NextRequest) {
    try {
        await databaseConnection();
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page") || 1));
        const limit = Math.min(50, Number(searchParams.get("limit") || 20));
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Post.countDocuments(),
        ]);

        return NextResponse.json({ success: true, page, limit, total, posts }, { status: 200 });
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

        const body = await req.json();
        const { text = "", imageUrl = "", imageFileId = "" } = body ?? {};

        if (!text && !imageUrl) {
            return NextResponse.json(
                { success: false, message: "Provide text or image." },
                { status: 400 }
            );
        }

        if (typeof text !== "string" || text.length > 2000) {
            return NextResponse.json(
                { success: false, message: "Text too long (max 2000 chars)." },
                { status: 400 }
            );
        }

        await databaseConnection();

        const created = await Post.create({
            authorId: (session.user as any).id, // you set this in session callback
            authorEmail: session.user.email ?? undefined,
            text: text.trim(),
            imageUrl: imageUrl || undefined,
            imageFileId: imageFileId || undefined,
        });

        return NextResponse.json({ success: true, post: created }, { status: 201 });
    } catch (e) {
        console.error("POST /api/posts error", e);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

// import { NextResponse } from 'next/server';

// export async function POST(req: Request) {
//   const form = await req.formData();
//   const text = String(form.get('text') ?? '');

//   // Files: iterate and upload to storage (S3, GCS, Cloudflare R2, etc.)
//   const files = form.getAll('files') as File[];

//   // Example validation
//   if (text.trim().length === 0 && files.length === 0 && ![...form.keys()].some((k) => k.startsWith('gif_'))) {
//     return NextResponse.json({ error: 'Empty post' }, { status: 400 });
//   }

//   // TODO: upload media, persist post in DB, return new post ID
//   return NextResponse.json({ ok: true, id: crypto.randomUUID() });
// }
