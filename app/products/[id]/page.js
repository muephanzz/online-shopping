"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [checking, setChecking] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [recommended, setRecommended] = useState([]);
  const [activeTab, setActiveTab] = useState("specifications");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [{ data: productData }, { data: reviewsData }, { data: recommendedData }] = await Promise.all([
          supabase.from("products").select("*").eq("product_id", id).single(),
          supabase.from("reviews").select("review_id, rating, comment, media_urls, created_at, username, user_id, profiles(avatar_url)").eq("product_id", id),
          supabase.from("products").select("*").neq("product_id", id).limit(4),
        ]);

        if (productData) {
          setProduct(productData);
          setMainImage(productData.image_urls?.[0] || "");
        }
        setReviews(reviewsData || []);
        setRecommended(recommendedData || []);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || quantity < 1) return toast.error("Please select a valid quantity.");

    setAdding(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return toast.error("Please log in to add items to the cart.");

      const { data: existingCartItem } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("product_id", product.product_id)
        .single();

      if (existingCartItem) {
        const newQty = existingCartItem.items.quantity + quantity;
        await supabase.from("cart").update({
          items: {
            ...existingCartItem.items,
            quantity: newQty,
          }
        }).eq("cart_id", existingCartItem.cart_id);
      } else {
        await supabase.from("cart").insert([
          {
            product_id: product.product_id,
            user_id: session.user.id,
            items: {
              product_id: product.product_id,
              name: product.name,
              price: product.price,
              image_url: mainImage,
              quantity,
            }
          }
        ]);
      }

      toast.success("Item added to cart!");
      window.location.reload();
    } catch (err) {
      console.error("Error adding to cart:", err.message);
      toast.error("Failed to add item to cart.");
    } finally {
      setAdding(false);
      setChecking(false);
    }
  };

  if (loading) return <p className="text-center">Loading product...</p>;
  if (!product) return <p className="text-center">Product not found!</p>;

  return (
    <div className="p-4 sm:p-6 lg:p-20">
      <div className="mb-4">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-orange-500 transition duration-300"
        >
          ← Back to Products
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main image and thumbnails */}
        <div className="w-full lg:w-1/2">
          <div className="relative rounded-xl shadow-md overflow-hidden bg-white p-4 flex items-center justify-center">
            <Image
              src={mainImage}
              width={350}
              height={350}
              alt={product.name}
              className="object-contain w-full max-w-xs h-auto"
            />
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
            {product.image_urls?.map((img, index) => (
              <Image
                key={index}
                src={img}
                width={60}
                height={60}
                alt="Thumbnail"
                onClick={() => setMainImage(img)}
                className={`cursor-pointer rounded-md border-2 ${
                  mainImage === img
                    ? "border-orange-500 shadow-lg"
                    : "border-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 space-y-4">
          <h1 className="text-2xl font-semibold text-gray-800">{product.name}</h1>
          <p className="text-gray-600">{product.description || "No description available."}</p>
          <p className="text-xl text-orange-600 font-semibold">Ksh {product.price}</p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full sm:w-auto px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>

            <button
              onClick={() => {
                if (!product) return toast.error("Product details are missing!");
                const item = {
                  product_id: product.product_id,
                  image_url: mainImage,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                };
                localStorage.setItem("checkoutItems", JSON.stringify([item]));
                router.push("/orders/checkout");
              }}
              disabled={checking}
              className="w-full sm:w-auto px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              {checking ? "Checking..." : "Buy Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mt-10 border-b pb-2 text-lg font-semibold overflow-x-auto">
        {["specifications", "recommended", "reviews"].map((tab) => (
          <p
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer transition duration-300 capitalize ${
              activeTab === tab
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-orange-500"
            }`}
          >
            {tab}
          </p>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "specifications" && (
          <table className="w-full mb-20 border-collapse border border-gray-200 text-sm rounded-lg">
            <tbody>
              {product.specification?.split("\n").filter((line) => line.includes(":"))
                .map((line, index) => {
                  const [key, value] = line.split(":").map((item) => item.trim());
                  return (
                    <tr key={index} className="border border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3 font-medium text-gray-700 bg-gray-50">{key}</td>
                      <td className="p-3 text-gray-600">{value}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        {activeTab === "recommended" && (
          <div className="mb-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommended.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Customer Reviews ({reviews.length})
            </h2>
            <select
              onChange={(e) => setSortOrder(e.target.value)}
              value={sortOrder}
              className="mb-4 p-2 border border-gray-300 rounded-md"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
            <ReviewSection reviews={reviews} />
          </div>
        )}
      </div>
    </div>
  );
}
