"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const STKCountdown = () => {
  const [countdown, setCountdown] = useState(30); // 30 seconds timeout
  const [status, setStatus] = useState("Waiting for payment...");
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    if (countdown === 0) {
      clearInterval(interval);
      checkPaymentStatus();
    }

    return () => clearInterval(interval);
  }, [countdown]);

  async function checkPaymentStatus() {
    try {
      const response = await fetch("/api/check-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      if (data.success) {
        setStatus("Payment Successful!");
        setPaymentSuccess(true);
        setTimeout(() => router.push("/orders/order-confirmation"), 3000);
      } else {
        setStatus("Payment Failed! Returning to checkout...");
        setPaymentSuccess(false);
        setTimeout(() => router.push("/orders/checkout"), 3000);
      }
    } catch (error) {
      setStatus("Error verifying payment. Try again later.");
      setPaymentSuccess(false);
      setTimeout(() => router.push("/orders/checkout"), 3000);
    }
  }

  // Calculate progress percentage
  const progress = (countdown / 30) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Processing Payment...</h2>
      <p className="text-gray-600">Check your phone to complete the payment.</p>

      {/* Countdown Wheel */}
      <div className={`relative flex items-center justify-center mt-6 w-40 h-40 ${countdown <= 5 ? "animate-pulse" : ""}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="blue"
            strokeWidth="8"
            strokeDasharray="283"
            strokeDashoffset={(progress / 100) * 283}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${countdown <= 5 ? "text-red-600 animate-ping" : "text-blue-600"}`}>
          {countdown}s
        </div>
      </div>

      {/* Status Message */}
      <p className={`mt-4 text-lg font-semibold ${paymentSuccess === null ? "text-gray-700" : paymentSuccess ? "text-green-600" : "text-red-600"}`}>
        {status}
      </p>
    </div>
  );
};

export default STKCountdown;
