"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Profile() {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getUserId() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Error fetching user ID:", authError.message);
        setError("Failed to get user ID.");
        setLoading(false);
        return;
      }
      if (authData?.user) {
        setUserId(authData.user.id);
      } else {
        console.error("No authenticated user found.");
        setError("No authenticated user.");
        setLoading(false);
      }
    }

    getUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      console.log("Fetching profile for userId:", userId);
    
      if (!userId) {
        console.error("No userId provided!");
        return;
      }
    
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
    
      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }
    
      if (!user) {
        console.error("User object is null, cannot fetch profile.");
        return;
      }
   
      
    }    

    fetchProfile();
  }, [userId]);

  if (loading) return <p className="text-center">Loading profile...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center">
        <div className="flex flex-col items-center">
          <Image
            src={user?.avatar_url || "/default-avatar_url.png"}
            alt="Profile Picture"
            width={100}
            height={100}
            className="rounded-full border-4 border-gray-300"
          />
          <h2 className="text-2xl font-semibold mt-4">{user?.first_name}</h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        <div className="mt-6 border-t pt-4 text-gray-700">
          <p className="text-lg font-medium">About</p>
          <p className="text-sm mt-2">{user?.bio || "No bio available."}</p>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <a href="#" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit Profile</a>
          <a href="#" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Settings</a>
        </div>
      </div>
    </div>
  );
}
