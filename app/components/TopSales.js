// components/TopSalesSection.jsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function TopSalesSection() {
  const [timeLeft, setTimeLeft] = useState(null);

  const getTimeRemaining = () => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const total = endOfDay.getTime() - now.getTime();

    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);
    return { hours, minutes, seconds };
  };

  useEffect(() => {
    setTimeLeft(getTimeRemaining());
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) return null;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-orange-100 to-yellow-50 py-2 shadow-2xl rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between w-full flex-wrap sm:flex-nowrap gap-2 px-2">
        <div className="text-lg font-bold text-gray-900">Flash deals end in:</div>

        <div className="text-lg font-semibold text-gray-800 space-x-2">
          {["hours", "minutes", "seconds"].map((unit, i) => (
            <motion.span
              key={unit}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-block"
            >
              {pad(timeLeft[unit])}
              <span className="text-xs text-gray-500 ml-1">
                {unit === "hours" ? "Hrs" : unit === "minutes" ? "Mins" : "Secs"}
              </span>
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
