import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      const { data, error } = await supabase.from("cart").select("*");
      if (error) console.error("Error fetching cart:", error);
      else setCartItems(data);
      
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

      setMessage("Payment request sent. Please check your phone to complete the transaction.");
    } catch (error) {
      setMessage("Payment failed: " + error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Checkout</h2>

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : (
          <form onSubmit={handleMpesaPayment} className="space-y-4">
            <div>
              <label>Total payable (Ksh)</label>
              <input type="number" value={amount} readOnly className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label>Your Phone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. 254712345678" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">Pay Now</button>
          </form>
        )}

        {message && <p className="text-center mt-4">{message}</p>}
      </div>
    </div>
  );
}
