"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Checkout() {
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [amount, setAmount] = useState(0);
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("checkoutItems")) || [];
    setCheckoutItems(items);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setAmount(total);
  }, []);

  const isValidPhone = (phone) => /^2547\d{8}$/.test(phone);

  async function handleMpesaPayment(e) {
    e.preventDefault();
    if (!isValidPhone(phone)) return alert("Please enter a valid phone number (format: 2547...)");
    if (checkoutItems.length === 0) return alert("No items found for checkout.");

    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error("User not authenticated");

      const user = userData.user;

      const response = await fetch("/api/mpesa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          phone,
          user_id: user.id,
          checkoutItems,
          shipping_address: shippingAddress,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "M-Pesa Payment Failed");

      router.push(`/orders/stk-countdown?phone=${phone}`);
    } catch (error) {
      alert("Payment Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-20 pt-20 flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Checkout</h2>

        <div className="space-y-6">
          {checkoutItems.map((item, index) => (
            <div key={index} className="flex items-center gap-4 border-b pb-4">
              <Image
                src={item.image_url}
                width={80}
                height={80}
                className="rounded-lg object-cover"
                alt={item.name}
                priority={index === 0} // prioritize first image for LCP
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium">{item.name}</h3>
                <p className="text-gray-700">Quantity: {item.quantity}</p>
                <p className="text-blue-600 font-bold">Ksh {item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleMpesaPayment} className="space-y-4 mt-6">
          <div>
            <label>Total Payable (Ksh)</label>
            <input
              type="number"
              value={amount}
              readOnly
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label>Shipping Address</label>
            <select
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="">Select your campus</option>
              <option value="Murang'a University">Murang'a University</option>
              <option value="Karatina University">Karatina University</option>
            </select>
          </div>
          <div>
            <label>Your Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g. 254712345678"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-lg text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
