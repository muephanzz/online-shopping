import Link from "next/link";
import Image from "next/image";

export function ProductCard({ product }) {
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

export function Items({ item }) {
  return (
    <div className="flex items-center gap-4 border-b pb-4">
      <Image
        src={item.image_url || "/placeholder.jpg"}
        width={80}
        height={80}
        className="rounded-lg object-cover"
        alt={item.name || "Item"}
      />
      <div className="flex-1">
        <h3 className="text-lg font-medium">{item.name || "Unnamed Item"}</h3>
        <p className="text-gray-700">Quantity: {item.quantity || 0}</p>
        <p className="text-blue-600 font-bold">Ksh {item.price?.toFixed(2) || "0.00"}</p>
      </div>
    </div>
  );
}

export function AdminProductCard({ product }) {
  return (
    <div>
      <h2 className="text-xl font-semibold">
        <strong>Product Name:</strong> {product.name}
      </h2>
      <p><strong>Brand:</strong> {product.brand || "N/A"}</p>
      <p><strong>Category:</strong> {product.categories?.category || "Uncategorized"}</p>
      <p><strong>State:</strong> {product.state || "Unknown"}</p>
      <p><strong>Seller's Phone Numbers:</strong> {product.phone || "No contact"}</p>
      <p><strong>Description:</strong> {product.description || "No description available"}</p>
      <p><strong>Specification:</strong> {product.specification || "No specifications"}</p>
      <p><strong>Price:</strong> Ksh {product.price || "0.00"}</p>
      <p><strong>In Stock:</strong> {product.stock || "Out of stock"}</p>
      <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
        {(product.image_urls || []).map((url, index) => (
          <img
            key={index}
            src={url}
            alt="Product"
            className="w-24 h-24 object-cover rounded-lg border flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
