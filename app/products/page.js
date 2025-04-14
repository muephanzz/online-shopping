"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const category_id = searchParams.get("category_id");
  const page = parseInt(searchParams.get("page")) || 1;
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  const productsPerPage = 8;
  const currentPage = page;

  useEffect(() => {
    const fetchCategoryName = async () => {
      if (!category_id) return;
      const { data, error } = await supabase
        .from("categories")
        .select("category")
        .eq("id", category_id)
        .single();

      if (error) console.error("Error fetching category:", error);
      else setCategoryName(data?.category || "Unknown Category");
    };

    const fetchProducts = async () => {
      if (!category_id) return;
      setLoading(true);

      const from = (currentPage - 1) * productsPerPage;
      const to = from + productsPerPage - 1;

      const { data, error, count } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("category_id", category_id)
        .range(from, to);

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
        setTotalProducts(count || 0);
      }

      setLoading(false);
    };

    fetchCategoryName();
    fetchProducts();
  }, [category_id, currentPage]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  if (loading) return
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin blur-sm"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-400 animate-spin"></div>
      </div>
    </div>;
    
  if (!category_id) return <p>Please select a category.</p>;

  return (
    <div className="border-2 border-orange-300 shadow-lg rounded-xl bg-white mb-6 sm:mt-20 mt-20 md:mt-28">
      <div className="bg-gradient-to-r from-orange-100 to-yellow-50 py-2 shadow-2xl rounded-xl overflow-hidden col-span-2 sm:col-span-3 lg:col-span-4">      
        <h1 className="text-lg px-2 font-bold text-gray-900">
          Products in {categoryName} Category
        </h1>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-600">No products found in this category.</p>
      ) : (
        <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id || `product-${index}`} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      )}
    </div>
  );
}
