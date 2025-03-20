'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

export default function UploadReview() {
  const router = useRouter();
  const { id } = router.query;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    async function checkUserPurchase() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!session || !session.user) {
          toast.error("Please log in to leave a review.");
          router.push("/");
          return;
        }

        setUser(session.user);

        // Check if user purchased the product
        const { data, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("product_id", id)
          .eq("status", "completed")
          .single();

        if (orderError) throw orderError;

        if (data) setPurchased(true);
      } catch (err) {
        console.error("Error checking purchase:", err.message);
      }
    }

    if (id) checkUserPurchase();
  }, [id]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedImages = [];

    for (const file of files) {
      const filePath = `reviews/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
      .from("review-media") // Correct bucket name
      .upload(filePath, file);
    

      if (error) {
        alert("Failed to upload image.");
        console.error(error);
      } else {
        uploadedImages.push(data.path);
      }
    }

    setImages([...images, ...uploadedImages]);
  };

  const handleSubmit = async () => {
    if (!comment) {
      toast.error("Please enter a comment.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("reviews").insert([
        {
          product_id: id,
          user_id: user.id,
          rating,
          comment,
          media_urls: images,
        },
      ]);

      if (error) throw error;

      toast.success("Review submitted successfully!");
      router.push(`/products/${id}`);
    } catch (error) {
      toast.error("Failed to submit review.");
      console.error("Error submitting review:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-container">
      <h1 className="title">Leave a Review</h1>

      <label className="label">Rating:</label>
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="rating-select"
      >
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>
            {r} Star{r > 1 ? "s" : ""}
          </option>
        ))}
      </select>

      <label className="label">Comment:</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows="4"
        placeholder="Share your experience..."
        className="comment-box"
      ></textarea>

      <label className="label">Upload Images:</label>
      <input
        type="file"
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="file-input"
      />

      <div className="image-preview">
        {images.map((img, index) => (
          <img
            key={index}
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/review-media/${img}`}
            alt="Uploaded preview"
            className="preview-image"
          />
        ))}
      </div>

      <button onClick={handleSubmit} disabled={loading} className="submit-btn">
        {loading ? "Submitting..." : "Submit Review"}
      </button>

      <style jsx>{`
        .review-container {
          padding: 40px 20px;
          max-width: 800px;
          margin: 100px auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .title {
          font-size: 2rem;
          color: #333;
          margin-bottom: 20px;
        }
        .label {
          display: block;
          margin-top: 20px;
          font-size: 1.1rem;
          color: #555;
          text-align: left;
        }
        .input-field,
        .rating-select,
        .comment-box,
        .file-input {
          width: 100%;
          padding: 10px;
          margin-top: 8px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }
        .comment-box {
          resize: none;
        }
        .file-input {
          border: none;
          margin-top: 10px;
        }
        .image-preview {
          display: flex;
          flex-wrap: wrap;
          margin-top: 20px;
          gap: 10px;
        }
        .preview-image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
        }
        .submit-btn {
          margin-top: 30px;
          padding: 12px 20px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .submit-btn:hover {
          background: #005bb5;
        }
        .not-purchased {
          text-align: center;
          margin-top: 50px;
          font-size: 1.2rem;
          color: #d32f2f;
        }
      `}</style>
    </div>
  );
}
