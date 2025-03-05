'use client';
import { Contact, PersonStanding, Music, Music2, CarFront } from 'lucide-react';
import { motion } from "framer-motion";
import Link from 'next/link';
import { Home, Smartphone, Laptop, ShoppingCart, UserCircle, Search, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import Image from 'next/image';
import SignInModal from './SignInModal';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [showSignIn, setShowSignIn] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Fetch user
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

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

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
              <div>
                <UserCircle className="w-8 h-8 text-gray-700 cursor-pointer" />
              </div>
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                <div>
                  <p>{user.email}</p>
                </div>
                  <div className="relative">
                    <Link href="/orders/completed"
                    className="w-8 pl-4 h-8 text-gray-700 cursor-pointer"> Completed Orders
                  </Link>
                </div>
                <button onClick={handleLogOut} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                  Logout
                </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <button onClick={() => setShowSignIn(true)}>
                <UserCircle className="w-8 h-8 text-gray-700 cursor-pointer" />
              </button>
            </div>
          )}
          <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
        </div>
      </div>

      {/* Navbar */}
      <div className="absolute left-0 right-0 z-50 flex justify-between items-center">
        {/* Mobile Menu Icon */}
        <div className="md:hidden ml-4">
          <button onClick={toggleMenu} className="fixed top-6 ">
            {menuOpen ? <X className='text-gray-100' /> : <Menu className='text-black-300' />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex justify-left my-4 pl-4 gap-5 text-lg w-full">
          <button><Link href="/">Home</Link></button>
          <button><Link href="#smartphones">Smartphones</Link></button>
          <button><Link href="#laptops">Laptops</Link></button>
          <button><Link href="#woofers">Woofers</Link></button>
          <button><Link href="#amplifiers">Amplifiers</Link></button>
          <button><Link href="#about">About</Link></button>
          <button><Link href="#contacts">Contact</Link></button>  
        </div>

      </div>

      {/* Mobile Menu */}
      <motion.div 
      initial={{ opacity: 0, x: -200 }}
      animate={{ opacity: menuOpen ? 1 : 0, x: menuOpen ? 0 : -200 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 w-1/2 h-full bg-gray-800 z-40 md:hidden ${menuOpen ? 'block' : 'hidden'}`}
      >

        <h1 className="pl-16 my-5 text-2xl font-bold text-blue-600">Ephantronics</h1>

        <div className="scrollbar text-gray-300">

          <div className='mb-2'> 
            <h1 className="border-y border-gray-500 mb-2 py-2 text-xl font-bold text-gray-400">Top Links</h1>
            <button className='block hover:text-blue-500'>
              <Link href="/" onClick={closeMenu}>
                <Home size={18} className="inline m-2" /> Home 
              </Link>
            </button>
            <button className='block hover:text-blue-500'>
              <Link href="#about" onClick={closeMenu}>
                <PersonStanding size={18} className="inline m-2" /> About 
              </Link>
            </button>
            <button className='block hover:text-blue-500'>
              <Link href="#contacts" onClick={closeMenu}>
                <Contact size={18} className="inline m-2" /> Contacts
              </Link>
            </button>
          </div>

          <div className='mb-2'>
            <h1 className="border-y border-gray-500 mb-2 py-2 text-xl font-bold text-gray-400">Products</h1>
            <button className='block hover:text-blue-500'>
              <Link href="#smartphones" onClick={closeMenu}>
                <Smartphone size={18} className="inline m-2" /> Smartphones
              </Link>
            </button>
            <button className='block hover:text-blue-500'>
              <Link href="#laptops" onClick={closeMenu}>
                <Laptop size={18} className="inline m-2" /> Laptops
              </Link>
            </button>
            <button className='block hover:text-blue-500'>
              <Link href="#Woofers" onClick={closeMenu}>
                <Music size={18} className="inline m-2" /> Woofers
              </Link>
            </button>
            <button className='name hover:text-blue-500'>
              <Link href="#amplifiers" onClick={closeMenu}>
                <Music2 size={18} className="inline m-2" /> Amplifiers
              </Link>
            </button>

          </div>

          <div className='mb-2'>
            <h1 className="border-y border-gray-500 mb-2 py-2 text-xl font-bold text-gray-400">Useful Links</h1>
            <button className='block hover:text-blue-500'>
              <Link href="/profile" onClick={closeMenu}>
                <UserCircle size={18} className="inline m-2" /> Update Profile
              </Link>
            </button>
            <button className='block hover:text-blue-500'>
              <Link href="/orders/order-tracking" onClick={closeMenu}>
                <CarFront size={18} className="inline m-2" /> Track Orders
              </Link>
            </button>
            <button className='block hover:text-blue-500'>
              <Link href="/cart" onClick={closeMenu}>
                <ShoppingCart size={18} className="inline m-2" /> View Cart
              </Link>
            </button>
          </div>

          <div className='flex border-y border-gray-500 mb-2 p-2 font-bold text-gray-400'>
            <button className='hover:text-blue-500'>
              <Link href="/privacy-policy" onClick={closeMenu}>
                Privacy Policy
              </Link>
            </button>
            <h2 className='text-gray-400'>--------</h2>
            <button className='hover:text-blue-500'>
              <Link href="/T&Cs" onClick={closeMenu}>
                T&Cs
              </Link>
            </button>
          </div>

        </div>

      </motion.div>

      {menuOpen && (
        <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
        onClick={closeMenu}
        className="fixed top-0 left-0 right-0 bottom-0 bg-black z-30" />
      )}

    </nav>
  );
}