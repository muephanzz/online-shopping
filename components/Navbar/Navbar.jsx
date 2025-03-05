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
  const [showSignIn, setShowSignIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Fetch authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // Detect if device is mobile
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth >= 500 && /Mobi|Android/i.test(navigator.userAgent));
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-md p-4 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Show SearchBar on all devices */}
        <SearchBar />

        {/* Desktop components (hidden on mobile) */}
        {!isMobile && (
          <>
            <Logo />
            <div className="flex items-center space-x-6">
              <CartIcon cartCount={cartCount} />
              <UserMenu user={user} onLogout={handleLogOut} onSignIn={() => setShowSignIn(true)} />
            </div>
            <DesktopMenu />
            <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          </>
        )}

        {/* Mobile Menu (only on mobile) */}
        {isMobile && <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />}
      </div>

      {showSignIn && <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />}
    </nav>
  );
}
