import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ProductCard({ product, loading }) {

  if (loading) {
    return (
      <div className="animate-pulse bg-white border border-gray-200 rounded-lg p-4 shadow">
        <div className="w-full h-44 bg-gray-200 rounded-md mb-4" />
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-full mb-1" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
      </div>
    );
  }

  return (
    <Link
      href={`/products/${product.product_id}`}
      className="group block"
    >
      <motion.div
        className="border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-xl p-3 sm:p-4 transition-all duration-300 overflow-hidden relative"
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="relative overflow-hidden rounded-md">
          <Image
            src={product.image_urls?.[0] || "/placeholder.jpg"}
            alt={product.name || "Product"}
            width={500}
            height={500}
            loading="lazy"
            className="w-full h-44 object-fill rounded-md transition-transform duration-300"
          />
          {product.state && (
            <span className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-md shadow z-10">
              {product.state}
            </span>
          )}
        </div>

        <h3 className="mt-4 text-base font-semibold text-neutral-800 group-hover:text-indigo-600 transition-colors duration-200">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 truncate">
          {product.description || "No description"}
        </p>

        <p className="mt-2 font-bold text-indigo-700 text-sm sm:text-base">
          Ksh {Number(product.price).toLocaleString()}
        </p>
      </motion.div>
    </Link>
  );
}
