import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      const { data: session, error } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
      } else {
        console.error("No user session found:", error);
      }
    }

    fetchSession();

    async function fetchCartItems() {
      if (user) {
        const { data, error } = await supabase
          .from("cart")
          .select("*")
          .eq("user_id", user.id);  // Fetch cart items for the logged-in user

        if (error) {
          console.error("Error fetching cart:", error.message);
        } else {
          setCartItems(data);
        }
      }
      setLoading(false);
    }

    if (user) {
      fetchCartItems();
    }

  }, [user]);

  const handleRemoveItem = async (id) => {
    const { error } = await supabase.from("cart").delete().eq("id", id);

    if (error) {
      console.error("Error removing item:", error.message);
    } else {
      setCartItems(cartItems.filter((item) => item.id !== id));
    }
  };

  return (
    <div style={{ marginBottom: "20%", paddingTop: "14%", maxWidth: "800px", margin: "auto", textAlign: "center" }}>
      <h1>Your Cart</h1>

      {loading ? (
        <p>Loading cart...</p>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item.id} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>
            <Image 
              src={product.image_url} 
              alt={product.name} 
              width={200} height={200} 
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
