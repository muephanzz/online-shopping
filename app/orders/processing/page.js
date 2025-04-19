"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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
        setStatus("Payment still pending. Please try again.");
      }
    };

    checkPayment();
  }, [tries, checkoutRequestId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-blue-600 mb-4">{status}</h1>
        <p className="text-gray-600">Please wait while we verify your payment...</p>
      </div>
    </div>
  );
}
