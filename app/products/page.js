"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const category_id = searchParams.get("category_id"); // Get category from URL
  const page = parseInt(searchParams.get("page")) || 1; // Get page number, default to 1

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

  if (loading) return <p>Loading products...</p>;
  if (!category_id) return <p>Please select a category.</p>;

  return (
    <Suspense>
    <div className="p-6 mt-20">
      <h1 className="sm:text-3xl text-2xl font-bold mb-6">
        Products in {categoryName} Category
      </h1>

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
    </Suspense>
  );
}
