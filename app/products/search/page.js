"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2 } from "lucide-react";
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';

export default function SearchPage() {
  const router = useRouter();
  const { query } = router.query;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (query) {
      fetchProducts(query, currentPage);
    }
  }, [query, currentPage]);

  const fetchProducts = async (searchTerm, page) => {
    setLoading(true);
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage - 1;

    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: "exact" }) // Get total count for pagination
      .ilike('name', `%${searchTerm}%`)
      .range(start, end);

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
      setTotalPages(Math.ceil(count / itemsPerPage));
    }

    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto pl-2 mt-28 mb-60">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
