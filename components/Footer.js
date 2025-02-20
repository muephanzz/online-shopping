import Link from 'next/link';
import { Facebook, Twitter, Instagram, Factory, Car, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4">
      <div>
        <h2 className="mt-4 mb-2 text-center text-lg font-bold">About</h2>
        <div>
          <p className="mb-6 text-sm">
          Welcome to [Your Website Name], your go-to destination for top-quality electronics at unbeatable prices! 🚀 We specialize in providing the latest gadgets, accessories, and tech essentials to keep you connected and ahead of the game.

At [Your Website Name], we prioritize affordability, reliability, and fast delivery to ensure a seamless shopping experience. Whether you're looking for smartphones, laptops, gaming accessories, or smart home devices, we've got you covered!

💡 Why Choose Us?
✔ High-Quality Electronics
✔ Secure & Fast Checkout
✔ Reliable Customer Support
✔ Exclusive Deals & Discounts

Shop with confidence and upgrade your tech today! ⚡🛒.
          </p>
        </div>
      </div>
      <div className="max-w-7xl flex flex-col md:flex-row">
        <div className="mr-8">
          <h2 className="mb-2 text-lg font-bold">Contacts</h2>
          <p className="mb-2">Email: muephanzz@gmail.com</p>
          <p className="mb-4">Phone: +254798229783</p>
        </div>
        <div className="mr-8">
          <h2 className="mb-2 text-lg font-bold">Accepted Payments</h2>
          <p className="mb-2">
            <Car size={20} style={{display: "inline"}} /> Visa
          </p>
          <p className="mb-4">
            <Factory size={20} style={{display: "inline"}} /> M-Pesa
          </p>
        </div>
        <div className="mr-8">
          <h2 className="mb-2 text-lg font-bold">Follow me</h2>
          <div className="block mb-6 flex space-x-4">
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
        <div> 
          <h2 className="mb-2 text-lg font-bold">Quick Links</h2>
          <div className="block space-x-4 mb-4 md:mb-0">
            <Link href="/" className="hover:text-blue-400">Back to Top</Link>
            <Link href="/pivacy-policy" className="hover:text-blue-400">Privacy-Policy</Link>
            <Link href="/t&c" className="hover:text-blue-400">T&C</Link>
            <Link href="/FAQs" className="hover:text-blue-400">FAQs</Link>
          </div>
        </div>
      </div>
      <div className="text-center mb-4 md:mb-0">
        <p className=" text-sm">
          &copy; {(new Date().getFullYear())} Ephantronics. All rights reserved.
        </p>
      </div>
    </footer>
  );
}