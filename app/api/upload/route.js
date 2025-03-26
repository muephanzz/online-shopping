import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { image, fileName } = req.body;

  if (!image || !fileName) {
    return res.status(400).json({ error: "Missing image or file name" });
  }

  // Convert base64 to buffer
  const buffer = Buffer.from(image, "base64");

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("products") // Bucket name
    .upload(`images/${fileName}`, buffer, {
      contentType: "image/jpg", // Change based on your file type
    });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Get public URL
  const imageUrl = supabase.storage.from("products").getPublicUrl(`images/${fileName}`).publicUrl;

  return res.status(200).json({ imageUrl });
}
