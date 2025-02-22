import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("product_id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error.message);
      } else {
        setProduct(data);
        setMainImage(data.image_urls ? data.image_urls[0] : "");
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
  
    setAdding(true);
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
  
    if (sessionError) {
      console.error("Error fetching session:", sessionError.message);
      alert("Please log in to add items to cart.");
      setAdding(false);
      return;
    }
  
    const userId = session.user.id;
  
    // Check if item already exists in the cart
    const { data: existingCartItem, error: fetchError } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", product.product_id)
      .single();
  
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking cart:", fetchError.message);
      alert("Error adding to cart.");
      setAdding(false);
      return;
    }
  
    if (existingCartItem) {
      // Update the quantity instead of adding a new entry
      const { error: updateError } = await supabase
        .from("cart")
        .update({ quantity: existingCartItem.quantity + quantity })
        .eq("cart_id", existingCartItem.cart_id);
  
      if (updateError) {
        console.error("Error updating cart:", updateError.message);
        alert("Failed to update cart!");
      } else {
        alert(`Updated cart! Total: ${existingCartItem.quantity + quantity} items.`);
      }
    } else {
      // Insert as a new item if it doesn't exist
      const { error } = await supabase.from("cart").insert([
        {
          product_id: product.product_id,
          name: product.name,
          price: product.price,
          image_url: mainImage,
          quantity, // Correctly stores quantity
          user_id: userId,
        },
      ]);
  
      if (error) {
        console.error("Error adding to cart:", error.message);
        alert("Failed to add to cart!");
      } else {
        alert(`Added ${quantity} item(s) to cart!`);
      }
    }
  
    setAdding(false);
  };
  


  if (loading) return <p style={{ textAlign: "center" }}>Loading product...</p>;
  if (!product) return <p style={{ textAlign: "center" }}>Product not found!</p>;

  return (
    <div style={{ padding: "10px", marginTop: "100px" }}>
      <div className="inline gap-4">
        <a href="#description">Description</a>
        <a href="#reviews">Reviews</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-gray-200 p-4">
          {/* Main Image with Zoom Effect */}
          <div style={{ position: "relative", overflow: "hidden", borderRadius: "10px" }}>
            <img
              src={mainImage}
              alt={product.name}
              style={{ width: "400px", maxHeight: "400px", objectFit: "fill", transition: "transform 0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>

          {/* Small Images */}
          <div style={{ display: "flex", justifyContent: "", marginTop: "10px", gap: "10px" }}>
            {product.image_urls?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index}`}
                style={{ width: "70px", height: "70px", borderRadius: "5px", cursor: "pointer", border: mainImage === img ? "2px solid #0070f3" : "none" }}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="bg-gray-200 p-4">
          <p>{product.description || "No description available."}</p>
          <h1 style={{ color: "#0070f3", margin: "15px 0 15px" }}>{product.name}</h1>
          <h2 style={{ color: "#0070f3", margin: "15px 0 15px" }}>Price: Ksh{product.price}</h2>
          
          {/* Quantity Selector */}
          <div style={{ display: "flex", alignItems: "center", margin: "15px 0 15px" }}>
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))} 
              style={{ padding: "5px 15px", fontSize: "18px", background: "#ddd", border: "none", cursor: "pointer" }}>-
            </button>
            <span 
              style={{ padding: "0 15px", fontSize: "18px" }}>{quantity}
            </span>
            <button 
              onClick={() => setQuantity(q => q + 1)} 
              style={{ padding: "5px 15px", fontSize: "18px", background: "#ddd", border: "none", cursor: "pointer" }}>+
            </button>
          </div>

          {/* Buttons */}
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
      </div>
    </div>
  );
}
