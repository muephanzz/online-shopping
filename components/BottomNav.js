"use client";
import { Home, Heart, Menu, ShoppingCart, User, XCircle, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import SignInModal from "./SignInModal";

export default function BottomNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showSignIn, setShowSignIn] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
      if (user?.user_metadata?.role === "admin") {
          setIsAdmin(true);
      }
  }, [user]);

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoadingUser(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      const { data, error } = await supabase.from("categories").select("*");
      if (error) console.error("Error fetching categories:", error);
      else setCategories(data);
      setLoadingCategories(false);
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
              setShowSignIn(false);
            } else {
              setShowSignIn(true);
              setUserMenuOpen(false);
            }
          }}
          className={`flex flex-col items-center ${userMenuOpen ? "text-orange-600" : "text-gray-600 hover:text-black"}`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Account</span>
        </button>
      </div>

{/* Full-screen Categories Menu */}
{menuOpen && (
  <div className="fixed inset-0 bg-gray-100 z-50 p-6 overflow-y-auto">
    {/* Close Button */}
    <button
      onClick={() => setMenuOpen(false)}
      className="absolute right-4 flex items-center text-gray-500 hover:text-gray-700 mb-4"
    >
      <XCircle size={24} className="mr-2" /> <span className="text-lg font-medium">Close</span>
    </button>

    {/* Title */}
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Categories</h2>

    {/* Loading Effect */}
    {loadingCategories ? (
      <div className="flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    ) : (
      <div className="space-y-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category_id=${category.id}`}
            onClick={() => setMenuOpen(false)}
            className="flex items-center py-3 px-4 bg-white text-gray-700 text-lg font-medium rounded-md shadow-md hover:bg-orange-500 hover:text-white transition"
          >
            <Tag size={18} className="mr-3" />
            {category.category}
          </Link>
        ))}
      </div>
    )}
  </div>
)}


{userMenuOpen && user && (
  <div className="fixed inset-0 bg-gray-100 z-50 p-6 overflow-y-auto animate-fadeIn">
    {/* Close Button */}
    <button 
      onClick={() => setUserMenuOpen(false)} 
      className="absolute right-4 flex items-center text-gray-500 hover:text-gray-700 mb-6 transition"
    >
      <XCircle size={24} className="mr-2" /> <span className="text-lg font-medium">Close</span>
    </button>

    {/* Greeting */}
    <h2 className="text-2xl font-bold text-gray-800 mb-6">
      Hello, <span className="text-orange-600">{user.user_metadata?.first_name || user.email || "User"}</span>
    </h2>

    {isAdmin && (
      <Link href="/admin">
        <button 
            onClick={() => setUserMenuOpen(false)} 
            className="flex items-center py-3 px-4 bg-white text-gray-700 text-lg font-medium rounded-md shadow-md hover:bg-orange-500 hover:text-white transition"
          >
          </button>
          Admin Panel
      </Link>
    )}

    {/* Menu Items */}
    <nav className="space-y-3 w-full">
      {[
        { href: "/contacts", label: "Contacts" },
        { href: "/orders/order-tracking", label: "Order Tracking" },
        { href: "/orders/completed", label: "Completed Orders" },
      ].map(({ href, label }) => (
        <Link key={href} href={href}>
          <button 
            onClick={() => setUserMenuOpen(false)} 
            className="flex items-center py-3 px-4 bg-white text-gray-700 text-lg font-medium rounded-md shadow-md hover:bg-orange-500 hover:text-white transition"
          >
            {label}
          </button>
        </Link>
      ))}

      {/* Logout Button */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          setUser(null);
          setUserMenuOpen(false);
        }}
        className="block w-full text-center text-left py-3 px-4 bg-red-500 text-white text-lg font-medium rounded-lg shadow hover:bg-red-600 transition duration-200"
      >
        Logout
      </button>
    </nav>
  </div>
)}

      {/* Sign-In Modal */}
      {showSignIn && <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />}
    </nav>
  );
}
