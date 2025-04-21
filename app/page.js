"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/ProductCard";
import TopSalesSection from "@/components/TopSales";
import Pagination from "@/components/Pagination";
import Footer from "@/components/Footer";
import UserChat from "@/components/UserChat";
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
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white min-h-screen">
      <main className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        {/* Top Sales */}
        <section className="mb-10 rounded-3xl border border-orange-200/30 backdrop-blur-md shadow-xl bg-white/5 p-4">
          <div className="mb-4">
            <TopSalesSection />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="mb-10 rounded-3xl border border-yellow-300/30 backdrop-blur-lg shadow-2xl bg-white/5 p-4">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(itemsPerPage)].map((_, i) => (
                <div key={i} className="bg-white/60 rounded-lg shadow animate-pulse p-3 space-y-3">
                  <div className="h-44 bg-gray-300 rounded-md"></div>
                  <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
                  <div className="h-3 w-5/6 bg-gray-300 rounded"></div>
                  <div className="h-4 w-1/2 bg-indigo-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-orange-100 to-yellow-50 py-2 shadow-2xl rounded-xl overflow-hidden col-span-2 sm:col-span-3 lg:col-span-4">
                <p className="text-lg px-2 font-bold text-gray-900">
                  Most Affordable price 🔥
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 mb-6">
                {products.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Pagination */}
        <div className="flex justify-center my-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* User Chat */}
        <UserChat />
      </main>

      <Footer />
    </div>
  );
}
