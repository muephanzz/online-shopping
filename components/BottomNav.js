"use client";
import { Home, Heart, Menu, ShoppingCart, User, XCircle, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import UserMenu from "./Navbar/UserMenu";
import SignInModal from "./SignInModal";
import { supabase } from "../lib/supabaseClient";

export default function BottomNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showSignIn, setShowSignIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) console.error("Error fetching categories:", error);
      else setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (user) {
        const { count, error } = await supabase
          .from("cart")
          .select("*", { count: "exact" })
          .eq("user_id", user.id);
        if (!error) setCartCount(count || 0);
      }
    };
    fetchCartCount();
  }, [user]);

  if (!isMobile) return null;

  return (
    <nav className="shadow-md fixed bottom-0 left-0 w-full bg-white z-50">
      <div className="flex justify-around items-center py-3 shadow-md">
        <Link href="/">
          <button className={`flex flex-col items-center ${pathname === "/" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-600 hover:text-black"}`}>
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </button>
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex flex-col items-center ${menuOpen ? "text-orange-600" : "text-gray-600 hover:text-black"}`}
        >
          <Menu size={24} />
          <span className="text-xs mt-1">Categories</span>
        </button>

        <Link href="/wishlist">
          <button className={`flex flex-col items-center ${pathname === "/wishlist" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-600 hover:text-black"}`}>
            <Heart size={24} />
            <span className="text-xs mt-1">Wishlist</span>
          </button>
        </Link>

        <Link href="/cart">
          <button className={`flex flex-col items-center ${pathname === "/cart" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-600 hover:text-black"}`}>
            <ShoppingCart size={24} />
            <span className="text-xs mt-1">Cart ({cartCount})</span>
          </button>
        </Link>

        <button
          onClick={() => {
            if (user) {
              setUserMenuOpen(!userMenuOpen);
              setShowSignIn(false); // Close sign-in modal if open
            } else {
              setShowSignIn(true);
              setUserMenuOpen(false); // Close user menu if open
            }
          }}
          className={`flex flex-col items-center ${userMenuOpen ? "text-orange-600" : "text-gray-600 hover:text-black"}`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Account</span>
        </button>
      </div>

      {/* Categories Dropdown */}
      {menuOpen && (
        <div className="absolute bottom-20 left-1/3 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 w-64">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-800 font-semibold">Categories</span>
            <button onClick={() => setMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
              <XCircle size={20} />
            </button>
          </div>
          <div className="flex flex-col space-y-2">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/products?category_id=${category.id}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-2 text-gray-700 text-md font-medium hover:bg-orange-500 hover:text-white rounded-md transition"
              >
                <Tag size={18} className="mr-2" />
                {category.category}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* User Menu (only if logged in) */}
      {userMenuOpen && user && (
        <div className="fixed top-4 right-4 bg-white shadow-xl rounded-lg p-6 w-64 z-50 transition-transform transform animate-slide-in">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-900 font-semibold text-lg">Account</span>
            <button onClick={() => setUserMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
              <XCircle size={24} />
            </button>
          </div>

          {/* User Menu Component */}
          <UserMenu user={user} setUser={setUser} />
        </div>
      )}

      {/* Sign-In Modal (only if not logged in) */}
      {showSignIn && <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />}
    </nav>
  );
}