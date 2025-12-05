"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import { FileUpload } from "../components/FileUpload";

export default function FileUploadCard() {
	const [fileName, setFileName] = useState<string | null>("No file selected");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { progress, uploading, error, startUpload, abortUpload } =
		FileUpload();

	const handleUpload = async () => {
		if (!fileInputRef.current?.files?.[0]) return;
		try {
			await startUpload(fileInputRef.current.files[0]);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<Card className="max-w-md mx-auto p-4 space-y-4 shadow-lg">
			<CardContent className="space-y-3">
				<Label htmlFor="fileInput">Select File to Upload</Label>
				<label
					htmlFor="fileInput"
					className="flex items-center space-x-4 cursor-pointer border-2 border-black p-2 rounded-lg"
				>
					<span className="bg-black text-white px-4 py-2 rounded-lg">
						Choose File
					</span>
					<span className="text-gray-600">
						{fileName || "No file chosen"}
					</span>
				</label>
				<input
					type="file"
					id="fileInput"
					ref={fileInputRef}
					onChange={(e) => setFileName(e.target.files[0]?.name)}
					className="hidden"
				/>

				<div className="flex items-center space-x-2">
					<Button
						onClick={handleUpload}
						disabled={uploading}
						variant="default"
					>
						{uploading ? "Uploading..." : "Upload"}
					</Button>
					{uploading && (
						<Button
							onClick={abortUpload}
							variant="destructive"
							size="sm"
						>
							Cancel
						</Button>
					)}
				</div>

				{uploading && (
					<Progress
						value={progress}
						max={100}
						className="h-3 rounded-full"
					/>
				)}

				{error && (
					<p className="text-destructive font-medium">{error}</p>
				)}
			</CardContent>
		</Card>
	);
}
