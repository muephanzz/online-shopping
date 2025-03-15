import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
  return (
    <Link href={`/products/${product.product_id}`} key={product.product_id} className="group">
      <div className="border rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
        {/* Display First Image Only */}
        <Image
          src={product.image_urls?.[0] || "/placeholder.jpg"}
          alt={product.name || "Product Image"}
          className="w-full h-44 rounded-md"
          width={500}
          height={500}
          unoptimized // If using external URLs like Supabase
        />
        <h3 className="mt-3 text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
          {product.name}
        </h3>
        <p className="mt-1 font-bold text-blue-600">Ksh {product.price}</p>
      </div>
    </Link>
  );
}
