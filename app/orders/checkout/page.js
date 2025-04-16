"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Checkout() {
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [amount, setAmount] = useState(0);
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [email, setEmail] = useState(""); // ✅ auto-filled from profiles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("checkoutItems")) || [];
    setCheckoutItems(items);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setAmount(total);
  }, []);

  useEffect(() => {
    const fetchEmail = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", userData.user.id)
        .single();

      if (!profileError && profile?.email) {
        setEmail(profile.email);
      }
    };

    fetchEmail();
  }, []);

  const isValidPhone = (phone) => /^2547\d{8}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidPhone(phone)) {
      setError("Please enter a valid phone number (format: 2547...)");
      return;
    }

    if (!email || !email.includes("@")) {
      setError("Please Login to purchase this Product.");
      return;
    }

    if (checkoutItems.length === 0) {
      setError("No items found for checkout.");
      return;
    }

    setLoading(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error("User not authenticated");

      const user = userData.user;

      const res = await fetch("/api/mpesa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          phone,
          user_id: user.id,
          checkoutItems,
          shipping_address: shippingAddress,
          email, // ✅ auto-filled
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(`/orders/processing?checkoutRequestId=${data.checkoutRequestId}`);
      } else {
        setError(data.message || "Payment initiation failed.");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

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
                priority={index === 0}
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium">{item.name}</h3>
                <p className="text-gray-700">Quantity: {item.quantity}</p>
                <p className="text-blue-600 font-bold">Ksh {item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

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
