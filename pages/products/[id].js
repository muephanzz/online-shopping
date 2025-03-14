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

  useEffect(() => {
    if (!id) return;

    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);

        const [{ data: productData }, { data: reviewsData }] = await Promise.all([
          supabase.from("products").select("*").eq("product_id", id).single(),
          supabase.from("reviews").select("review_id, rating, comment, media_urls, created_at, user_id, full_name").eq("product_id", id),
        ]);

        setProduct(productData);
        setMainImage(productData?.image_urls?.[0] || "");
        setReviews(reviewsData || []);
      } catch (err) {
        console.error("Error fetching data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
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

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found!</p>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div>
          <Image src={mainImage} width={600} height={600} alt={product.name} className="rounded-lg" />

          {/* Image Scrolling for Mobile */}
          <div className="mt-4 md:hidden overflow-x-auto flex space-x-2">
            {product.image_urls?.map((img, index) => (
              <Image
                key={index}
                src={img}
                width={100}
                height={100}
                alt="Thumbnail"
                onClick={() => setMainImage(img)}
                className={`cursor-pointer rounded ${mainImage === img ? "border-2 border-blue-500" : ""}`}
              />
            ))}
          </div>

          {/* Thumbnail Display for Desktop */}
          <div className="hidden md:flex gap-2 mt-4">
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
    </div>
  );
}
