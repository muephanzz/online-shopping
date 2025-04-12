"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import ProductCard from "./components/ProductCard";
import TopSalesSection from "./components/TopSales";
import Pagination from "./components/Pagination";
import Footer from "./components/Footer";
import UserChat from "./components/UserChat";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;

      const { data, count, error } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .range(start, end);

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      setLoading(false);
    }

    fetchProducts();
  }, [currentPage]);

  return (
    <div className="mt-20 pb-10">
      {/* Top Sales */}
      <section className="border-2 border-orange-300 shadow-lg rounded-xl px-4 py-3 bg-white grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 py-2">
        <div className="col-span-2 sm:col-span-3 lg:col-span-4">
          <TopSalesSection />
        </div>

        {products.slice(0, 10).map((product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </section>


      {/* Product Grid */}
      <section className="p-4 mt-10 border-2 border-orange-300 shadow-lg rounded-xl px-4 py-3 bg-white">
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin blur-sm"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-400 animate-spin"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              <p className="text-sm font-semibold text-orange-600 pb-1 col-span-2 sm:col-span-3 lg:col-span-4">
                  🔥 Top deals with affordable price
                </p>
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </section>

      {/* User Chat */}
      <UserChat />

      {/* Footer */}
      <Footer />
    </div>
  );
}
