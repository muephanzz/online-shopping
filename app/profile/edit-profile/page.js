"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { motion } from "framer-motion";
import { FaUserEdit } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";

const EditProfile = () => {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    avatar_url: "",
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const fileInputRef = useRef();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Failed to load profile");
      setFetching(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      toast.error("Error fetching profile");
    } else {
      setProfile(data || {});
      setOriginalProfile(data || {});
    }

    setFetching(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB)");
      return;
    }

    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 720,
      useWebWorker: true,
    });

    setAvatarFile(compressedFile);
    const preview = URL.createObjectURL(compressedFile);
    setProfile((prev) => ({ ...prev, avatar_url: preview }));
  };

  const uploadAvatar = async (userId) => {
    if (!avatarFile) return profile.avatar_url;
    const fileName = `${userId}/${Date.now()}-${avatarFile.name}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, { cacheControl: "3600", upsert: true });

    if (error) {
      toast.error("Avatar upload failed");
      return profile.avatar_url;
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from("avatars")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const avatarUrl = await uploadAvatar(user.id);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: avatarUrl,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Update failed");
    } else {
      toast.success("Profile updated!");
      router.push("/profile/see-profile");
    }

    setLoading(false);
  };

  const handleReset = () => {
    setProfile(originalProfile);
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-xl"
      >
        <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <FaUserEdit className="text-blue-500" /> Edit Profile
        </h2>

        {fetching ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        ) : (
          <>
            <label className="block mt-4 text-sm font-semibold">
              First Name
              <input
                autoFocus
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>

            <label className="block mt-4 text-sm font-semibold">
              Last Name
              <input
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>

            <label className="block mt-4 text-sm font-semibold">
              Profile Picture
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="w-full p-2 border rounded mt-1"
              />
            </label>

            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="Avatar Preview"
                className="mt-4 w-24 h-24 rounded-full object-cover mx-auto ring-2 ring-blue-400"
              />
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row justify-between">
              <button
                onClick={handleUpdateProfile}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                disabled={loading}
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1"
              >
                <MdOutlineCancel /> Revert Changes
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default EditProfile;
