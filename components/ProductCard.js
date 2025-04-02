import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
  return (
    <Link href={`/products/${product.product_id}`} className="group">
      <div className="border relative rounded-lg shadow-md p-2 sm:p-4 hover:shadow-lg transition duration-300">
        {product.state && (
          <h4 className="absolute top-0 left-0 bg-gray-500 text-white rounded px-2">
            {product.state}
          </h4>
        )}
        <Image
          src={product.image_urls?.[0] || "/placeholder.jpg"}
          alt={product.name || "Product Image"}
          className="w-full h-44 rounded-md object-cover"
          width={500}
          height={500}
          unoptimized
        />
        <h3 className="mt-3 text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
          {product.name}
        </h3>
        <p className="flex">
          {product.description ? product.description.split(" ").slice(0, 2).join(" ") : "No description"}...
        </p>
        <p className="mt-1 font-bold text-blue-600">Ksh {product.price}</p>
      </div>
    </Link>
  );
}