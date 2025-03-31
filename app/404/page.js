"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const NotFoundContent = dynamic(() => import("../components/NotFoundContent"), { ssr: false });

export default function NotFoundPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <NotFoundContent />
    </Suspense>
  );
}
