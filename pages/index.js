import Link from 'next/link';
import { ShoppingCart, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://znjrafazpveysjguzxri.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuanJhZmF6cHZleXNqZ3V6eHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMzg1OTAsImV4cCI6MjA1NDcxNDU5MH0.jdJDl_QoXDF-0_2FxQSt4qml-kj2jQtMmYsL4Vbk7Ks');

export default function Header() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/signin');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">E-Phantronics</h1>
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
        <Link href="/categories" className="text-gray-700 hover:text-blue-600">Categories</Link>
        <Link href="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
        
        <div className="relative">
          <Link href="/cart">
            <ShoppingCart className="w-6 h-6 text-gray-700 cursor-pointer" />
          </Link>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
              {cartCount}
            </span>
          )}
        </div>

        {user ? (
          <div className="relative">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={toggleDropdown}
            >
              <img
                src={user.user_metadata.avatar_url || '/default-profile.png'}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-700">{user.user_metadata.firstName}</span>
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
                <Link href="/profile">
                  <div className="px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <UserCircle
              className="w-8 h-8 text-gray-700 cursor-pointer"
              onClick={toggleDropdown}
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
                <Link href="/signin">
                  <div className="px-4 py-2 text-gray-700 hover:bg-gray-100">Sign In</div>
                </Link>
                <Link href="/signup">
                  <div className="px-4 py-2 text-gray-700 hover:bg-gray-100">Sign Up</div>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
} 
