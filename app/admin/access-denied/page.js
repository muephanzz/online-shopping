"use client"; // Ensure this runs on the client side

import { useSearchParams } from "next/navigation";

export default function AccessDeniedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "You do not have access.";

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-gray-700 mt-2">{reason}</p>
      </div>
    </div>
  );
}
