"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import UserMenu from "./UserMenu";
import DesktopMenu from "./DesktopNav";
import MobileMenu from "./TabletNav";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { user, setUser } = useAuth();

  // Fetch cart count if user is logged in
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
    // Detect mobile devices
    const checkMobile = () => {
      setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  return (
    <nav className="bg-gray-900 shadow-md py-4 fixed w-full top-0 z-50">
      <div className="w-full mx-auto flex justify-between items-center">
        {!isMobile && (
          <>
            <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <Logo />
          </>
        )}

        {/* Search bar is visible on all devices */}
        <SearchBar />

        {!isMobile && (
          <>
            <DesktopMenu />
            <div className="flex items-center space-x-6">
              <CartIcon cartCount={cartCount} />
              <UserMenu />
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
