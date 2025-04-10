"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

const Profiles = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);

    // Fetch current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user or user not logged in:", userError);
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
    router.push("/profile/edit-profile"); // Redirect to profile edit page
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        {!loading && profile ? (
          <>
            <img
              src={profile.avatar_url || "/default-avatar.jpg"}
              alt="Profile Picture"
              width={100}
              height={100}
              className="rounded-full border-4 border-gray-300 mx-auto"
            />
            <h2 className="text-2xl font-semibold mt-4">
              {profile.first_name || "First Name"}
            </h2>
            <h2 className="text-2xl font-semibold mt-2">
              {profile.last_name || "Last Name"}
            </h2>
            <p className="text-gray-500">{profile.email || "Email"}</p>

            <div className="mt-6">
              <button
                onClick={handleEditProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </div>
  );
};

export default Profiles;
