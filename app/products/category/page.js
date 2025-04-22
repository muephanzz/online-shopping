"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import { motion } from "framer-motion";

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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin blur-sm"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-400 animate-spin"></div>
        </div>
      </div>
    );

  if (!category_id)
    return (
      <div className="text-center text-lg text-gray-700 py-20">
        Please select a category to view products.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 mt-24">
      <motion.div
        className="bg-gradient-to-r from-orange-100 to-yellow-50 shadow-xl rounded-2xl px-6 py-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
          Products in <span className="text-orange-600">{categoryName}</span> Category
        </h1>
      </motion.div>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-lg">
          No products found in this category.
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id || `product-${index}`}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      )}
    </div>
  );
}
