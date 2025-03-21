"use client";
import { Home, Heart, Menu, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import CartIcon from "./Navbar/CartIcon";
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
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex flex-col items-center ${menuOpen ? "text-orange-600" : "text-gray-600 hover:text-black"}`}
          >
            <Menu size={24} />
            <span className="text-xs mt-1">Categories</span>
          </button>

          {menuOpen && (
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 w-48 z-40">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/products?category_id=${category.id}`}
                  className="block px-4 py-2 text-gray-700 hover:bg-orange-500 hover:text-white rounded-md transition"
                  onClick={() => setMenuOpen(false)}
                >
                  {category.category}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link href="/wishlist">
          <button className={`flex flex-col items-center ${pathname === "/wishlist" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-600 hover:text-black"}`}>
            <Heart size={24} />
            <span className="text-xs mt-1">Wishlist</span>
          </button>
        </Link>
        
        <button className="relative">
          <CartIcon cartCount={cartCount} />
          <span className="text-xs mt-1">Cart</span>
        </button>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`flex flex-col items-center ${userMenuOpen ? "text-orange-600" : "text-gray-600 hover:text-black"}`}
          >
            <User size={24} />
            <span className="text-xs mt-1">Account</span>
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-12 right-0 bg-white shadow-lg rounded-lg p-4 w-40 z-40">
              {user ? (
                <>
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-orange-500 hover:text-white rounded-md transition">Profile</Link>
                  <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-500 hover:text-white rounded-md transition" onClick={() => { supabase.auth.signOut(); setUser(null); }}>Logout</button>
                </>
              ) : (
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-500 hover:text-white rounded-md transition" onClick={() => setShowSignIn(true)}>Sign In</button>
              )}
            </div>
          )}
        </div>
      </div>

      {showSignIn && <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />}
    </nav>
  );
}
