import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function UserMenu({ user, setUser, onSignIn }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  // Fetch user role from Supabase
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching role:", error.message);
        return;
      }

      setIsAdmin(data?.role === "admin");
    };

    fetchUserRole();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for auth state changes and update user state
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => data?.subscription?.unsubscribe();
  }, [setUser]);

  // Logout Function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      toast.success("Logged out successfully!");
      setDropdownOpen(false);
      setUser(null);
    } else {
      toast.error("Logout failed. Please try again.");
      console.error("Logout error:", error.message);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {user ? (
        <>
          <button onClick={() => setDropdownOpen(!dropdownOpen)}>
            <User2 className="w-8 h-8 text-gray-700 cursor-pointer transition-transform transform hover:scale-110" />
          </button>

          <div
            className={`absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-lg py-2 transition-all duration-300 ${
              dropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <p className="px-4 text-gray-700 font-medium">
              {user?.user_metadata?.first_name
                ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`
                : user?.email || "User"}
            </p>
            {isAdmin && (
              <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100">
                Admin Panel
              </Link>
            )}
            <Link href="/orders/completed" className="block px-4 py-2 hover:bg-gray-100">
              Completed Orders
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <button onClick={onSignIn}>
          <User2 className="w-8 h-8 text-gray-600 cursor-pointer hover:text-black transition-all duration-300" />
        </button>
      )}
    </div>
  );
}
