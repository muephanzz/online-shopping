"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const STKcountdown = () => {
  const [countdown, setCountdown] = useState(30);
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
      checkPaymentStatus();  // Immediately check payment status when countdown reaches 0
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
        setStatus("✅ Payment Successful!");
        setPaymentSuccess(true);
        
        // Delay the confirmation page redirection by 6 seconds
        setTimeout(() => router.push("/orders/order-confirmation"), 12000);
      } else {
        setStatus("❌ Payment Failed! Redirecting...");
        setPaymentSuccess(false);
        
        // Delay the redirect back to checkout by 6 seconds
        setTimeout(() => router.push("/orders/checkout"), 12000);
      }
    } catch (error) {
      setStatus("⚠️ Error verifying payment.");
      setPaymentSuccess(false);
      
      // Delay the redirect back to checkout by 6 seconds
      setTimeout(() => router.push("/orders/checkout"), 6000);
    }
  }

  const progress = (countdown / 30) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Processing Payment...</h2>
      <p className="text-gray-600 mb-4">Please check your phone to complete the M-Pesa payment.</p>

      <div className={`relative flex items-center justify-center mt-6 w-32 h-32 ${countdown <= 5 ? "animate-pulse" : ""}`}>
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
        <div className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${countdown <= 5 ? "text-red-600 animate-ping" : "text-blue-600"}`}>
          {countdown}s
        </div>
      </div>

      <p className={`mt-4 text-lg font-medium ${paymentSuccess === null ? "text-gray-700" : paymentSuccess ? "text-green-600" : "text-red-600"}`}>
        {status}
      </p>
    </div>
  );
};

export default STKcountdown;
