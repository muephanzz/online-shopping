"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { FaCcVisa, FaCcMastercard, FaPaypal } from 'react-icons/fa';

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
      const checkMobile = () => {
        setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
      };
      checkMobile();
    }, []);

  if (isMobile) return null;

  return (
    <footer className="bg-gradient-to-br mt-10 from-gray-900 via-gray-800 to-gray-900 text-white p-10 shadow-inner">
      {/* About Section */}
      <div className='mb-8' id='about'>
        <h2 className="mb-4 text-xl font-bold tracking-wide text-blue-400">About Ephantronics</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="font-semibold text-white">Ephantronics</span> is your ultimate hub for premium electronics — from smartphones to laptops and audio gear. We deliver top-notch tech with unbeatable prices.
        </p>
        <p className="mt-3 text-sm text-gray-300">
          Fast delivery. Secure payments. Dedicated support. Upgrade your digital lifestyle today! ⚡🛒
        </p>
      </div>
        
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
        {/* Quick Links */}
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-wide text-blue-400">Quick Links</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/" className="hover:text-blue-300">🏠 Home</Link></li>
            <li><Link href="/coming-soon" className="hover:text-blue-300">🔒 Privacy Policy</Link></li>
            <li><Link href="/coming-soon" className="hover:text-blue-300">📄 Terms & Conditions</Link></li>
            <li><Link href="/coming-soon" className="hover:text-blue-300">❓ FAQs</Link></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div id='contacts'>
          <h2 className="mb-4 text-xl font-bold tracking-wide text-blue-400">Contact Us</h2>
          <p className="text-sm mb-2">📧 <Link href="mailto:muephanzz@gmail.com" className="hover:text-blue-300">muephanzz@gmail.com</Link></p>
          <p className="text-sm">📞 <Link href="tel:0798229783" className="hover:text-blue-300"> 0798 229 783</Link></p>
        </div>

        {/* Payment Methods */}
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-wide text-blue-400">Payment Methods</h2>
          <div className="flex items-center space-x-4">
            <FaCcVisa size={32} className="text-blue-500" />
            <FaCcMastercard size={32} className="text-red-600" />
            <FaPaypal size={32} className="text-blue-400" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 400 80"
                fill="none"
                className="w-full h-auto"
              >
                <rect width="400" height="80" rx="12" />
                <g transform="scale(1.1) translate(30, 20)">
                  <path d="M50 0h10v40H50z" fill="#43B02A" />
                  <circle cx="55" cy="20" r="5" fill="white" />
                  <path d="M65 5h10v30H65z" fill="#43B02A" />
                  <text x="90" y="28" fontSize="44" fontWeight="bold" fill="#43B02A" fontFamily="Arial, sans-serif">
                    M-PESA
                  </text>
                </g>
              </svg>
          </div>
        </div>

        {/* Follow Us */}
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-wide text-blue-400">Follow Us</h2>
          <div className="flex space-x-4">
            <Link href="/coming-soon" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500"><Facebook size={24} /></Link>
            <Link href="/coming-soon" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400"><Twitter size={24} /></Link>
            <Link href="/coming-soon" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500"><Instagram size={24} /></Link>
            <Link href="/coming-soon" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300"><Linkedin size={24} /></Link>
            <Link href="/coming-soon" target="_blank" rel="noopener noreferrer" className="hover:text-red-500"><Youtube size={24} /></Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-12 border-t border-gray-700 pt-4">
        <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Ephantronics. All rights reserved.</p>
      </div>
    </footer>
  );
}
