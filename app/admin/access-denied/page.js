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
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  return (
    <div className="p-5 text-center">
      <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
      {reason && <p className="mt-2 text-gray-700">Reason: {reason}</p>}
    </div>
  );
}
