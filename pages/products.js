import Link from "next/link"; 
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", textAlign: "center" }}>
      <h1>Available Products</h1>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "20px",
          marginTop: "20px"
        }}>
          {products.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{
                border: "1px solid #ddd", 
                padding: "15px", 
                borderRadius: "10px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                cursor: "pointer"
              }}>
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  width="100%" 
                  style={{ borderRadius: "10px", maxHeight: "200px", objectFit: "cover" }}
                />
                <h3>{product.name}</h3>
                <p style={{ fontWeight: "bold", color: "#0070f3" }}>${product.price}</p>
              </div>
            </Link>
      )}
    </div>
  );
}
