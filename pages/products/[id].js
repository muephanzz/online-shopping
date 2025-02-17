import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error.message);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAdding(true);

    // Insert product into the cart table
    const { error } = await supabase.from("cart").insert([
      {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: 1, // Default to 1 item in cart
      },
    ]);

    if (error) {
      console.error("Error adding to cart:", error.message);
      alert("Failed to add to cart!");
    } else {
      alert("Added to cart!");
    }

    setAdding(false);
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading product...</p>;
  if (!product) return <p style={{ textAlign: "center" }}>Product not found!</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center" }}>
      <h1>{product.name}</h1>
      <img
        src={product.image_url}
        alt={product.name}
        width="100%"
        style={{ borderRadius: "10px", maxHeight: "300px", objectFit: "cover" }}
      />
      <h2 style={{ color: "#0070f3" }}>${product.price}</h2>
      <p>{product.description || "No description available."}</p>

      <button
        onClick={handleAddToCart}
        disabled={adding}
        style={{
          padding: "10px 20px",
          backgroundColor: "#ff6600",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "10px",
        }}
      >
        {adding ? "Adding..." : "Add to Cart"}
      </button>

      <button
        onClick={() => router.push("/cart")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        View Cart
      </button>
    </div>
  );
}
