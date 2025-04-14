import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
  return (
    <Link
      href={`/products/${product.product_id}`}
      className="group relative block"
    >
      <div className="border mb-4 border-gray-200 relative rounded-xl bg-white shadow-sm hover:shadow-xl p-3 sm:p-4 transition-all duration-300 overflow-hidden">
       <div className="relative transition-transform duration-500 group-hover:scale-[1.03] rounded-lg overflow-hidden">
          <Image
            src={product.image_urls?.[0] || "/placeholder.jpg"}
            alt={product.name || "Product Image"}
            className="w-full h-44 rounded-md object-fill"
            width={500}
            height={500}
            unoptimized
          />
        </div>
        {product.state && (
          <span className="absolute z-100 top-2 left-2 bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-md shadow">
            {product.state}
          </span>
        )}

        <h3 className="mt-4 text-base font-semibold text-neutral-800 group-hover:text-indigo-600 transition-colors duration-200">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 truncate">
          {product.description || "No description"}
        </p>

        <p className="mt-2 font-bold text-indigo-700 text-sm sm:text-base">
          Ksh {product.price}
        </p>
      </div>
    </Link>
  );
}
