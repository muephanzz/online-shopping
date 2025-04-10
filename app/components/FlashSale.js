import { useEffect, useState } from "react";
import ProductCard from "./ProductCard"; // Assuming ProductCard is in the same folder
import Link from "next/link";

const FlashSale = ({ flashSaleProducts }) => {
  const [countdown, setCountdown] = useState(24 * 60 * 60); // 24 hours in seconds

  // Ensure flashSaleProducts is an array and then filter products whose price is less than 200
  const filteredFlashSaleProducts = Array.isArray(flashSaleProducts)
    ? flashSaleProducts.filter(product => product.price === 1)
    : [];

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemaining = seconds % 60;
    return `${hours}h ${minutes}m ${secondsRemaining}s`;
  };

  return (
    <div className="flash-sale-section bg-gradient-to-r from-blue-400 to-purple-500 py-12">
      <div className="container mx-auto px-6 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">Flash Sale - Products Below 200</h2>
        <p className="text-lg mb-6">Hurry, offer ends in:</p>
        <div className="bg-black bg-opacity-50 rounded-lg py-3 px-6 inline-block mb-8">
          <p className="text-2xl font-semibold">{formatCountdown(countdown)}</p>
        </div>

        {/* View All Link */}
        <div className="flex justify-center mb-8">
          <Link href="/flash-sales" className="text-blue-300 hover:text-blue-100 font-semibold text-xl transition duration-300">
            View All Flash Sales
          </Link>
        </div>

        {/* Flash Sale Products Grid */}
        {filteredFlashSaleProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFlashSaleProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-200 mt-6">No products available for flash sale.</p>
        )}
      </div>
    </div>
  );
};

export default FlashSale;
