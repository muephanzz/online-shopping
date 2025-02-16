import Link from 'next/link';
import { ShoppingCart, UserCircle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaDownload, FaBars, FaTimes } from "react-icons/fa";
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input"; // Make sure this exists or use a basic input.

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${searchQuery}`);
      setSearchQuery(""); // Clear search input after submission
    }
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/">
          <h1 className="text-2xl font-bold text-blue-600">MyStore</h1>
        </Link>

        {/* Centered Navigation Links + Search Bar */}
        <div className="flex-1 mx-10 flex items-center space-x-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            <FaUser className="inline mr-2" />Home
          </Link>
          <Link href="/categories" className="text-gray-700 hover:text-blue-600">Categories</Link>
          <Link href="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={20} />
          </form>
        </div>

        {/* User & Cart Section */}
        <div className="flex items-center space-x-6">
          
          {/* Cart Icon */}
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

          {/* User Dropdown */}
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
                    onClick={handleSignOut}
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
      </div>
    </nav>
  );
}
