"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentProcessing() {
  const [status, setStatus] = useState("pending"); // "pending", "success", "failed"
  const [message, setMessage] = useState("Waiting for payment confirmation...");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutRequestId = searchParams.get("checkoutRequestId");

  useEffect(() => {
    if (!checkoutRequestId) return;

    let attempts = 0;
    const maxAttempts = 6;

    const interval = setInterval(async () => {
      attempts++;
      const res = await fetch("/api/check-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutRequestId }),
      });

      const data = await res.json();

      if (data.status === "paid") {
        clearInterval(interval);
        setStatus("success");
        setMessage("Payment received successfully!");
        setTimeout(() => router.push("/orders/success"), 2000);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        setStatus("failed");
        setMessage("We couldn't verify your payment in time.");
        setLoading(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [checkoutRequestId]);

  const handleRetry = () => {
    setStatus("pending");
    setLoading(true);
    setMessage("Retrying payment check...");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white shadow-xl rounded-2xl p-6 text-center space-y-6"
      >
        <h2 className="text-2xl font-bold text-blue-700">Processing Payment</h2>

        <p className="text-gray-600">{message}</p>

        {status === "pending" && (
          <motion.div
            className="flex justify-center"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </motion.div>
        )}

      {status === "failed" && (
        <div className="space-y-4">
          <p className="text-red-600 font-semibold">We couldn't confirm your payment in time.</p>
          <p className="text-gray-600 text-sm">
            If you completed payment manually, kindly forward your M-Pesa message to <strong>0712 345 678</strong> or use the Paybill method below.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-left text-sm text-gray-700">
            <p><strong>Paybill:</strong> 123456</p>
            <p><strong>Account No:</strong> Your Order ID</p>
            <p><strong>Amount:</strong> Exact order total</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={() => router.push("/")}
              className="border border-gray-400 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      )}
      </motion.div>
    </div>
  );
}
