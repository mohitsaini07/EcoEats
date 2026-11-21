import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createClient } from "@/lib/supabase/server";

export async function uploadListingImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate safe unique filename
  const timestamp = Date.now();
  const ext = path.extname(file.name || "").toLowerCase() || ".jpg";
  const baseName = path
    .basename(file.name || "batch", ext)
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 30);
  const fileName = `${timestamp}-${baseName}${ext}`;

  // 1. Always save local file to public/uploads
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const localFilePath = path.join(uploadDir, fileName);
  await writeFile(localFilePath, buffer);
  const localUrl = `/uploads/${fileName}`;

  // 2. Also attempt upload to Supabase Storage bucket listing-images
  try {
    const supabase = await createClient();
    const mimeType = file.type || "image/jpeg";
    const { error } = await supabase.storage
      .from("listing-images")
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("listing-images").getPublicUrl(fileName);
      if (publicUrl) {
        return publicUrl;
      }
    } else {
      console.warn("Supabase storage upload error, falling back to local:", error.message);
    }
  } catch (err) {
    console.warn("Supabase storage exception, falling back to local:", err);
  }

  return localUrl;
}
