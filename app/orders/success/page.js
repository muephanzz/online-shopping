// app/orders/success/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function SuccessPage() {
  const router = useRouter();
  const { width, height } = useWindowSize();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/orders/completed");
    }, 10000); // Auto-redirect in 10 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Confetti width={width} height={height} numberOfPieces={300} />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-lg rounded-xl p-6 text-center space-y-6 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-green-600">🎉 Payment Successful!</h2>
        <p className="text-gray-700">Thank you for your order. We're preparing your items now!</p>
        <button
          onClick={() => router.push("/")}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Continue Shopping
        </button>
      </motion.div>
    </div>
  );
}
