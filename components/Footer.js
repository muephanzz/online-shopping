"use client";
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Factory, Car, Linkedin, Youtube, CarFront } from 'lucide-react';
import { FaCcVisa } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile devices (Android, iPhone, iPad, iPod)
    const checkMobile = () => {
      setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  if (isMobile) return null;
  return (
    <footer className="bg-gray-800 text-white p-4">
      <div id='about'>
        <h2 className="mb-2 text-center text-lg font-bold border-b border-gray-500">About</h2>
        <div className="mb-6 text-sm">
          <p>
          Welcome to Ephantronics, your go-to destination for top-quality electronics at unbeatable prices! 🚀 
          We specialize in providing the latest gadgets, accessories, and tech essentials to keep you connected and ahead of the game.
          </p>
          <p className="mt-2">         
          At Ephantronics, we prioritize affordability, reliability, and fast delivery to ensure a seamless shopping experience.
          Whether you're looking for smartphones, laptops, woofers, smart home devices or other electronic accessories, we've got you covered!
          </p>
          <h2 className="my-2">💡 Why Choose Us?</h2>
          <div className="max-w-7xl flex flex-2col md:flex-row">
          <p className="mr-8 mb-1">✔ High-Quality Electronics</p>
          <p className="mr-8 mb-1">✔ Secure & Fast Checkout</p>
          <p className="mr-8 mb-1">✔ Reliable Customer Support</p>
          <p className="mr-8 mb-4">✔ Exclusive Deals & Discounts</p>
        </div>
        <p>Shop with confidence and upgrade your tech today! ⚡🛒</p>         
        </div>
      </div>
      <div className="max-w-7xl flex flex-col md:flex-row">
        <div id='contacts' className="mr-2"> 
          <h2 className="mb-2 text-lg font-bold border-b border-gray-500">Contacts</h2>
          <p className="mb-2 mr-8">Email: muephanzz@gmail.com</p>
          <p className="mb-4 mr-8">Phone: +254798229783</p>
        </div>
        <div className="mr-2">
          <h2 className="mb-2 text-lg font-bold border-b border-gray-500">Accepted Payments</h2>
          <p className="mb-2 mr-8">
            <FaCcVisa size={24} className="inline text-blue-600" />
          </p>
        </div>
        <div className="mr-2">
          <h2 className="mb-2 text-lg font-bold border-b border-gray-500">Follow me</h2>
          <div className="block mr-8 mb-6 flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <Twitter size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400">
              <Instagram size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400">
              <Linkedin size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400">
              <Youtube size={20} />
            </a>
          </div>
        </div>
        <div className="mr-2"> 
          <h2 className="mb-2 text-lg font-bold border-b border-gray-500">Our Products</h2>
          <div className="block space-x-4 mb-4 md:mb-0">
            <Link href="#smartphones" className="hover:text-blue-400">Smatphones</Link>
            <Link href="#laptops" className="hover:text-blue-400">Laptops</Link>
            <Link href="#woofers" className="hover:text-blue-400">Woofers</Link>
          </div>
        </div>
        <div className="mr-2"> 
          <h2 className="mb-2 text-lg font-bold border-b border-gray-500">Quick Links</h2>
          <div className="block space-x-4 mb-4 md:mb-0">
            <Link href="/" className="hover:text-blue-400">Back to Top</Link>
            <Link href="/pivacy-policy" className="hover:text-blue-400">Privacy-Policy</Link>
            <Link href="/t&c" className="hover:text-blue-400">T&C</Link>
            <Link href="/FAQs" className="hover:text-blue-400">FAQs</Link>
          </div>
        </div>
      </div>
      <div className="text-center mb-4 md:mb-0">
        <p className="mt-8 border-y border-gray-500 text-sm">
          &copy; {(new Date().getFullYear())} Ephantronics. All rights reserved.
        </p>
      </div>
    </footer>
  );
}