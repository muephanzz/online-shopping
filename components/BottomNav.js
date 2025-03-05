"use client";
import { useEffect, useState } from "react";
import { FaHome, FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";

export default function BottomNav() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile devices (Android, iPhone, iPad, iPod)
    const checkMobile = () => {
      setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // Hide if not on a mobile device
  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-md flex justify-around items-center py-3 z-50">
      <button className="flex flex-col items-center text-gray-600 hover:text-black">
        <FaHome size={24} />
        <span className="text-xs mt-1">Home</span>
      </button>

      <button className="flex flex-col items-center text-gray-600 hover:text-black">
        <FaSearch size={24} />
        <span className="text-xs mt-1">Search</span>
      </button>

      <button className="flex flex-col items-center text-gray-600 hover:text-black">
        <FaShoppingCart size={24} />
        <span className="text-xs mt-1">Cart</span>
      </button>

      <button className="flex flex-col items-center text-gray-600 hover:text-black">
        <FaUser size={24} />
        <span className="text-xs mt-1">Profile</span>
      </button>
    </div>
  );
}
