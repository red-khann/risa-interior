'use client';
import { useState } from 'react';
import { UploadCloud, X, ImageIcon } from 'lucide-react';

export default function CldUpload({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      
      setPreview(data.secure_url);
      onUploadSuccess(data.secure_url); 
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  // 🔄 UPDATED: New function to delete image from Cloudinary if user clicks 'X'
  const handleRemove = async () => {
    if (!preview) return;

    try {
      // We call the internal API we created in Step 1
      await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: preview }),
      });
      
      setPreview("");
      onUploadSuccess(""); // Notify parent form that image is gone
    } catch (err) {
      console.error("Failed to delete from Cloudinary:", err);
      // Even if cloud delete fails, we clear the UI for the user
      setPreview("");
      onUploadSuccess("");
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400 block">
        Media Asset Upload
      </label>
      
      <div className="relative border-2 border-dashed border-zinc-200 hover:border-[#B89B5E] transition-colors p-8 flex flex-col items-center justify-center bg-white group cursor-pointer">
        {preview ? (
          <div className="relative w-full aspect-video">
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            <button 
              type="button" // 🔄 UPDATED: Added type="button" to prevent form submission
              onClick={handleRemove} // 🔄 UPDATED: Now calls handleRemove instead of just setting state
              className="absolute top-2 right-2 bg-black text-white p-1 rounded-full hover:bg-red-500 transition-colors z-10"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <input 
              type="file" 
              onChange={handleUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              disabled={uploading}
            />
            <UploadCloud size={32} className={`mb-4 ${uploading ? 'animate-bounce text-[#B89B5E]' : 'text-zinc-300'}`} />
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
              {uploading ? "Uploading to Cloudinary..." : "Click or Drag to Upload"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}