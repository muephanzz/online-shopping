// pages/index.js

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShoppingCart, UserCircle } from 'lucide-react';

const supabase = createClient('https://znjrafazpveysjguzxri.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuanJhZmF6cHZleXNqZ3V6eHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMzg1OTAsImV4cCI6MjA1NDcxNDU5MH0.jdJDl_QoXDF-0_2FxQSt4qml-kj2jQtMmYsL4Vbk7Ks');

export default function Home() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
    checkUser();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) console.error('Error fetching products:', error);
    else setProducts(data);
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/signin');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const addToCart = () => {
    setCartCount(cartCount + 1);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const flashSales = filteredProducts.slice(0, 4);
  const topDeals = filteredProducts.slice(4, 8);
  const otherProducts = filteredProducts.slice(8, showMore ? filteredProducts.length : 12);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">E-Phantronics</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search products..."
            className="border rounded-lg px-6 py-3 w-96"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
          {user ? (
            <div className="relative">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={toggleDropdown}
              >
                <img
                  src={user.user_metadata.avatar_url || '/default-profile.png'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-gray-700">{user.user_metadata.firstName}</span>
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
                  <Link href="/profile">
                    <div className="px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <UserCircle
                className="w-8 h-8 text-gray-700 cursor-pointer"
                onClick={toggleDropdown}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
                  <Link href="/signin">
                    <div className="px-4 py-2 text-gray-700 hover:bg-gray-100">Sign In</div>
                  </Link>
                  <Link href="/signup">
                    <div className="px-4 py-2 text-gray-700 hover:bg-gray-100">Sign Up</div>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <header className="bg-blue-600 text-white p-4 text-center">
        <h2 className="text-xl font-bold">Welcome to E-Phantronics - Your one-stop shop for electronics!</h2>
      </header>

      <main className="p-6">
        <section>
          <h3 className="text-2xl font-bold mb-4">Flash Sales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {flashSales.map(product => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h3 className="text-2xl font-bold mb-4">Top Deals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topDeals.map(product => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h3 className="text-2xl font-bold mb-4">Other Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {otherProducts.map(product => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
          <button 
            onClick={() => setShowMore(!showMore)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            {showMore ? 'See Less' : 'See More'}
          </button>
        </section>
      </main>

      <footer className="bg-gray-800 text-white p-6 text-center">
        <p>&copy; 2025 E-Phantronics. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <Link href="/about"><span className="hover:underline">About Us</span></Link>
          <Link href="/contact"><span className="hover:underline">Contact</span></Link>
          <Link href="/privacy"><span className="hover:underline">Privacy Policy</span></Link>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product, addToCart }) {
  return (
    <div className="relative bg-white shadow-md rounded-xl p-4 group overflow-hidden">
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-48 object-cover rounded-t-xl transition-transform duration-300 ease-in-out group-hover:scale-105"
      />
      <h2 className="text-xl font-semibold mt-2">{product.name}</h2>
      <p className="text-gray-600">{product.description}</p>
      <p className="text-blue-500 font-bold mt-1">${product.price}</p>
      <button 
        onClick={addToCart}
        className="absolute inset-0 bg-blue-500 bg-opacity-75 text-white flex items-center justify-center text-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
      >
        <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
      </button>
    </div>
  );
}
