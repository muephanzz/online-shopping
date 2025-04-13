"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import Image from "next/image";
import toast from "react-hot-toast";
import ProductCard from "../../components/ProductCard";
import ReviewSection from "../../components/ReviewSection";
import moment from "moment";

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
  const [isMobile, setIsMobile] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [activeTab, setActiveTab] = useState("specifications");

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [{ data: productData, error: productError }, { data: reviewsData, error: reviewsError }, { data: recommendedData, error: recommendedError }] = await Promise.all([
          supabase.from("products").select("*").eq("product_id", id).single(),
          supabase.from("reviews").select("review_id, rating, comment, media_urls, created_at, username, user_id, profiles(avatar_url)").eq("product_id", id),
          supabase.from("products").select("*").neq("product_id", id).limit(4),
        ]);

        if (productError) throw productError;
        if (reviewsError) throw reviewsError;
        if (recommendedError) throw recommendedError;

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
    <div className="lg:p-20 sm:mt-20 lg:mt-18 p-4">
      <div className="flex justify-end gap-6 mb-6 border-b pb-2 text-lg font-semibold">
        <Link href="/" className="text-gray-600 hover:text-orange-500 transition duration-300">
          Back to Products
        </Link>
      </div>
  
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="border-b lg:outline pb-1 lg:w-1/2 flex flex-col sm:item-center gap-4 lg:h-[310px]">
          <div className="flex m-4 w-full relative justify-center items-center">
            <Image 
              src={mainImage} 
              width={300} 
              height={300} 
              alt={product.name} 
              className="lg:w-80 md:h-70"
            />
          </div>
  
          {/* Thumbnails Section */}
          <div className="flex z-40 lg:absolute lg:flex-col sm:px-14 gap-4">
            {product.image_urls?.map((img, index) => (
              <Image
                key={index}
                src={img}
                width={50}
                height={25}
                alt="Thumbnail"
                onClick={() => setMainImage(img)}
                className={`cursor-pointer rounded ${mainImage === img ? "border-2 border-blue-500 shadow-lg" : 
                  isMobile ? "scroll-smooth" : ""
                } ${setMainImage === img ? "border-2 border-blue-500 shadow-lg" : ""}`}
              />
            ))}
          </div>
        </div>
  
        <div className="flex lg:w-1/2 flex-col gap-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-gray-600">{product.description || "No description available."}</p>
          <p className="text-xl text-blue-600 font-semibold">Ksh {product.price}</p>
  
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 w-full sm:w-auto"
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>
  
            <button
              onClick={() => {
                if (!product) {
                  toast.error("Product details are missing!");
                  return;
                }
  
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
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 w-full sm:w-auto"
            >
              {checking ? "Checking..." : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
  
      <div className="flex gap-6 mt-8 mb-6 border-b pb-2 text-lg font-semibold">
        <p onClick={() => setActiveTab("specifications")} className={`cursor-pointer transition duration-300 ${activeTab === "specifications" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-600 hover:text-orange-500"}`}>Specifications</p>
        <p onClick={() => setActiveTab("recommended")} className={`cursor-pointer transition duration-300 ${activeTab === "recommended" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-600 hover:text-orange-500"}`}>Recommended</p>
        <p onClick={() => setActiveTab("reviews")} className={`cursor-pointer transition duration-300 ${activeTab === "reviews" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-600 hover:text-orange-500"}`}>Reviews</p>
      </div>
  
      {activeTab === "specifications" && (
        <table className="w-full mb-20 border-collapse border border-gray-300 text-sm md:text-base rounded-lg">
          <tbody>
            {product.specification.split("\n").filter(line => line.includes(":"))
              .map((line, index) => {
                const [key, value] = line.split(":").map((item) => item.trim());
                return (
                  <tr key={index} className="border border-gray-300 hover:bg-gray-100 transition">
                    <td className="p-3 font-semibold text-gray-700 bg-gray-50">{key}</td>
                    <td className="p-3 text-gray-600">{value}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
  
      {activeTab === "recommended" && (
        <div id="recommended" className="relative mb-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recommended.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}
  
      {activeTab === "reviews" && (
        <div id="reviews" className="mt-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Customer Reviews ({reviews.length})</h2>
          <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder} className="mb-4 p-2 border rounded-md">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>    
          <ReviewSection reviews={reviews} />
        </div>
      )}
    </div>
  );
}