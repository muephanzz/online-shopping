import Link from 'next/link';
import { Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h2 className="mb-1 text-lg font-bold">About</h2>
          <p className="text-sm">
            We are a leading provider of quality 
            electronics, offering a wide range of
            products to meet your needs.
          </p>
        </div>

        <div>
          <h2 className="mb-1 text-lg font-bold">Quick Links</h2>
          <div className="space-x-4 m-0 mb-4 md:mb-0">
            <Link href="/about" className="hover:text-blue-400">Back to Top</Link>
            <Link href="/contact" className="hover:text-blue-400">Privacy Policy</Link>
            <Link href="/about" className="hover:text-blue-400">T&C</Link>
            <Link href="/contact" className="hover:text-blue-400">FAQs</Link>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg font-bold">Follow me</h2>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <Twitter size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400">
              <Instagram size={20} />
            </a>
        </div>
        </div>
      </div>
      <div className="text-center mb-2 mt-4 md:mb-0">
          <p className=" text-sm">&copy; {new Date().getFullYear()} Ephantronics. All rights reserved.</p>
        </div>
    </footer>
  );
}
