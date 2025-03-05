"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartIcon({ cartCount }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 500 && !/Mobi|Android/i.test(navigator.userAgent));
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  if (!isDesktop) return null; // Hide on non-desktop devices

  return (
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
  );
}
