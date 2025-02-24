import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { Loader2 } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    async function fetchCartItems() {
      const { data, error } = await supabase.from("cart").select("*");

      if (error) {
        console.error("Error fetching cart:", error.message);
        setError("");  
      } else {
        setCartItems(data);
      }
      setLoading(false);
    }

    fetchCartItems();
  }, []);

  const handleCheckout = async () => {
    if (!name || !address ||!phone || !email) {
      alert("Please fill in all details!");
      return;
    }

    setProcessing(true);

    // Send data to backend for Stripe payment processing
    const res = await fetch("/api/checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItems, name, address, email }),
    });

    const session = await res.json();
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: session.id });

    setProcessing(false);
  };

  return (
    <div className="bg-white pb-8 px-4 rounded-2xl shadow-xl text-center"
      style={{ maxWidth: "768px", margin: "100px auto" }}  
    >
      <h1 className="border-b border-gray-200 text-xl font-semibold">Checkout</h1>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div className="inline-block" key={item.id} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>
            <div>
              <Image
                unoptimized
                src={item.image_url} 
                alt={item.name} 
                width={200} height={200} 
              />
            </div>
              <div>
                <h3>{item.name}</h3>
                <p style={{ fontWeight: "bold", color: "#0070f3" }}>${item.price}</p>
              </div>
            </div>
          ))}

          <div style={{ marginTop: "20px", textAlign: "left" }}>
            <h3 className="py-4 text-xl font-semibold">Shipping Details</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              className="w-full p-2 border rounded-md"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              className="w-full p-2 border rounded-md"
              maxLength={10}
            />
            {error && <p style={{ color: "red" }}>{error}</p>}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
              className="border rounded-md"
            />

            <label className="p-2">Choose Shipping Address</label>
            <table><tbody><tr><td><select
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              className="w-full mt-2 mb-4 p-2 border rounded-md"
            >
              <option value="Muranga">Murang'a Town Near Magunas Supermarket</option>
              <option value="Embu">Embu Town Near Magunas Supermarket</option>
              <option value="Kiambu">Kiambu Town Near Magunas Supermarket</option>
              <option value="Chuka">Chuka Town Near Magunas Supermarket</option>
            </select></td></tr></tbody></table>
            
            </div>
          <button
            onClick={handleCheckout}
            disabled={processing}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {processing ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      )}
    </div>
  );
}
