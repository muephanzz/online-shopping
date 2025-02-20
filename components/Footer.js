import Link from 'next/link';
import { Facebook, Twitter, Instagram, Factory, Car, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4">
      <div>
        <h2 className="mb-2 text-center text-lg font-bold border-b border-gray-100">About</h2>
        <div className="mb-6 text-sm">
          <p>
          Welcome to [Your Website Name], your go-to destination for top-quality electronics at unbeatable prices! 🚀 We specialize in providing the latest gadgets, accessories, and tech essentials to keep you connected and ahead of the game.
          </p>
          <p className="mt-2">         
          At [Your Website Name], we prioritize affordability, reliability, and fast delivery to ensure a seamless shopping experience. Whether you're looking for smartphones, laptops, gaming accessories, or smart home devices, we've got you covered!
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
        <div className="mr-2"> 
          <h2 className="mb-2 text-lg font-bold border-b border-gray-100">Contacts</h2>
          <p className="mb-2 mr-8">Email: muephanzz@gmail.com</p>
          <p className="mb-4 mr-8">Phone: +254798229783</p>
        </div>
        <div className="mr-2">
          <h2 className="mb-2 text-lg font-bold border-b border-gray-100">Accepted Payments</h2>
          <p className="mb-2 mr-8">
            <Car size={20} style={{display: "inline" }} /> Visa
            <Factory size={20} style={{display: "inline"}} className='ml-4'/> M-Pesa
          </p>
        </div>
        <div className="mr-2">
          <h2 className="mb-2 text-lg font-bold border-b border-gray-100">Follow me</h2>
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
          </div>
        </div>
        <div className="mr-2"> 
          <h2 className="mb-2 text-lg font-bold border-b border-gray-100">Quick Links</h2>
          <div className="block space-x-4 mb-4 md:mb-0">
            <Link href="/" className="hover:text-blue-400">Back to Top</Link>
            <Link href="/pivacy-policy" className="hover:text-blue-400">Privacy-Policy</Link>
            <Link href="/t&c" className="hover:text-blue-400">T&C</Link>
            <Link href="/FAQs" className="hover:text-blue-400">FAQs</Link>
          </div>
        </div>
        <div className="mr-2"> 
          <h2 className="mb-2 text-lg font-bold border-b border-gray-100">Quick Links</h2>
          <div className="block space-x-4 mb-4 md:mb-0">
            <Link href="/" className="hover:text-blue-400">Back to Top</Link>
            <Link href="/pivacy-policy" className="hover:text-blue-400">Privacy-Policy</Link>
            <Link href="/t&c" className="hover:text-blue-400">T&C</Link>
            <Link href="/FAQs" className="hover:text-blue-400">FAQs</Link>
          </div>
        </div>
      </div>
      <div className="text-center mb-4 md:mb-0 border-b border-t border-gray-100">
        <p className=" text-sm">
          &copy; {(new Date().getFullYear())} Ephantronics. All rights reserved.
        </p>
      </div>
    </footer>
  );
}