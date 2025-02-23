import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { Loader2 } from "lucide-react"
import Image from 'next/image';

export default function SearchPage() {
  const router = useRouter();
  const { query } = router.query;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      fetchProducts(query);
    }
  }, [query]);

  const fetchProducts = async (searchTerm) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products') // Replace 'products' with your table name
      .select('*')
      .ilike('name', `%${searchTerm}%`); // Assumes 'name' is the column for product names

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto pl-2 mt-28 mb-60">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id} className="group">
              <div className="border rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
                {/* Display First Image Only */}
                <Image                   width={500} 
                  height={500}
                  unoptimized 
                  src={product.image_urls?.[0] || "/placeholder.jpg"} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded-md"
                />
                <h3 className="mt-3 text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">{product.name}</h3>
                <p className="mt-1 font-bold text-blue-600">${product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
