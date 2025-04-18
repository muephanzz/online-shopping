"use client";

import { useEffect, useState } from "react";

export default function TopSalesSection() {
  const [timeLeft, setTimeLeft] = useState(null);

  function getTimeRemaining() {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const total = endOfDay.getTime() - now.getTime();

    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);

    return { hours, minutes, seconds };
  }

  useEffect(() => {
    // Only set initial value on client
    setTimeLeft(getTimeRemaining());

    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) return null; // avoid SSR mismatch

  return (
    <div className="bg-gradient-to-r from-orange-100 to-yellow-50 py-2 shadow-2xl rounded-xl overflow-hidden">
      <div className="flex items-center justify-between w-full flex-wrap sm:flex-nowrap gap-2 px-2">
        <div className="text-lg font-bold text-gray-900">
          Flash deals end in:
        </div>

        <div className="text-lg font-semibold text-gray-800 space-x-2">
          <span>
            {String(timeLeft.hours).padStart(2, "0")}
            <span className="text-xs font-medium text-gray-500 ml-1">Hrs</span>
          </span>
          <span>
            {String(timeLeft.minutes).padStart(2, "0")}
            <span className="text-xs font-medium text-gray-500 ml-1">Mins</span>
          </span>
          <span>
            {String(timeLeft.seconds).padStart(2, "0")}
            <span className="text-xs font-medium text-gray-500 ml-1">Secs</span>
          </span>
        </div>
      </div>
    </div>
  );
}
