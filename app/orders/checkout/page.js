"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Checkout() {
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [amount, setAmount] = useState(0);
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [email, setEmail] = useState("");
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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", userData.user.id)
        .single();

      if (profile?.email) {
        setEmail(profile.email);
      }
    };
    fetchEmail();
  }, []);

  const isValidPhone = (phone) => /^07\d{8}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidPhone(phone)) {
      setError("Please enter a valid phone number (format: 07...)");
      return;
    }

    if (checkoutItems.length === 0) {
      setError("No items found for checkout.");
      return;
    }

    setLoading(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error("Please log in to Purchase this Item!");

      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          phone,
          user_id: userData.user.id,
          checkoutItems,
          shipping_address: shippingAddress,
          email,
        }),
      });

      const data = await res.json();

      if (res.ok && data.checkoutRequestId) {
        router.push(`/orders/processing?checkoutRequestId=${data.checkoutRequestId}`);
      } else {
        setError(data.error || "Payment initiation failed.");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-xl transition-all duration-500">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Secure Checkout</h2>

        {email && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm mb-4">
            <p className="text-gray-700">Logged in as <strong>{email}</strong></p>
          </div>
        )}

        <div className="space-y-4">
          {checkoutItems.map((item, i) => (
            <div key={i} className="flex items-center gap-4 border-b pb-4">
              <Image
                src={item.image_url}
                width={80}
                height={80}
                className="rounded-xl object-cover"
                alt={item.name}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                <p className="text-sm font-bold text-blue-600">Ksh {item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 my-6 space-y-1">
          <p className="flex justify-between text-sm"><span>Subtotal</span><span>Ksh {amount.toFixed(2)}</span></p>
          <p className="flex justify-between text-sm"><span>Shipping</span><span>FREE</span></p>
          <hr />
          <p className="flex justify-between font-bold text-gray-900"><span>Total</span><span>Ksh {amount.toFixed(2)}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Shipping Address</label>
            <select
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select your campus</option>
              <option value="Murang'a University">Murang'a University</option>
              <option value="Karatina University">Karatina University</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Your Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="e.g. 0712345678"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className={`w-full py-3 flex items-center justify-center rounded-xl font-semibold text-white ${
              loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } transition-all duration-300`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
