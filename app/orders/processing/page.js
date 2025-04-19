"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProcessingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutRequestId = searchParams.get("checkoutRequestId");
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    if (!checkoutRequestId) return;

    const interval = setInterval(async () => {
      const res = await fetch("/api/mpesa/check-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutRequestId }),
      });

      const data = await res.json();

      if (data.status === "paid") {
        clearInterval(interval);
        router.push("/orders/success");
      } else if (data.status === "failed") {
        clearInterval(interval);
        router.push("/orders/failed");
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [checkoutRequestId, router]);

  return (
    <div className="h-screen flex flex-col justify-center items-center text-center">
      <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
      <p className="text-lg font-semibold">Processing your payment...</p>
      <p className="text-sm text-gray-500">Do not close this page.</p>
    </div>
  );
}
