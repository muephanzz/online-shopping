import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";

const ReviewForm = ({ productId }) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const router = useRouter();

  // ✅ Fetch logged-in user and their username
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("Error fetching user:", error);
        return;
      }
      setUser(user);

      // Fetch username from profile table
      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
        setUsername(`${profile.first_name} ${profile.last_name}`);
      }
    };

    fetchUser();
  }, []);

  // ✅ Handle file selection
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  // ✅ Upload files to Supabase Storage
  const uploadFiles = async () => {
    const uploadedMedia = [];

    for (const file of files) {
      const uniqueName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("review-media")
        .upload(uniqueName, file);

      if (error) throw new Error("File upload failed");

      uploadedMedia.push(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/review-media/${uniqueName}`);
    }

    return uploadedMedia;
  };

  // ✅ Submit Review
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return alert("Please enter a review.");
    if (!user) return alert("User not logged in.");

    setUploading(true);
    try {
      const media = files.length > 0 ? await uploadFiles() : [];

      const { error } = await supabase.from("reviews").insert([
        {
          user_id: user.id,  // ✅ Ensure user_id is correctly set
          product_id: productId,
          rating,
          review_text: reviewText,
          media_urls: media,
          first_name: username.split(" ")[0], // ✅ Store first name
          last_name: username.split(" ")[1],  // ✅ Store last name
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
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold">Leave a Review</h2>

      <label className="block">
        Rating:
        <input
          type="number"
          value={rating}
          min="1"
          max="5"
          onChange={(e) => setRating(Number(e.target.value))}
          className="border p-2 w-full"
          required
        />
      </label>

      <label className="block">
        Review:
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="border p-2 w-full"
          required
        />
      </label>

      <label className="block">
        Upload Images/Videos:
        <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />
      </label>

      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        {uploading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default ReviewForm;
