import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
  const price = product.price;
  const discount = price <= 200 ? 20 : 0; // 20% discount for products under Ksh 200
  
  return (
    <Link href={`/products/${product.product_id}`} key={product.product_id} className="group">
      <div className="border relative rounded-lg shadow-md p-2 sm:p-4 hover:shadow-lg transition duration-300">
          <h4 className="absolute top-0 left-0 bg-gray-500 text-white rounded px-2">{product.state}</h4>
          {product.price <= 200 && (
            <h4 className="absolute left-0 top-5 text-red-600 font-bold animate-shake">
              {discount}% discount
            </h4>
          )}
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
       <p className="flex">{product.description.split(" ").slice(0, 2).join(" ")}...</p>
        <p className="mt-1 font-bold text-blue-600">Ksh {product.price}</p>
      </div>
    </Link>
  );
}
