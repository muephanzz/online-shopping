"use client";
import { useState, useEffect } from "react";
import { Menu, X, Home, Tag } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { Button } from "./ui/button";

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category_id"); 
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) console.error("Error fetching categories:", error);
      else setCategories(data);
    };
    fetchCategories();
  }, []);

  // Close menu and scroll to the top
  const handleCategoryClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="md:hidden">
      {/* Menu Button */}
      <Button
        onClick={() => setMenuOpen(!menuOpen)}
        variant="ghost"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {/* Fullscreen Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-1/2 bg-white shadow-lg transform ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 z-50 flex flex-col`}
      >
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute right-4 hover:text-black hover:bg-white transition-all"
        >
          <X className="absolute top-6 right-1 text-black" size={24} />
        </button>
        <h1 className="flex items-center space-x-3 p-4 top-4 right-24 text-2xl font-bold text-blue-600">
          Ephantronics
        </h1>

        {/* Scrollable Menu Content */}
        <nav className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          <Link
            href="/"
            className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-200 transition-all text-lg"
            onClick={handleCategoryClick}
          >
            <Home size={24} />
            <span>Home</span>
          </Link>

          {categories?.map((category) => {
            const isActive = categoryId === category.id.toString(); // Convert for comparison
            return (
              <Link
                key={category.id}
                href={`/products?category_id=${category.id}`}
                className={`flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-200 transition-all text-lg ${
                  isActive
                    ? "text-blue-600 font-bold border-b-2 border-blue-600"
                    : "text-gray-700"
                }`}
                onClick={handleCategoryClick}
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
