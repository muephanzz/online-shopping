import Link from 'next/link';
import { Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h2 className="text-lg font-bold">MyStore</h2>
          <p className="text-sm">&copy; {new Date().getFullYear()} MyStore. All rights reserved.</p>
        </div>

        <div className="flex space-x-6 mb-4 md:mb-0">
          <Link href="/about" className="hover:text-blue-400">About</Link>
          <Link href="/contact" className="hover:text-blue-400">Contact</Link>
        </div>

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
    </footer>
  );
}
