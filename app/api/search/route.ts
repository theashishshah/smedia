import { NextRequest, NextResponse } from "next/server";
import { databaseConnection } from "@/libs/db";
import Post from "@/models/Post.model";
import { User } from "@/models/User.model";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") || "";
        const type = searchParams.get("type") || "post"; // 'post' or 'user'

        await databaseConnection();

        if (type === "user") {
            const users = await User.find({
                $or: [
                    { name: { $regex: q, $options: "i" } },
                    { username: { $regex: q, $options: "i" } },
                ],
            })
            .limit(20)
            .select("name username image bio");
            
            return NextResponse.json({ results: users });
        } else {
            // Default to posts
            const posts = await Post.find({
                text: { $regex: q, $options: "i" },
            })
            .sort({ views: -1, createdAt: -1 }) // Trending-ish
            .limit(20);

            // We need to populate author info manually or via aggregation in Mongoose, 
            // but for simplicity let's just fetch authors locally or assume authorId is enough?
            // The UI expects embedded author object. 
            // Let's do a second pass to get authors.
            
            const authorIds = [...new Set(posts.map(p => p.authorId))];
            const authors = await User.find({ _id: { $in: authorIds } }).lean();
            const authorMap = new Map(authors.map(a => [String(a._id), a]));

            const results = posts.map(p => {
                const author = authorMap.get(p.authorId) as any;
                return {
                    id: p._id,
                    content: p.text,
                    image: p.imageUrl,
                    createdAt: p.createdAt,
                    stats: {
                        likes: p.likes.length,
                        reposts: p.reposts.length,
                        replies: p.comments.length,
                        views: p.views,
                    },
                    author: {
                        name: author?.name || "Unknown",
                        handle: author?.username || "@unknown",
                        avatar: author?.image,
                        email: author?.email
                    }
                };
            });

            return NextResponse.json({ results });
        }

    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
