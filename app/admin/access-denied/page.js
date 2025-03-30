"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AccessDeniedContent />
    </Suspense>
  );
}

function AccessDeniedContent() {
  // Use dynamic import to prevent pre-rendering issues
  return (
    <Suspense fallback={<p>Loading details...</p>}>
      <AccessDeniedMessage />
    </Suspense>
  );
}

function AccessDeniedMessage() {
  const searchParams = useSearchParams();
  const reason = searchParams?.get("reason") || "You do not have access.";

  return (
    <div className="p-5 text-center">
      <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
      {reason && <p className="mt-2 text-gray-700">Reason: {reason}</p>}
    </div>
  );
}
