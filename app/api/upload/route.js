import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { image, fileName } = req.body;

  if (!image || !fileName) {
    return res.status(400).json({ error: "Missing image or file name" });
  }

  // Check if the base64 string has a prefix like 'data:image/png;base64,'
  const base64Image = image.startsWith("data:image/")
    ? image.split(",")[1] // Strip the data URL prefix
    : image;

  // Convert base64 to buffer
  const buffer = Buffer.from(base64Image, "base64");

  // Detect content type (you could implement better content type detection here)
  const contentType = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")
    ? "image/jpeg"
    : fileName.endsWith(".png")
    ? "image/png"
    : "image/jpg"; // Default to "image/jpg" for unrecognized types

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("products") // Bucket name
    .upload(`images/${fileName}`, buffer, {
      contentType,
    });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Get public URL
  const imageUrl = supabase.storage.from("products").getPublicUrl(`images/${fileName}`).publicUrl;

  return res.status(200).json({ imageUrl });
}
