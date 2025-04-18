"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Pencil, Mail, User } from "lucide-react";
import { motion } from "framer-motion";

const Profiles = () => {
  const [profile, setProfile] = useState(null);
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

  const handleEditProfile = () => {
    router.push("/profile/edit-profile");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/70 backdrop-blur-md shadow-xl rounded-3xl p-8 w-full max-w-lg text-center border border-gray-200"
      >
        {!loading && profile ? (
          <>
            <div className="relative w-28 h-28 mx-auto mb-4">
              <img
                src={profile.avatar_url || "/default-avatar.jpg"}
                alt="Profile"
                className="w-full h-full object-cover rounded-full border-4 border-blue-200 shadow-inner ring-2 ring-offset-2 ring-blue-400 transition duration-300"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
              <User size={20} className="text-blue-500" />
              {profile.first_name || "First Name"}{" "}
              {profile.last_name || "Last Name"}
            </h2>
            <p className="text-gray-600 text-sm mt-2 flex items-center justify-center gap-2">
              <Mail size={16} className="text-indigo-500" />
              {profile.email || "Email"}
            </p>

            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleEditProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow hover:shadow-lg transition hover:scale-105"
              >
                <Pencil size={18} />
                Edit Profile
              </motion.button>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-400 animate-spin blur-sm"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-indigo-600 animate-spin"></div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profiles;
