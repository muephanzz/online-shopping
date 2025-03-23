import { useState } from "react";

export default function CheckoutForm() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !amount) {
      alert("Please enter phone number and amount.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/mpesa/stkPush", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, amount }),
    });

    const data = await response.json();
    alert(data.ResponseDescription || "Payment request sent!");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 max-w-md mx-auto border rounded">
      <h2 className="text-lg font-semibold">M-Pesa Checkout</h2>
      <label className="block font-semibold">Phone Number:</label>
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter your phone number"
        className="p-2 border rounded w-full"
      />
      <label className="block font-semibold">Amount:</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        className="p-2 border rounded w-full"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded w-full"
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay with M-Pesa"}
      </button>
    </form>
  );
}
