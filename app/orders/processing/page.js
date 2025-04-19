"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentProcessing() {
  const [status, setStatus] = useState<"pending" | "paid" | "failed">("pending");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30); // seconds
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutRequestId = searchParams.get("checkoutRequestId");

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Poll payment status every 5s
  useEffect(() => {
    if (!checkoutRequestId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?checkoutRequestId=${checkoutRequestId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkoutRequestId }),
        });
        const data = await res.json();

        if (data.status === "paid") {
          clearInterval(interval);
          setStatus("paid");

          // 🔔 Push Notification
          if (Notification.permission === "granted") {
            new Notification("✅ Payment Successful", {
              body: "Your order has been confirmed!",
              icon: "/success-icon.png", // optional
            });

            const audio = new Audio("/success-sound.mp3");
            audio.play().catch(() => {}); // silent fail
          }

          // Redirect after short delay
          setTimeout(() => router.push("/orders/success"), 1500);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setStatus("failed");
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Try again.");
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [checkoutRequestId]);

  // Countdown timer
  useEffect(() => {
    if (status !== "pending") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus("failed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const progress = ((30 - countdown) / 30) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="text-center space-y-6 max-w-md mx-auto">
        {status === "pending" && (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
            </motion.div>
            <h2 className="text-xl font-semibold">Waiting for payment confirmation...</h2>
            <p className="text-sm text-gray-500">This might take up to 30 seconds.</p>
            <div className="relative h-3 w-full bg-gray-200 rounded-lg overflow-hidden">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
            <p className="text-sm text-gray-400">{countdown}s remaining...</p>
          </>
        )}

        {status === "failed" && (
          <>
            <h2 className="text-xl font-bold text-red-600">Payment Failed</h2>
            <p className="text-sm text-gray-600">Your payment could not be confirmed.</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => router.push("/checkout")}
                className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <ArrowLeft className="inline w-4 h-4 mr-1" /> Back to Checkout
              </button>
              <button
                onClick={() => router.refresh()}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center"
              >
                <RefreshCw className="inline w-4 h-4 mr-1" /> Retry
              </button>
            </div>
          </>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
}
