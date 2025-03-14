"use client";
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { FaCcVisa, FaCcMastercard, FaPaypal } from 'react-icons/fa';
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
    <footer className="bg-gray-900 text-white p-8 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">

        {/* About Section */}
        <div id='about'>
          <h2 className="mb-4 text-2xl font-semibold">About Ephantronics</h2>
          <p className="text-sm leading-6">
            Welcome to <span className="font-bold">Ephantronics</span>, your ultimate destination for cutting-edge electronics at unbeatable prices! We bring you the latest in technology—smartphones, laptops, woofers, and much more.
          </p>
          <p className="mt-4 text-sm leading-6">
            Enjoy a seamless shopping experience with fast delivery, secure payment, and outstanding customer support. Elevate your tech game today! ⚡🛒
          </p>
        </div>

        {/* Contact Section */}
        <div id='contacts'>
          <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
          <p className="text-sm mb-2">📧 Email: <a href="mailto:muephanzz@gmail.com" className="hover:text-blue-400">muephanzz@gmail.com</a></p>
          <p className="text-sm">📞 Phone: <a href="tel:+254798229783" className="hover:text-blue-400">+254798229783</a></p>
        </div>

        {/* Payment Methods */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Payment Methods</h2>
          <div className="flex space-x-4">
            <FaCcVisa size={32} className="text-blue-500" />
            <FaCcMastercard size={32} className="text-red-600" />
            <FaPaypal size={32} className="text-blue-400" />
          </div>
        </div>

        {/* Follow Us */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Follow Us</h2>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <Facebook size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <Twitter size={24} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400">
              <Instagram size={24} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
              <Linkedin size={24} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-500">
              <Youtube size={24} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-blue-400">🏠 Home</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-blue-400">🔒 Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-400">📄 Terms & Conditions</Link></li>
            <li><Link href="/faqs" className="hover:text-blue-400">❓ FAQs</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-12 border-t border-gray-700 pt-4">
        <p className="text-sm">&copy; {new Date().getFullYear()} Ephantronics. All rights reserved.</p>
      </div>
    </footer>
  );
}