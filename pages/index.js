import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

const supabase = createClient('https://znjrafazpveysjguzxri.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuanJhZmF6cHZleXNqZ3V6eHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMzg1OTAsImV4cCI6MjA1NDcxNDU5MH0.jdJDl_QoXDF-0_2FxQSt4qml-kj2jQtMmYsL4Vbk7Ks');

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Featured Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="relative group border rounded-2xl shadow-md overflow-hidden">
            <Link href={`/product/${product.id}`}>
              <div>
              <Image 
                  src={product.images && product.images[0] ? product.images[0] : '/default-image.jpg'} 
                  alt={product.name} 
                  width={300} 
                  height={300}  
                  className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-1">{product.name}</h2>
                  <p className="text-green-600 text-lg font-bold">${product.price}</p>
                </div>
              </div>
            </Link>
            <button 
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ShoppingCart className="w-6 h-6 mr-2" /> Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}