import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { Loader2, Trash2 } from "lucide-react";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user session and cart items
    async function fetchSessionAndCart() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
  
      if (error) {
        console.error("Error fetching session:", error.message);
      } else if (session?.user) {
        setUser(session.user);
  
        // Fetch cart items along with product details
        const { data, error: cartError } = await supabase
          .from("cart")
          .select("*")
          .eq("user_id", session.user.id);
  
        if (cartError) {
          console.error("Error fetching cart:", cartError.message);
        } else {
          console.log("Fetched Cart Items:", data); // Debugging line
          setCartItems(data);
        }
      }
      setLoading(false);
    }
  
    fetchSessionAndCart();
  }, []);
  

  const handleRemoveItem = async (cart_id) => {
    const { error } = await supabase.from("cart").delete().eq("cart_id", cart_id);

    if (error) {
      console.error("Error removing item:", error.message);
    } else {
      setCartItems(cartItems.filter((item) => item.cart_id !== cart_id));
    }
  };
  return (
    <div className="mt-24 mb-60 text-center pt-4 max-w-md mx-auto">
      <h1 className="pb-4 text-3xl font-semibold">Your Cart</h1>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : cartItems.length === 0 ? (
        <>
          <p>Oooops! Your cart is empty.</p>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Add Products
          </button>
        </>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={item.cart_id}
              className="flex flex-col md:flex-row items-center border-b pb-4"
            >
              <img
                src={item.image_url}
                alt={item.name}
                width={200}
                height={200}
              />
              <h3>{item.name}</h3>
              <p style={{ fontWeight: "bold", color: "#0070f3" }}>
                ${item.price}
              </p>
              <button
                onClick={() => handleRemoveItem(item.cart_id)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Remove
              </button>
            </div>
          ))}
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
      )}
    </div>
  );
}
