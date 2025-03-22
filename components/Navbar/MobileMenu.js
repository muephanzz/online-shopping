"use client";
import { useState } from "react";
import { Menu, X, Home, ShoppingCart, User, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

    const router = useRouter();
    const [categories, setCategories] = useState([]);
  
    useEffect(() => {
      const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) console.error('Error fetching categories:', error);
        else setCategories(data);
      };
      fetchCategories();
    }, []);

  return (
    <div className="md:hidden">
      {/* Menu Button */}
      <button
        onClick={toggleMenu}
        className="top-4 text-white p-2 rounded-full hover:bg-white hover:text-black transition-all duration-300"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Fullscreen Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-1/2 bg-white shadow-lg transform ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 z-50 flex flex-col`}
      >
        <button
          onClick={closeMenu}
          className="absolute top-4 right-4 hover:text-black hover:bg-white transition-all"
        >
          <X className="text-black" size={24} />
        </button>

        <nav className="mt-16 p-6 space-y-4">
          <Link
            href="/"
            className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-200 transition-all text-lg"
            onClick={closeMenu}
          >
            <Home size={24} />
            <span>Home</span>
          </Link>

          {categories.map((category) => {
            const isActive = router.query.category_id == category.id;
            return (
              <Link
                key={category.id}
                href={`/products?category_id=${category.id}`}
                className={`flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-200 transition-all text-lg ${
                  isActive ? "text-blue-600 font-bold border-b-2 border-blue-600" : "text-gray-700"
                }`}
              >
              <Tag size={18} className="mr-3" />
                {category.category}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
