import mongoose, { Schema, model, models } from "mongoose";

export const VIDEO_DIMENSIONS = {
    width: 1080,
    height: 1920,
} as const;

export interface IVideo extends Document {
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    controls?: boolean;
    transformation?: {
        height: number;
        width: number;
        quality?: number;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

const videoSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        videoUrl: {
            type: String,
            required: true,
        },
        thumbnailUrl: {
            type: String,
            required: true,
        },
        controls: {
            type: Boolean,
            default: false,
        },
        transformation: {
            height: { type: Number, required: true, default: VIDEO_DIMENSIONS.height },
            width: { type: Number, required: true, default: VIDEO_DIMENSIONS.width },
            quality: { type: Number, min: 1, max: 100 },
        },
    },
    { timestamps: true }
);

export const Video = models?.Video || model<IVideo>("Video", videoSchema);
