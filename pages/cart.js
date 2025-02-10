import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

const supabase = createClient('https://znjrafazpveysjguzxri.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuanJhZmF6cHZleXNqZ3V6eHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMzg1OTAsImV4cCI6MjA1NDcxNDU5MH0.jdJDl_QoXDF-0_2FxQSt4qml-kj2jQtMmYsL4Vbk7Ks');

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(storedItems);
    calculateTotal(storedItems);
  }, []);

  const calculateTotal = (items) => {
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(totalPrice);
  };

  const handleRemove = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Your Cart</h1>
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cartItems.map(item => (
            <div key={item.id} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex flex-col items-center">
                <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover rounded-lg" />
                <h2 className="text-xl font-semibold mt-2">{item.name}</h2>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-blue-500 font-bold mt-1">${item.price}</p>
                <p className="text-gray-700">Quantity: {item.quantity}</p>
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Your cart is empty.</p>
      )}
      <div className="mt-6 text-center">
        <h2 className="text-2xl font-bold">Total: ${total.toFixed(2)}</h2>
        <Link href="/checkout" passHref>
          <button className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Proceed to Checkout
          </button>
        </Link>
      </div>
    </div>
  );
}