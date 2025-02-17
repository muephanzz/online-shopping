'useclient';

import Link from 'next/link';
import { ShoppingCart, UserCircle, Search, Menu, Contact } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input"; 
import { Home, User, Laptop, Smartphone } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

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
    <nav 
      style={{position:"fixed", width:"100%"}} 
      className="bg-white shadow-md p-4 z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/">
          <h1 className="hidden md:flex text-2xl font-bold text-blue-600">Ephantronics</h1>
          <h1 className="md:hidden text-1.2xl font-bold text-blue-600">Ephantronics</h1>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full max-w mx-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={20} />
        </form>

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
            <Link href="/signin">
              <UserCircle className="w-8 h-8 text-gray-700 cursor-pointer" />
            </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Navbar */}
      <div
        className="absolute left-0 right-0 z-50 p-5 flex justify-between items-center"
      >
        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-300 text-3xl">
            {menuOpen ? <Smartphone /> : <Menu />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden top-30 md:flex justify-center gap-10 text-lg">
          <a href="#about" className="text-gray-300 text-2 hover:text-grey block">
            Home
          </a>
          <a href="#projects" className="text-gray-300 text-2 hover:text-grey block">
            Projects
          </a>
          <a href="#contact" className="text-gray-300 text-2 hover:text-grey block">
            Contact
          </a>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: menuOpen ? 1 : 0, x: menuOpen ? 0 : -200 }}
        transition={{ duration: 0.3 }}
        className={`fixed  left-0 w-64 h-full bg-gray-800 z-40 p-5 space-y-4 md:hidden ${menuOpen ? 'block' : 'hidden'}`}
      >
      <Link href="/">
        <h1 className="text-1.8xl font-bold text-blue-600">Ephantronics</h1>
      </Link>
      <a href="#about" className="text-gray-300 text-0.8xl hover:text-blue block" onClick={closeMenu}>
        <Home size={18} className="inline mr-2" /> Home
      </a>
      <a href="#contact" className="text-gray-300 text-0.8xl hover:text-blue block" onClick={closeMenu}>
        <Smartphone size={18} className="inline mr-2" /> Smartphones
      </a>
      <a href="#projects" className="text-gray-300 text-0.8xl hover:text-blue block" onClick={closeMenu}>
        <Laptop size={18} className="inline mr-2" /> Laptops
      </a>
      <a href="#projects" className="text-gray-300 text-0.8xl hover:text-blue block" onClick={closeMenu}>
        <Contact size={18} className="inline mr-2" /> Contacts
      </a>
      </div>

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.3 }}
          onClick={closeMenu}
          className="absolute top-0 left-0 right-0 bottom-0 bg-black z-30"
        />
      )}

</nav>
  );
}
