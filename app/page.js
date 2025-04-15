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
    <div className="sm:pt-20 pt-20 md:pt-22 bg-black lg:pt-28">
      <main className="bg-black min-h-screen flex flex-col items-center justify-center px-0 sm:px-4 lg:px-4">
        <section className="border-2 border-orange-300 shadow-lg bg-white mb-6">
        <div className="col-span-2 sm:col-span-3 lg:col-span-4">
            <TopSalesSection />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4">
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </section>


        {/* Product Grid */}
        <section className="border-2 border-orange-300 shadow-lg bg-white mb-6">
          {loading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <div className="relative w-12 h-12 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin blur-sm"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-400 animate-spin"></div>
              </div>
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
      <div className="m-4">
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
