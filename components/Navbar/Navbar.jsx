'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import SignInModal from '../SignInModal';
import Logo from '../Navbar/Logo';
import SearchBar from '../Navbar/SearchBar';
import CartIcon from '../Navbar/CartIcon';
import UserMenu from '../Navbar/UserMenu';
import DesktopMenu from '../Navbar/DesktopMenu';
import MobileMenu from '../Navbar/MobileMenu';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
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

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md p-4 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo />
        <SearchBar />
        <div className="flex items-center space-x-6">
          <CartIcon cartCount={cartCount} />
          <UserMenu user={user} onLogout={handleLogOut} onSignIn={() => setShowSignIn(true)} />
        </div>
      </div>

      <DesktopMenu />
      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {showSignIn && <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />}
    </nav>
  );
}
