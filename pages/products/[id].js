import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sortOrder, setSortOrder] = useState("newest");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [{ data: productData, error: productError }, { data: reviewsData, error: reviewsError }] = await Promise.all([
          supabase.from("products").select("*").eq("product_id", id).single(),
          supabase.from("reviews").select("review_id, rating, comment, media_urls, created_at, user_id, full_name").eq("product_id", id),
        ]);

        if (productError) throw productError;
        if (reviewsError) throw reviewsError;

        if (productData) {
          setProduct(productData);
          setMainImage(productData.image_urls?.[0] || "");
        }
        setReviews(reviewsData || []);
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
        await supabase.from("cart").update({ quantity: existingCartItem.quantity + quantity }).eq("cart_id", existingCartItem.cart_id);
      } else {
        await supabase.from("cart").insert([
          {
            product_id: product.product_id,
            name: product.name,
            price: product.price,
            image_url: mainImage,
            quantity,
            user_id: session.user.id,
          },
        ]);
      }

      toast.success("Item added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err.message);
      toast.error("Failed to add item to cart.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <p className="text-center">Loading product...</p>;
  if (!product) return <p className="text-center">Product not found!</p>;

  return (
    <div className="p-4 mt-24 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div>
          <Image src={mainImage} className="w-30 md:h-40"
           width={400} height={400} alt={product.name} />
          <div className="flex gap-2 mt-4">
            {product.image_urls?.map((img, index) => (
              <Image
                key={index}
                src={img}
                width={50}
                height={50}
                alt="Thumbnail"
                onClick={() => setMainImage(img)}
                className={`cursor-pointer rounded ${mainImage === img ? "border-2 border-blue-500 shadow-lg" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="mt-10 text-2xl font-bold">{product.name}</h1>
          <p className="text-gray-600">{product.short_description || "No description available."}</p>
          <p className="text-xl text-blue-600 font-semibold">Ksh {product.price}</p>
          <div >
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 w-full sm:w-auto"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 w-full sm:w-auto"
          >
            {adding ? "Adding..." : "Buy Now"}
          </button>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm md:text-base mt-8">
        <tbody>
          {product.description.split("\n").filter(line => line.includes(":"))
            .map((line, index) => {
              const [key, value] = line.split(":").map((item) => item.trim());
              return (
                <tr key={index} className="border border-gray-300">
                  <td className="p-2 font-semibold text-gray-700">{key}</td>
                  <td className="p-2 text-gray-600">{value}</td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder} className="mb-4 p-2 border">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.review_id} className="mb-6 border-b pb-4">
              <p className="font-semibold">{review.full_name}</p>
              <p>Rating: {review.rating}/5</p>
              <p>{review.comment}</p>
              <p className="text-gray-500 text-sm">{new Date(review.created_at).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
