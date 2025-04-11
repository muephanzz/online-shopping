"use client";
import { useEffect, useState } from "react";

export default function TopSalesSection() {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());

  function getTimeRemaining() {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // End of today
    const total = endOfDay.getTime() - now.getTime();

    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);

    return { hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-gradient-to-r from-orange-100 to-yellow-50 px-6 py-16 rounded-3xl shadow-2xl mb-10 text-center overflow-hidden">
      {/* Background sale flare or pattern */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-orange-400 opacity-10 rounded-full blur-3xl z-0 animate-pulse"></div>

      <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">
        🔥 Today's Top Sales
      </h1>
      <p className="relative z-10 text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-6">
        Flash deals end in:
      </p>

      <div className="relative z-10 flex justify-center gap-6 text-center text-xl font-bold text-gray-900">
        <div className="bg-white shadow-md rounded-xl px-4 py-2 w-20">
          <div>{String(timeLeft.hours).padStart(2, "0")}</div>
          <span className="text-xs font-medium text-gray-500">Hours</span>
        </div>
        <div className="bg-white shadow-md rounded-xl px-4 py-2 w-20">
          <div>{String(timeLeft.minutes).padStart(2, "0")}</div>
          <span className="text-xs font-medium text-gray-500">Minutes</span>
        </div>
        <div className="bg-white shadow-md rounded-xl px-4 py-2 w-20">
          <div>{String(timeLeft.seconds).padStart(2, "0")}</div>
          <span className="text-xs font-medium text-gray-500">Seconds</span>
        </div>
      </div>

      <p className="relative z-10 mt-8 text-gray-600 max-w-xl mx-auto text-base md:text-lg">
        Don’t miss out on today’s best electronics deals. Limited stock available – grab yours before the timer runs out!
      </p>
    </section>
  );
}
