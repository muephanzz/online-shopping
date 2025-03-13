"use Client";
import { useState } from 'react';
import { motion } from "framer-motion";
import Link from 'next/link';
import { Home, Smartphone, Laptop, ShoppingCart, UserCircle, Search, Menu, X, PersonStanding, Music, Music2, Contact, CarFront } from 'lucide-react';

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav style={{ position: "fixed", width: "100%", top: "0" }} className="bg-white shadow-md p-4 z-40">

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