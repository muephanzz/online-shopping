"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProcessingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutRequestId = searchParams.get("checkoutRequestId");

  const [status, setStatus] = useState("Checking payment...");
  const [tries, setTries] = useState(0);

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
        router.push("/orders/success");
      } else if (tries < 5) {
        setTimeout(() => setTries((t) => t + 1), 5000);
      } else {
        setStatus("We couldn’t process your payment. Please try again.");
      }
    };

    checkPayment();
  }, [tries, checkoutRequestId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <Loader2 className="animate-spin mx-auto text-blue-600 w-12 h-12 mb-4" />
        <h1 className="text-2xl font-semibold text-blue-700 mb-2">{status}</h1>
        {tries >= 5 && (
          <div className="mt-4 space-y-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
            <button
              className="text-sm text-gray-500 underline"
              onClick={() => router.push("/checkout")}
            >
              Go back to checkout
            </button>
          </div>
        )}
        {tries < 5 && (
          <>
            <p className="text-gray-600">
              Do not close this page. We’re verifying your payment via M-Pesa.
            </p>
            <p className="text-sm text-gray-400 mt-2">Attempt {tries + 1}/6</p>
          </>
        )}
      </div>
    </div>
  );
}
