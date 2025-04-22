"use client";

import { Home, Heart, Menu, ShoppingCart, User, ChartBarIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

export default function BottomNav() {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
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
    `flex flex-col items-center text-sm font-medium transition ${
      active ? "text-orange-600 scale-105" : "text-gray-600 hover:text-orange-500"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 border-t border-gray-200 shadow-2xl">
      <div className="flex justify-around items-center py-3 px-2">
        <Link href="/">
          <button className={buttonStyle(pathname === "/")}>
            <Home size={24} />
            <span className="mt-1">Home</span>
          </button>
        </Link>

        <Link href="/categories">
          <button className={buttonStyle(pathname === "/categories")}>
            <Menu size={24} />
            <span className="mt-1">Categories</span>
          </button>
        </Link>

        <Link href="/chat">
          <button className={buttonStyle(pathname === "/chat")}>
            <ChartBarIcon size={24} />
            <span className="mt-1">Messages</span>
          </button>
        </Link>

        <Link href="/cart">
          <button className={buttonStyle(pathname === "/cart")}>
            <ShoppingCart size={24} />
            <span className="mt-1">Cart ({cartCount})</span>
          </button>
        </Link>

        <Link href={user ? "/account" : "/signin"}>
          <button className={buttonStyle(pathname === "/account" || pathname === "/signin")}>
            <User size={24} />
            <span className="mt-1">Account</span>
          </button>
        </Link>
      </div>
    </nav>
  );
}
