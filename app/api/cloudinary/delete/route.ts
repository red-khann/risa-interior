import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure with your environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Extract public_id from Cloudinary URL
    // Format: .../upload/v12345/folder/image_name.jpg
    const parts = imageUrl.split('/');
    const lastPart = parts.pop(); // e.g., "image_name.jpg"
    const publicId = lastPart?.split('.')[0]; // e.g., "image_name"

    if (!publicId) {
      return NextResponse.json({ error: "Could not parse Public ID" }, { status: 400 });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Cloudinary Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}