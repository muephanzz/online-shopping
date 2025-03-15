// components/CheckoutForm.js
import { useState } from "react";

export default function CheckoutForm({ onSubmit }) {
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone) {
      alert("Please enter your phone number.");
      return;
    }
    console.log("Phone submitted:", phone);
    onSubmit(phone); // ✅ Pass phone to parent
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="phone" className="block font-semibold">
        Phone Number (e.g., 2547XXXXXXXX):
      </label>
      <input
        type="text"
        id="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter your phone number"
        required
        className="p-2 border rounded"
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Pay with M-Pesa
      </button>
    </form>
  );
}
