import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CategoryPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { category } = router.query; // Get category from URL
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        console.error("Error fetching categories:", error.message);
      } else {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchCategories();
  }, []);


  if (!category) return <p>Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 mt-20 mb-60">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Products in {category}
      </h1>

      {products.length === 0 ? (
        <p>No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <a href={`/products/${product.id}`} key={product.id} className="group">
              <div className="border rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
                <Image                   width={500} 
                  height={500}
                  unoptimized
                  src={product.image_urls?.[0] || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md"
                />
                <h3 className="mt-3 text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
                  {product.name}
                </h3>
                <p className="mt-1 font-bold text-blue-600">${product.price}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
