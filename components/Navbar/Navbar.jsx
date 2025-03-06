"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import SignInModal from "../SignInModal";
import Logo from "../Navbar/Logo";
import SearchBar from "../Navbar/SearchBar";
import CartIcon from "../Navbar/CartIcon";
import UserMenu from "../Navbar/UserMenu";
import DesktopMenu from "../Navbar/DesktopMenu";
import MobileMenu from "../Navbar/MobileMenu";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const router = useRouter();

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

  const handleLogOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };


  return (
    <nav className="bg-white shadow-md p-4 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
      
      {!isMobile && (
        <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      )}

        <Logo />

        {/* Show SearchBar on all devices */}
        <SearchBar />

        {/* Desktop components */}
        {!isMobile && (
          <>
            <DesktopMenu />
            <div className="flex items-center space-x-6">
              <CartIcon cartCount={cartCount} />
              <UserMenu user={user} onLogout={handleLogOut} onSignIn={() => setShowSignIn(true)} />
            </div>
          </>
        )}
      </div>

      {showSignIn && <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />}
    </nav>
  );
}
