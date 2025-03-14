"use client";
import { Menu, Search } from "lucide-react";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { Home, User2} from 'lucide-react';
import CartIcon from "./Navbar/CartIcon";
import UserMenu from "./Navbar/UserMenu";
import SignInModal from "./SignInModal";

export default function BottomNav() {
  const [isMobile, setIsMobile] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [showSignIn, setShowSignIn] = useState(false);

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

  // Hide if not on a mobile device
  if (!isMobile) return null;

  return (
    <nav className="shadow-md p-4 fixed w-full z-50">
     
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-md flex justify-around items-center py-3 z-50">
        <Link href="/">
            <button className="flex flex-col items-center text-gray-600 hover:text-black">
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </button>
        </Link>

        <Link href="">
            <button className="flex flex-col items-center text-gray-600 hover:text-black">
              <Search size={24} />
              <span className="text-xs mt-1">Home</span>
            </button>
        </Link>

          <button className="flex flex-col items-center text-gray-600 hover:text-black">
            <Menu size={24} />
            <span className="text-xs mt-1">Categories</span>
          </button>

        <button>
          <CartIcon cartCount={cartCount} />
          <span className="text-xs mt-1">Cart</span>
        </button>

        <button>
          <UserMenu user={user} onLogout={handleLogOut} onSignIn={() => setShowSignIn(true)} />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
 
    {showSignIn && <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />}
  </nav>
  );
}
