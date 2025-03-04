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
    async function checkUserPurchase() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session || !session.user) return;
  
        console.log("User ID:", session.user.id);
        console.log("Product ID:", id);
  
        // Check if the user has a completed order for this product
        const { data, error } = await supabase
          .from("orders")
          .select("user_id, product_id, status")
          .eq("user_id", session.user.id)
          .eq("product_id", id)
          .eq("status", "completed")
          .maybeSingle();
  
        if (error) throw error;
  
        console.log("Purchase Data:", data);
  
        // If the order is found and status is 'completed', allow review
        if (data) setPurchased(true);
      } catch (err) {
        console.error("Error checking purchase:", err.message);
      }
    }
  
    if (id) checkUserPurchase();
  }, [id]);
  
  
  
  
  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("product_id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error.message);
      } else {
        setProduct(data);
        setMainImage(data.image_urls ? data.image_urls[0] : "");
      }
      setLoading(false);
    }

    const fetchReviews = async () => {
      try {
        const { data: reviews, error } = await supabase
          .from("reviews")
          .select("review_id, rating, comment, media_urls, created_at, user_id, full_name ")
          .eq("product_id", id);
    
        if (error) throw error;
    
        // Fetch user details in parallel
        const userPromises = reviews.map((review) =>
          supabase
            .from("auth.users")
            .select("email")
            .eq("id", review.user_id)
            .single()
        );
    
        const userResults = await Promise.all(userPromises);
    
        // Combine reviews with user info
        const enrichedReviews = reviews.map((review, index) => ({
          ...review,
          username: userResults[index]?.data?.email || "Anonymous",
        }));
    
        setReviews(enrichedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error.message);
      }
    };
    

    fetchProduct();
    fetchReviews();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAdding(true);
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error fetching session:", sessionError.message);
      alert("Please log in to add items to cart.");
      setAdding(false);
      return;
    }

    const userId = session.user.id;

    const { data: existingCartItem, error: fetchError } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", product.product_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking cart:", fetchError.message);
      alert("Error adding to cart.");
      setAdding(false);
      return;
    }

    if (existingCartItem) {
      const { error: updateError } = await supabase
        .from("cart")
        .update({ quantity: existingCartItem.quantity + quantity })
        .eq("cart_id", existingCartItem.cart_id);

      if (updateError) {
        console.error("Error updating cart:", updateError.message);
        alert("Failed to update cart!");
      } else {
        alert(`Updated cart! Total: ${existingCartItem.quantity + quantity} items.`);
      }
    } else {
      const { error } = await supabase.from("cart").insert([
        {
          product_id: product.product_id,
          name: product.name,
          price: product.price,
          image_url: mainImage,
          quantity,
          user_id: userId,
        },
      ]);

      if (error) {
        console.error("Error adding to cart:", error.message);
        alert("Failed to add to cart!");
      } else {
        alert(`Added ${quantity} item(s) to cart!`);
      }
    }

    setAdding(false);
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

  if (loading) return <p style={{ textAlign: "center" }}>Loading product...</p>;
  if (!product) return <p style={{ textAlign: "center" }}>Product not found!</p>;

  return (
    <div style={{ padding: "10px", marginTop: "100px" }}>
      <div className="inline gap-4">
        <a href="#description">Description</a>
        <a href="#reviews">Reviews</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-gray-200 p-4">
          <div style={{ position: "relative", overflow: "hidden", borderRadius: "10px" }}>
            <Image
              width={500}
              height={500}
              unoptimized
              src={mainImage}
              alt={product.name}
              style={{ width: "400px", maxHeight: "400px", objectFit: "fill", transition: "transform 0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>

          <div style={{ display: "flex", marginTop: "10px", gap: "10px" }}>
            {product.image_urls?.map((img, index) => (
              <Image
                width={500}
                height={500}
                unoptimized
                key={index}
                src={img}
                alt={`Thumbnail ${index}`}
                style={{ width: "70px", height: "70px", borderRadius: "5px", cursor: "pointer", border: mainImage === img ? "2px solid #0070f3" : "none" }}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="bg-gray-200 p-4">
          {/* Preserve line breaks from textarea */}
          <p style={{ whiteSpace: "pre-line" }}>
            {product.description || "No description available."}
          </p>
          <h1 style={{ color: "#0070f3", margin: "15px 0" }}>{product.name}</h1>
          <h2 style={{ color: "#0070f3", margin: "15px 0" }}>Price: Ksh{product.price}</h2>

          <button onClick={handleAddToCart} disabled={adding} style={{ padding: "10px 20px", backgroundColor: "#ff6600", color: "#fff", borderRadius: "5px", cursor: "pointer" }}>{adding ? "Adding..." : "Add to Cart"}</button>
        </div>
      </div>

      <div id="reviews" style={{ marginTop: "40px" }}>
        <h3 className="font-bold">Customer Reviews</h3>
        <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
        {reviews.length === 0 ? (
            <p>This product has no reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.review_id} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>
                {/* Display Username (email from auth.users) */}
                <p>
                  <strong>{review.full_name || "Anonymous"}</strong> 
                  ({review.rating}/5) {new Date(review.created_at).toISOString().split("T")[0]}
                </p>
                <p>{review.comment}</p>

                {/* Display Uploaded Images */}
                {review.media_urls?.length > 0 && (
                  <div>
                    {review.media_urls.map((img, index) => (
                      <img
                        key={index}
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/review-media/${img}`}
                        alt="Review Image"
                        style={{ maxWidth: "100px", marginRight: "10px" }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}


      {purchased ? (
        <button
          onClick={() => router.push(`/upload-review/${id}`)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "15px",
          }}
        >
          Leave a Review
        </button>
      ) : (
        <p style={{ marginTop: "15px" }}>
          Purchase this product to leave a review.
        </p>
      )}

      </div>
    </div>
  );
}
