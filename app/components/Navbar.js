"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import SignInModal from "./SignInModal";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import UserMenu from "./UserMenu";
import DesktopMenu from "./DesktopNav";
import MobileMenu from "./TabletNav";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  // Fetch authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // Fetch cart count
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
    // Detect mobile devices (Android, iPhone, iPad, iPod)
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

        {/* Show SearchBar on all devices */}      
        <SearchBar />
    
        {!isMobile && (
          <>
            <DesktopMenu />
            <div className="flex items-center space-x-6">
              <CartIcon cartCount={cartCount} />
              <UserMenu user={user} setUser={setUser} onSignIn={() => setShowSignIn(true)} />
            </div>
          </>
        )}
      </div>

      {showSignIn && <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />}
    </nav>
  );
}
