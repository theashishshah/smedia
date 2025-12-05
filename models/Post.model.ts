// models/Post.model.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IPost {
    _id?: mongoose.Types.ObjectId;
    authorId: string; // session.user.id
    authorEmail?: string; // optional convenience
    text?: string; // optional; can be empty for pure image post
    imageUrl?: string; // ImageKit URL
    imageFileId?: string; // ImageKit fileId (for delete, transforms)

    createdAt?: Date;
    updatedAt?: Date;
    reports?: number;
    reportedBy?: string[];
    likes?: string[];
    reposts?: string[];
    views?: number;
    comments?: {
        id: string;
        text: string;
        authorEmail: string;
        authorName: string;
        authorAvatar: string;
        createdAt: Date;
    }[];
}

const postSchema = new Schema<IPost>(
    {
        authorId: { type: String, required: true, index: true },
        authorEmail: { type: String },
        text: { type: String, maxlength: 2000, default: "" },
        imageUrl: { type: String },
        imageFileId: { type: String },
        likes: { type: [String], default: [] }, // Array of user emails or IDs
        reposts: { type: [String], default: [] }, // Array of user emails or IDs
        views: { type: Number, default: 0 },
        reports: { type: Number, default: 0 },
        reportedBy: { type: [String], default: [] },
        comments: {
            type: [{
                id: String,
                text: String,
                authorEmail: String,
                authorName: String,
                authorAvatar: String,
                createdAt: Date,
            }],
            default: []
        },
    },
    { timestamps: true }
);

// optional indexes
postSchema.index({ createdAt: -1 });

export const Post = models.Post || model<IPost>("Post", postSchema);

export default Post;
