import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";

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
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="border rounded-lg shadow-sm hover:shadow-md transition">
              <CardContent>
                <Link href={`/product/${product.id}`}>
                  <img src={product.image_url || '/default-product.png'} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
                  <h2 className="mt-2 text-lg font-semibold text-gray-800">{product.name}</h2>
                  <p className="text-gray-600">${product.price}</p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
