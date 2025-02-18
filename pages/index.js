import Link from "next/link"; 
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Loader2 } from "lucide-react"; // Import a loading spinner

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 mt-12">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Available Products</h1>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id} className="group">
              <div className="border rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
                {/* Display First Image Only */}
                <img 
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