"use client";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import ProductCard from "./components/ProductCard";
import FlashSale from "./components/FlashSale";
import { Loader2 } from "lucide-react";
import Pagination from "./components/Pagination";
import Footer from "./components/Footer";
import UserChat from './components/UserChat';
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
    <div className="pb-2 mt-20">  
      {loading ? (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
      ) : (
        <>
        <FlashSale/>
          <div className="relative p-2 mt-28 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>

          <UserChat />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      <div>
        <Footer />
      </div>
    </div>
  );
}
