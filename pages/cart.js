import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import Link from 'next/link';

const supabase = createClient('https://znjrafazpveysjguzxri.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuanJhZmF6cHZleXNqZ3V6eHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMzg1OTAsImV4cCI6MjA1NDcxNDU5MH0.jdJDl_QoXDF-0_2FxQSt4qml-kj2jQtMmYsL4Vbk7Ks');

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(storedItems);
    calculateSummary(storedItems);
  }, []);

  const calculateSummary = (items) => {
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0);
    setTotal(totalPrice);
    setTotalItems(totalProducts);
  };

  const handleRemove = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    calculateSummary(updatedCart);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Your Cart</h1>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart Items Section */}
          <div className="md:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between">
                <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1 px-4">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary Section */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between text-lg">
              <p>Total Items:</p>
              <p>{totalItems}</p>
            </div>
            <div className="flex justify-between text-lg">
              <p>Subtotal:</p>
              <p>${total.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-xl font-bold mt-2">
              <p>Total:</p>
              <p>${total.toFixed(2)}</p>
            </div>
            <Link href="/checkout" passHref>
              <button className="w-full mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Your cart is empty. Start adding Item to it!</p>
      )}
    </div>
  );
}
