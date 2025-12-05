import { authOptions } from "@/libs/auth-options";
import { databaseConnection } from "@/libs/db";
import { IVideo, Video } from "@/models/Video.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
	try {
		await databaseConnection();
		const videos = await Video.find({}).sort({ createdAt: -1 }).lean();
		if (!videos || videos.length === 0) {
			return NextResponse.json([], { status: 401 });
		}
		return NextResponse.json(videos);
	} catch (error) {
		return NextResponse.json(
			{
				error: "Error while getting videos from database.",
			},
			{ status: 401 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const userSession = await getServerSession(authOptions);

		if (!userSession) {
			return NextResponse.json(
				{
					message: "Unauthorized person",
				},
				{ status: 401 }
			);
		}

		await databaseConnection();
		const body: IVideo = await req.json();

		if (
			!body.title ||
			!body.description ||
			!body.videoUrl ||
			!body.thumbnailUrl
		) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

        const videoData = {
            ...body,
            controls: body.controls ?? true,
            transformation: {
              height: 1920,
              width: 1080,
              quality: body.transformation?.quality ?? 100,
            },
          };

        const video = await Video.create(videoData)
        return NextResponse.json(video)
	} catch (error) {
        return NextResponse.json(
			{
				error: "Error while uploading video to database.",
			},
			{ status: 401 }
		);
    }
}
