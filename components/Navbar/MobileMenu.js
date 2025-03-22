"use client";
import { useState } from "react";
import { Menu, X, Home, ShoppingCart, User, LogOut } from "lucide-react";
import Link from "next/link";

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="md:hidden">
      {/* Menu Button */}
      <button
        onClick={toggleMenu}
        className="top-4 text-black p-2 rounded-full hover:bg-gray-200 transition-all duration-300"
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
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          <X size={24} />
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
          <Link
            href="/products"
            className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-200 transition-all text-lg"
            onClick={closeMenu}
          >
            <ShoppingCart size={24} />
            <span>Products</span>
          </Link>
          <Link
            href="/account"
            className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-200 transition-all text-lg"
            onClick={closeMenu}
          >
            <User size={24} />
            <span>Account</span>
          </Link>
          <button
            className="flex items-center space-x-3 p-4 text-red-600 hover:bg-red-100 transition-all text-lg"
            onClick={() => {
              closeMenu();
              alert("Logging out...");
            }}
          >
            <LogOut size={24} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
