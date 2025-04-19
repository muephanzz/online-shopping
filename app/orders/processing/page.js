"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ProcessingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutRequestId = searchParams.get("checkoutRequestId");

  const [status, setStatus] = useState("Checking payment...");
  const [tries, setTries] = useState(0);
  const [icon, setIcon] = useState(<Loader2 className="animate-spin w-12 h-12 text-blue-500" />);

  useEffect(() => {
    const checkPayment = async () => {
      if (!checkoutRequestId) return;

      const res = await fetch("/api/mpesa/check-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutRequestId }),
      });

      const data = await res.json();

      if (data.status === "paid") {
        setIcon(<CheckCircle className="text-green-500 w-12 h-12" />);
        setStatus("Payment confirmed! Redirecting...");
        setTimeout(() => router.push("/orders/success"), 2000);
      } else if (tries < 5) {
        setTimeout(() => setTries((t) => t + 1), 5000);
      } else {
        setStatus("Payment still pending. Please try again.");
        setIcon(<AlertCircle className="text-yellow-500 w-12 h-12" />);
      }
    };

    checkPayment();
  }, [tries, checkoutRequestId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50"
    >
      <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex justify-center mb-4">{icon}</div>
        <h1 className="text-2xl font-bold text-blue-600 mb-2">{status}</h1>
        <p className="text-gray-500 text-sm">Please wait while we verify your payment...</p>
      </div>
    </motion.div>
  );
}