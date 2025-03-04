import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Loader2 } from "lucide-react"; // Import a loading spinner
import Image from "next/image";

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
    <div className="max-w-7xl mx-auto px-4 py-10 mt-20 mb-60">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-12">Our Products</h1>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">No products available. Please check back later.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link href={`/products/${product.product_id}`} key={product.product_id} className="group">
              <div className="border rounded-2xl shadow-lg p-6 hover:shadow-xl transition-transform transform hover:scale-105 duration-300">
                {/* Display First Image Only */}
                <div className="overflow-hidden rounded-lg">
                  <Image
                    src={product.image_urls?.[0] || "/placeholder.jpg"}
                    alt={product.name || "Product Image"}
                    className="w-full h-48 object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                    width={500}
                    height={500}
                    unoptimized // If using external URLs like Supabase
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="mt-2 text-lg font-bold text-blue-600">${product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
