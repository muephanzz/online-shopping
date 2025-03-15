import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      const { data, error } = await supabase.from("cart").select("*");
      if (error) console.error("Error fetching cart:", error);
      else setCartItems(data);
      
      // Calculate total amount
      const total = data.reduce((sum, item) => sum + item.price * item.quantity, 0);
      setAmount(total);
      
      setLoading(false);
    };

    fetchCart();
  }, []);

  async function handleMpesaPayment(e) {
    e.preventDefault();
    setMessage("Processing payment...");

    try {
      const response = await fetch("/api/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, phone }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "M-Pesa Payment Failed");

      setMessage("Payment successful! Transaction ID: " + data.ConversationID);
    } catch (error) {
      setMessage("Payment failed: " + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Checkout</h2>
        
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          <form onSubmit={handleMpesaPayment} className="space-y-4">
            <div>
              <label className="block text-gray-700">Amount (Ksh)</label>
              <input type="number" value={amount} readOnly className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-gray-700">Your Phone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 254712345678" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200">
              Pay Now
            </button>
          </form>
        )}
        
        {message && <p className="text-center mt-4 text-gray-800">{message}</p>}
      </div>
    </div>
  );
}
