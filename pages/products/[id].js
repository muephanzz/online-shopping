// Improved and responsive ProductDetails component

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Image from "next/image";

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
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);

        const [{ data: productData, error: productError }, { data: reviewsData, error: reviewsError }] = await Promise.all([
          supabase.from("products").select("*").eq("product_id", id).single(),
          supabase.from("reviews").select("review_id, rating, comment, media_urls, created_at, user_id, full_name").eq("product_id", id)
        ]);

        if (productError) throw productError;
        if (reviewsError) throw reviewsError;

        setProduct(productData);
        setMainImage(productData.image_urls?.[0] || "");
        setReviews(reviewsData || []);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  useEffect(() => {
    async function checkUserPurchase() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) return;

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("product_id")
          .eq("user_id", session.user.id)
          .eq("product_id", id)
          .eq("status", "completed")
          .maybeSingle();

        if (orderError) throw orderError;
        if (orderData) setPurchased(true);
      } catch (err) {
        console.error("Error checking purchase:", err.message);
      }
    }

    if (id) checkUserPurchase();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return alert("Please log in to add items to cart.");

      const { data: existingCartItem } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("product_id", product.product_id)
        .single();

      if (existingCartItem) {
        await supabase
          .from("cart")
          .update({ quantity: existingCartItem.quantity + quantity })
          .eq("cart_id", existingCartItem.cart_id);
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

      alert("Item added to cart successfully!");
    } catch (err) {
      console.error("Error adding to cart:", err.message);
      alert("Failed to add item to cart.");
    } finally {
      setAdding(false);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortOrder) {
      case "newest":
        return new Date(b.created_at) - new Date(a.created_at);
      case "oldest":
        return new Date(a.created_at) - new Date(b.created_at);
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found!</p>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div>
          <Image src={mainImage} width={600} height={600} alt={product.name} className="rounded-lg" />
          <div className="flex gap-2 mt-4">
            {product.image_urls?.map((img, index) => (
              <Image
                key={index}
                src={img}
                width={80}
                height={80}
                alt="Thumbnail"
                onClick={() => setMainImage(img)}
                className={`cursor-pointer rounded ${mainImage === img ? "border-2 border-blue-500" : ""}`}
              />
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-4 text-lg">{product.description}</p>
          <p className="mt-4 text-2xl text-blue-600">Ksh {product.price}</p>

          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>

      <div className="mb-16 mt-12">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        {sortedReviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          sortedReviews.map((review) => (
            <div key={review.review_id} className="mb-6 border-b pb-4">
              <p className="font-semibold">{review.full_name}</p>
              <p>Rating: {review.rating}/5</p>
              <p>{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
