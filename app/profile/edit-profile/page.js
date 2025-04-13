"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const EditProfile = () => {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    avatar_url: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) console.error("Error fetching profile:", error);
    else setProfile(data || {});

    setLoading(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setAvatarFile(file);
  };

  const uploadAvatar = async (userId) => {
    if (!avatarFile) return profile.avatar_url;

    const fileName = `${userId}/${Date.now()}-${avatarFile.name}`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, { cacheControl: "3600", upsert: true });

    if (error) {
      console.error("Error uploading image:", error);
      return profile.avatar_url;
    }

    return `${supabase.storage.from("avatars").getPublicUrl(fileName).data.publicUrl}`;
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const newAvatarUrl = await uploadAvatar(user.id);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: newAvatarUrl,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
    } else {
      toast.success("Profile updated successfully!");
      router.push("/profile/see-profile"); // ✅ Redirects correctly in App Router
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-center">Edit Profile</h2>

        <label className="block mt-4">
          First Name
          <input
            type="text"
            value={profile.first_name}
            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label className="block mt-4">
          Last Name
          <input
            type="text"
            value={profile.last_name}
            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        <label className="block mt-4">
          Profile Picture
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded mt-1"
          />
        </label>

        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt="Profile Preview"
            className="mt-4 w-24 h-24 rounded-full mx-auto"
          />
        )}

        <button
          onClick={handleUpdateProfile}
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          disabled={loading}
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
