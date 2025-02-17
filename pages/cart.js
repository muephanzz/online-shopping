import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCartItems() {
      const { data, error } = await supabase.from("cart").select("*");

      if (error) {
        console.error("Error fetching cart:", error.message);
      } else {
        setCartItems(data);
      }
      setLoading(false);
    }

    fetchCartItems();
  }, []);

  const handleRemoveItem = async (id) => {
    const { error } = await supabase.from("cart").delete().eq("id", id);

    if (error) {
      console.error("Error removing item:", error.message);
    } else {
      setCartItems(cartItems.filter((item) => item.id !== id));
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", textAlign: "center" }}>
      <h1>Your Cart</h1>

      {loading ? (
        <p>Loading cart...</p>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item.id} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>
              <img
                src={item.image_url}
                alt={item.name}
                width="100px"
                style={{ borderRadius: "5px" }}
              />
              <h3>{item.name}</h3>
              <p style={{ fontWeight: "bold", color: "#0070f3" }}>${item.price}</p>
              <button
                onClick={() => handleRemoveItem(item.id)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#ff0000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => router.push("/checkout")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
