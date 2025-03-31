"use client";
import { useSearchParams } from "next/navigation";

export default function NotFoundContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Page Not Found.";

  return (
    <div className="p-5 text-center">
      <h1 className="text-2xl font-bold text-red-600">404 - Not Found</h1>
      <p className="mt-2 text-gray-700">{message}</p>
    </div>
  );
}
