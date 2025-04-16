'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function UploadReview() {
  const router = useRouter();
  const { id } = useParams(); 
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Loading...");
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) throw new Error("No session");

        const user = session.user;
        setUser(user);
        fetchUserName(user.id);

        const { data: existingReview } = await supabase
          .from("reviews")
          .select("*")
          .eq("user_id", user.id)
          .eq("product_id", id)
          .single();

        if (existingReview) {
          setRating(existingReview.rating);
          setComment(existingReview.comment);
          setImages(existingReview.media_urls || []);
          setIsEditing(true);
        }
      } catch (err) {
        toast.error("You must be logged in to leave a review.");
        router.push("/");
      }
    }

    if (id) init();
  }, [id]);

  const fetchUserName = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
          console.error("Error fetching user or user not logged in:", userError);
          return;
      }

      const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .maybeSingle();

      if (profileError) console.error("Error fetching profile data:", profileError);
      setUserName(`${profileData?.first_name || ""} ${profileData?.last_name || ""}`.trim() || "Anonymous");
    } catch {
      setUserName("Anonymous");
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedImages = [];

    for (const file of files) {
      const filePath = `reviews/${Date.now()}-${file.name}`;
      const { data, error } = await supabase
        .storage
        .from('review-media')
        .upload(filePath, file, {
          upsert: false,
          cacheControl: '3600',
          contentType: file.type,
          metadata: { owner: user.id },
        });    
      if (!error) uploadedImages.push(data.path);
    }

    setImages(prev => [...prev, ...uploadedImages]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        product_id: id,
        user_id: user.id,
        rating,
        comment,
        media_urls: images,
        username: userName,
      };

      let result;
      if (isEditing) {
        result = await supabase
          .from("reviews")
          .update(payload)
          .eq("user_id", user.id)
          .eq("product_id", id);
      } else {
        result = await supabase.from("reviews").insert([payload]);
      }

      if (result.error) throw result.error;
      toast.success("Review submitted successfully!");
      router.push(`/products/category/${id}`);
    } catch (err) {
      toast.error("Failed to submit review");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-24 bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-semibold text-center mb-6">{isEditing ? "Edit Your Review" : "Leave a Review"}</h1>

      <label className="block text-sm font-medium mb-1">Rating:</label>
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
      >
        {[5, 4, 3, 2, 1].map(r => (
          <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
        ))}
      </select>

      <label className="block text-sm font-medium mb-1">Comment:</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows="4"
        className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
        placeholder="Share your experience..."
      ></textarea>

      <label className="block text-sm font-medium mb-1">Upload Images:</label>
      <input
        type="file"
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="mb-4"
      />

      <div className="flex flex-wrap gap-4 mb-6">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-24 h-24">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/review-media/${img}`}
              alt="Preview"
              className="w-full h-full object-cover rounded-md"
            />
            <button
              onClick={() => removeImage(idx)}
              className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowPreview(true)}
        className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700"
      >
        Preview Review
      </button>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full relative">
            <button onClick={() => setShowPreview(false)} className="absolute top-2 right-2 text-gray-500">✕</button>
            <h2 className="text-xl font-semibold mb-4">Review Preview</h2>
            <p><strong>Rating:</strong> {rating} Star{rating > 1 ? "s" : ""}</p>
            <p><strong>Comment:</strong> {comment}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/review-media/${img}`}
                  className="w-20 h-20 object-cover rounded-md"
                  alt="Preview"
                />
              ))}
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="w-full border border-gray-400 rounded-md py-2"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                className="w-full bg-green-600 text-white rounded-md py-2 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
