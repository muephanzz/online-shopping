"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AccountPage() {
  const { user, setUser } = useAuth();
  const [userName, setUserName] = useState("User");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {

    const { data, error: userError } = await supabase.auth.getUser();
    const currentUser = data?.user;

    if (userError || !currentUser) {
      console.error("Error fetching user or user not logged in:", userError);
      return;
    }

    setUser(currentUser);

    const { data: isAdminData, error: adminError } = await supabase.rpc("check_is_admin", {
      uid: currentUser.id,
    });

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (adminError) console.error("Error checking admin status:", adminError);
    setIsAdmin(isAdminData || false);

    if (profileError) console.error("Error fetching profile data:", profileError);
    setUserName(profileData?.first_name || "User");

  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-xl">Please <Link href="/signin" className="text-orange-600 underline">Sign In</Link> to view your account.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Hello, <span className="text-orange-600">{userName}</span>
      </h2>

      {isAdmin && (
        <Link href="/admin">
          <button className="w-full py-3 px-5 bg-white border text-lg font-medium rounded-xl shadow hover:bg-orange-600 hover:text-white transition mb-4">
            Admin Panel
          </button>
        </Link>
      )}

      <div className="space-y-4">
        <Link href="/profile/see-profile">
          <button className="w-full py-3 px-5 bg-white border text-lg font-medium rounded-xl shadow hover:bg-orange-600 hover:text-white transition">
            Profile
          </button>
        </Link>
        <Link href="/orders/order-tracking">
          <button className="w-full py-3 px-5 bg-white border text-lg font-medium rounded-xl shadow hover:bg-orange-600 hover:text-white transition">
            Order Tracking
          </button>
        </Link>
        <Link href="/orders/completed">
          <button className="w-full py-3 px-5 bg-white border text-lg font-medium rounded-xl shadow hover:bg-orange-600 hover:text-white transition">
            Completed Orders
          </button>
        </Link>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setUser(null);
            window.location.href = "/";
          }}
          className="w-full py-3 px-5 bg-red-500 text-white text-lg font-medium rounded-xl shadow hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
