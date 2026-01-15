import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) {
      return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 400 });
    }

    // 🔄 ADVANCED PARSING:
    // This logic handles: version numbers (v12345), folders (project/site), and extensions (.jpg)
    
    // 1. Split by '/upload/' to get the path after the base URL
    const parts = imageUrl.split('/upload/');
    if (parts.length < 2) return NextResponse.json({ error: "Malformed URL" }, { status: 400 });

    // 2. Remove the version part (e.g., "v1712345678/") if it exists using Regex
    // This removes 'v' followed by digits and a slash
    const pathWithoutVersion = parts[1].replace(/v\d+\//, '');

    // 3. Remove the file extension (e.g., ".jpg", ".png", ".webp")
    // We split by '.' and take everything before the last dot
    const publicIdWithFolders = pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf('.'));

    if (!publicIdWithFolders) {
      return NextResponse.json({ error: "Failed to extract Public ID" }, { status: 400 });
    }

    console.log("Attempting to destroy Public ID:", publicIdWithFolders);

    // 🗑️ Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicIdWithFolders);

    // Cloudinary returns { result: 'ok' } if successful, or { result: 'not found' }
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Cloudinary Janitor Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}