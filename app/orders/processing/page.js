"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ProcessingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutRequestId = searchParams.get("checkoutRequestId");

  const [status, setStatus] = useState("pending");
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkoutRequestId) {
      router.push("/orders/checkout?error=missing_request_id");
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment?checkoutRequestId=${checkoutRequestId}`);
        const data = await res.json();

        if (data.status === "paid") {
          setStatus("paid");
          setLoading(false);
          clearInterval(interval);

          // Redirect to success page after 3 seconds
          setTimeout(() => {
            router.push("/orders/checkout/success");
          }, 3000);
        } else {
          setTimeLeft((prev) => prev - 1);
        }

        if (timeLeft <= 1) {
          setLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
        setLoading(false);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [checkoutRequestId, timeLeft]);

  const handleRetry = () => {
    router.push("/orders/checkout");
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Processing Payment</h1>

      {loading && status === "pending" && (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-4"></div>
          <p className="mb-2 text-lg">Waiting for M-Pesa confirmation...</p>
          <p className="text-sm text-gray-500">Time remaining: {timeLeft}s</p>
        </>
      )}

      {!loading && status === "paid" && (
        <>
          <p className="text-green-600 text-xl font-semibold mb-4">Payment confirmed!</p>
          <p className="text-sm text-gray-500">Redirecting to confirmation page...</p>
        </>
      )}

      {!loading && status !== "paid" && (
        <>
          <p className="text-red-600 text-xl font-semibold mb-4">Payment not confirmed</p>
          <div className="flex gap-4">
            <button
              onClick={handleRetry}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Retry
            </button>
            <button
              onClick={handleBack}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Go Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
