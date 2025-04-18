"use client";

import {
  Home,
  Heart,
  Menu,
  ShoppingCart,
  User,
  XCircle,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomNav() {
  const { user, setUser } = useAuth();
  const [userName, setUserName] = useState("");
  const [loadingUserName, setLoadingUserName] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (user?.user_metadata?.role === "admin") {
      setIsAdmin(true);
    }
  }, [user]);

  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;
      try {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) console.error("Error fetching profile data:", error);
        setUserName(
          `${profileData?.first_name || ""} ${profileData?.last_name || ""}`.trim() || "User"
        );
      } catch {
        setUserName("User");
      } finally {
        setLoadingUserName(false);
      }
    };

    fetchUserName();
  }, [user]);

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

  const buttonStyle = (active: boolean) =>
    `flex flex-col items-center transition ${
      active
        ? "text-orange-600 scale-105"
        : "text-gray-600 hover:text-orange-500"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 backdrop-blur-lg bg-white/80 shadow-xl border-t">
      <div className="flex justify-around items-center py-3 px-2">
        <Link href="/">
          <button className={buttonStyle(pathname === "/")}>
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </button>
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={buttonStyle(menuOpen)}
        >
          <Menu size={24} />
          <span className="text-xs mt-1">Categories</span>
        </button>

        <Link href="/wishlist">
          <button className={buttonStyle(pathname === "/wishlist")}>
            <Heart size={24} />
            <span className="text-xs mt-1">Wishlist</span>
          </button>
        </Link>

        <Link href="/cart">
          <button className={buttonStyle(pathname === "/cart")}>
            <ShoppingCart size={24} />
            <span className="text-xs mt-1">Cart ({cartCount})</span>
          </button>
        </Link>

        <button
          onClick={() => {
            if (user) setUserMenuOpen(!userMenuOpen);
            else window.location.href = "/signin";
          }}
          className={buttonStyle(userMenuOpen)}
        >
          <User size={24} />
          <span className="text-xs mt-1">Account</span>
        </button>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto shadow-xl"
          >
            <div className="relative">
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-4 right-4 flex items-center text-gray-500 hover:text-gray-700 transition"
              >
                <XCircle size={24} className="mr-1" />
                Close
              </button>

              <h2 className="text-2xl font-bold mb-6 mt-2">Shop by Category</h2>

              {loadingCategories ? (
                <div className="flex justify-center items-center py-10">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category_id=${category.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center py-3 px-4 bg-orange-100/50 text-gray-700 text-lg font-medium rounded-md shadow hover:bg-orange-500 hover:text-white transition"
                    >
                      <Tag size={20} className="mr-3" />
                      {category.category}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Menu */}
      <AnimatePresence>
        {userMenuOpen && user && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto shadow-xl"
          >
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(false)}
                className="absolute top-4 right-4 flex items-center text-gray-500 hover:text-gray-700 transition"
              >
                <XCircle size={24} className="mr-1" />
                Close
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mt-2 mb-6">
                Hello, <span className="text-orange-600">{userName}</span>
              </h2>

              {isAdmin && (
                <Link href="/admin">
                  <button
                    onClick={() => setUserMenuOpen(false)}
                    className="block w-full text-left py-3 px-4 bg-white text-gray-700 text-lg font-medium rounded-lg shadow hover:bg-orange-600 hover:text-white transition"
                  >
                    Admin Panel
                  </button>
                </Link>
              )}

              <div className="space-y-3 mt-4">
                {[
                  { href: "/profile/see-profile", label: "Profile" },
                  { href: "/orders/order-tracking", label: "Order Tracking" },
                  { href: "/orders/completed", label: "Completed Orders" },
                ].map(({ href, label }) => (
                  <Link key={href} href={href}>
                    <button
                      onClick={() => setUserMenuOpen(false)}
                      className="block w-full text-left py-3 px-4 bg-white text-gray-700 text-lg font-medium rounded-lg shadow hover:bg-orange-600 hover:text-white transition"
                    >
                      {label}
                    </button>
                  </Link>
                ))}

                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setUser(null);
                    setUserMenuOpen(false);
                    window.location.href = "/";
                  }}
                  className="block w-full text-center py-3 px-4 bg-red-500 text-white text-lg font-medium rounded-lg shadow hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
