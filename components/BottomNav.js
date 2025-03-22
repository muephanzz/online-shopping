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
        <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto">
          <button onClick={() => setMenuOpen(false)} className="text-gray-500 hover:text-gray-700 mb-4">
            <XCircle size={24} /> Close
          </button>
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          {loadingCategories ? (
            <p>Loading...</p>
          ) : (
            categories.map((category) => (
              <Link key={category.id} href={`/products?category_id=${category.id}`} onClick={() => setMenuOpen(false)} className="block py-2 text-lg">
                <Tag size={18} className="mr-2" /> {category.category}
              </Link>
            ))
          )}
        </div>
      )}

      {/* Full-screen User Menu */}
      {userMenuOpen && user && (
        <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto">
          <button onClick={() => setUserMenuOpen(false)} className="text-gray-500 hover:text-gray-700 mb-4">
            <XCircle size={24} /> Close
          </button>
          <h2 className="text-xl font-semibold mb-4">Hello, {user.user_metadata?.first_name || user.email || "User"}</h2>
          <Link onClick={() => setMenuOpen(false)} href="/contacts" className="block py-2 text-lg">Contacts</Link>
          <Link onClick={() => setMenuOpen(false)} href="/orders/order-tracking" className="block py-2 text-lg">Order Tracking</Link>
          <Link onClick={() => setMenuOpen(false)} href="/orders/completed" className="block py-2 text-lg">Completed Orders</Link>
          <button onClick={async () => { await supabase.auth.signOut(); setUser(null); setUserMenuOpen(false); }} className="block py-2 text-lg text-red-500">Logout</button>
        </div>
      )}

      {/* Sign-In Modal */}
      {showSignIn && <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />}
    </nav>
  );
}
