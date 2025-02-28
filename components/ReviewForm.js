import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

const ReviewForm = ({ productId, userId }) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkPurchase();
  }, []);

  // ✅ Step 1: Check if user purchased the product
  const checkPurchase = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (error || !data) {
      alert("You must purchase this product to leave a review!");
      router.push(`/product/${productId}`);
    }
  };

  // ✅ Step 2: Handle file change
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  // ✅ Step 3: Upload files to Supabase Storage
  const uploadFiles = async () => {
    const uploadedMedia = [];

    for (const file of files) {
      const uniqueName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("review-media")
        .upload(uniqueName, file);

      if (error) throw new Error("File upload failed");

      const { data } = supabase.storage.from("review-media").getPublicUrl(uniqueName);
      uploadedMedia.push({ url: data.publicUrl, name: file.name });
    }

    return uploadedMedia;
  };

  // ✅ Step 4: Submit Review
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return alert("Rating must be between 1 and 5.");

    setUploading(true);
    try {
      const media = files.length > 0 ? await uploadFiles() : [];

      const { error } = await supabase.from("reviews").insert([
        {
          user_id: userId,
          product_id: productId,
          rating,
          review_text: reviewText,
          media,
        },
      ]);

      if (error) throw new Error(error.message);
      alert("Review submitted successfully!");
      router.reload();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold">Leave a Review</h2>

      <label>
        Rating:
        <input
          type="number"
          value={rating}
          min="1"
          max="5"
          onChange={(e) => setRating(e.target.value)}
          className="border p-2"
          required
        />
      </label>

      <label>
        Review:
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="border p-2 w-full"
          required
        />
      </label>

      <label>
        Upload Images/Videos:
        <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />
      </label>

      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {uploading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default ReviewForm;
