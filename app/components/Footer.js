import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { FaCcVisa, FaCcMastercard, FaPaypal } from 'react-icons/fa';
import { SiMpesa } from 'react-icons/si';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-10 rounded-t-3xl shadow-inner">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">

        {/* About Section */}
        <div id='about'>
          <h2 className="mb-4 text-xl font-bold tracking-wide text-blue-400">About Ephantronics</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            <span className="font-semibold text-white">Ephantronics</span> is your ultimate hub for premium electronics — from smartphones to laptops and audio gear. We deliver top-notch tech with unbeatable prices.
          </p>
          <p className="mt-3 text-sm text-gray-300">
            Fast delivery. Secure payments. Dedicated support. Upgrade your digital lifestyle today! ⚡🛒
          </p>
        </div>

        {/* Contact Section */}
        <div id='contacts'>
          <h2 className="mb-4 text-xl font-bold tracking-wide text-blue-400">Contact Us</h2>
          <p className="text-sm mb-2">📧 <a href="mailto:muephanzz@gmail.com" className="hover:text-blue-300">muephanzz@gmail.com</a></p>
          <p className="text-sm">📞 <a href="tel:+254798229783" className="hover:text-blue-300">+254 798 229 783</a></p>
        </div>

        {/* Payment Methods */}
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-wide text-blue-400">Payment Methods</h2>
          <div className="flex items-center space-x-4">
            <FaCcVisa size={30} className="text-blue-500" />
            <FaCcMastercard size={30} className="text-red-500" />
            <FaPaypal size={30} className="text-blue-400" />
            <SiMpesa size={30} className="text-green-500" title="M-Pesa" />
          </div>
        </div>

        {/* Follow Us */}
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-wide text-blue-400">Follow Us</h2>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500"><Facebook size={24} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400"><Twitter size={24} /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500"><Instagram size={24} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300"><Linkedin size={24} /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-500"><Youtube size={24} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-wide text-blue-400">Quick Links</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/" className="hover:text-blue-300">🏠 Home</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-blue-300">🔒 Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-300">📄 Terms & Conditions</Link></li>
            <li><Link href="/faqs" className="hover:text-blue-300">❓ FAQs</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-12 border-t border-gray-700 pt-4">
        <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Ephantronics. All rights reserved.</p>
      </div>
    </footer>
  );
}
