'use client';

import Link from 'next/link';
import { ShoppingCart, UserCircle, Search, Menu, Contact, X, PersonStanding, Music, Music2, TrainTrack, CarFront } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { Home, Laptop, Smartphone } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(''); // Default profile picture
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      setUser(user);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
      } else if (profile.avatar_url) {
        setProfilePic(profile.avatar_url);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      fetchUser();
    });

    return () => {
      if (listener?.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/signin');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products/search?query=${searchQuery}`);
      setSearchQuery(""); // Clear search input after submission
    }
  };

  return (
    <nav style={{ position: "fixed", width: "100%", top: "0" }} className="bg-white shadow-md p-4 z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <h1 className="hidden md:flex text-2xl font-bold text-blue-600">Ephantronics</h1>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full max-w ml-10 mr-2">
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
                  src={profilePic} // Display the fetched profile picture
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
                  <Link href="/profile">
                    <div className="px-4 py-2 text-gray-700 hover:bg-gray-100 z-700">Profile</div>
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
              <Link href="/auth/signin">
                <UserCircle className="w-8 h-8 text-gray-700 cursor-pointer" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navbar */}
      <div className="absolute left-0 right-0 z-50 p-5 flex justify-between items-center">
        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="fixed top-6 text-black-300 text-3xl">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex justify-left gap-5 text-lg w-full bg-gray-100">
          <a href="/" className="text-black-300 text-2 hover:text-grey block">
            Home
          </a>
          <a href="#smartphones" className="text-black-300 text-2 hover:text-grey block">
            Smartphones
          </a>
          <a href="#laptops" className="text-black-300 text-2 hover:text-grey block">
            Laptops
          </a>
          <a href="#woofers" className="text-black-300 text-2 hover:text-grey block">
            Woofers
          </a>
          <a href="#amplifiers" className="text-black-300 text-2 hover:text-grey block">
            Amplifiers
          </a>    
          <a href="#about" className="text-black-300 text-2 hover:text-grey block">
            About
          </a>
          <a href="#contacts" className="text-black-300 text-2 hover:text-grey block">
            Contact
          </a>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-1/2 h-full bg-gray-800 z-40 space-y-4 md:hidden ${menuOpen ? 'block' : 'hidden'}`}
      >
        <h1 className="border-b border-white-100 pl-16 py-5 text-2xl font-bold text-blue-600">Ephantronics</h1>
        <div style={{height: "90vh", overflowY: "scroll"}}>
        <div className='mb-2'> 
        <h1 className="border-b border-white-100  mb-2 pb-2 text-xl font-bold text-gray-400">Top Links</h1>
          <a href="/" className="text-gray-300 text-0.8xl hover:bg-gray-100 hover:text-gray-800 block" onClick={closeMenu}>
            <Home size={18} className="inline m-2" /> Home
          </a>
          <a href="#about" className="text-gray-300 text-0.8xl hover:bg-gray-100 hover:text-gray-800 block" onClick={closeMenu}>
            <PersonStanding size={18} className="inline m-2" /> About
          </a>
          <a href="#contacts" className="text-gray-300 text-0.8xl hover:bg-gray-100 hover:text-gray-800 block" onClick={closeMenu}>
            <Contact size={18} className="inline m-2" /> Contacts
          </a>
        </div>   
        <div className='py-2 border-y border-white-100'>
        <h1 className="border-b border-white-100  mb-2 pb-2 text-xl font-bold text-gray-400">Products</h1>
          <a href="#smartphones" className="text-gray-300 text-0.8xl hover:bg-gray-100 hover:text-gray-800 block" onClick={closeMenu}>
            <Smartphone size={18} className="inline m-2" /> Smartphones
          </a>
          <a href="#laptops" className="text-gray-300 text-0.8xl hover:bg-gray-100 hover:text-gray-800 block" onClick={closeMenu}>
            <Laptop size={18} className="inline m-2" /> Laptops
          </a>
          <a href="#Woofers" className="text-gray-300 text-0.8xl hover:bg-gray-100 hover:text-gray-800 block" onClick={closeMenu}>
            <Music size={18} className="inline m-2" /> Woofers
          </a>
          <a href="#amplifiers" className="text-gray-300 text-0.8xl hover:bg-gray-100 hover:text-gray-800 block" onClick={closeMenu}>
            <Music2 size={18} className="inline m-2" /> Amplifiers
          </a>
          </div>
          <div className='mb-2 py-2 border-b border-white-100'>
          <h1 className="border-b border-white-100  mb-2 pb-2 text-xl font-bold text-gray-400">Useful Links</h1>
          <Link href="/profile" className="text-gray-300 text-0.8xl hover:bg-gray-100 hover:text-gray-800 block" onClick={closeMenu}>
            <UserCircle size={18} className="inline m-2" /> Update Profile
          </Link>
          <Link href="/orders/order-tracking" className="text-gray-300 text-0.8xl hover:bg-gray-100 hover:text-gray-800 block" onClick={closeMenu}>
            <CarFront size={18} className="inline m-2" /> Track Orders
          </Link>
          <Link href="/cart" className="text-gray-300 text-0.8xl hover:bg-gray-100 hover:text-gray-800 block" onClick={closeMenu}>
            <ShoppingCart size={18} className="inline m-2" /> View Cart
          </Link>
          </div>            
        <div className='flex pb-2 border-b border-white-100'>
          <a href="/privacy-policy" className="mx-2 text-gray-300 text-0.8xl hover:bg-gray-100 hover:text-gray-800 block" onClick={closeMenu}>
            Privacy Policy
          </a>
          <p className='text-gray-400'>--------</p>
          <a href="/T&Cs" className="mx-2 text-gray-300 text-0.8xl hover:bg-gray-100 hover:text-gray-800 block" onClick={closeMenu}>
            T&Cs
          </a>
        </div>
        </div>    
      </div>

      {menuOpen && (
        <div onClick={closeMenu} className="left-0 right-0 bottom-0 z-30" />
      )}
    </nav>
  );
}
