import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProductsPage() {
  const router = useRouter();
  const { category_id, page = 1 } = router.query;

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  const productsPerPage = 8;
  const currentPage = parseInt(page) || 1;

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category_id) return;

      setLoading(true);

      const from = (currentPage - 1) * productsPerPage;
      const to = from + productsPerPage - 1;

      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('category_id', category_id)
        .range(from, to);

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
        setTotalProducts(count || 0);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [category_id, currentPage]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  if (loading) return <p>Loading products...</p>;
  if (!category_id) return <p>Please select a category.</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {products.length === 0 ? (
        <p>No products found for this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => router.push(`/products?category_id=${category_id}&page=${page}`)}
      />
    </div>
  );
}
