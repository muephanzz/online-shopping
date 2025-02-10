import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from 'lucide-react';
import Image from 'next/image';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
    } else {
      setProduct(data);
    }
    setLoading(false);
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (!product) return <p className="text-center text-lg">Product not found.</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <Image 
            src={product.images[0]} 
            alt={product.name} 
            width={500} 
            height={500} 
            className="rounded-2xl shadow-lg object-cover w-full h-96" 
          />
          <div className="flex mt-4 space-x-2 overflow-x-auto">
            {product.images.map((img, idx) => (
              <Image 
                key={idx} 
                src={img} 
                alt={`Thumbnail ${idx}`} 
                width={100} 
                height={100} 
                className="rounded-xl cursor-pointer hover:opacity-75" 
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-xl text-green-600 font-semibold mb-4">${product.price}</p>
          <p className="text-gray-700 mb-6">{product.description}</p>
          <Button className="w-full">Add to Cart</Button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
        {product.reviews && product.reviews.length > 0 ? (
          product.reviews.map((review, idx) => (
            <Card key={idx} className="mb-4">
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{review.user_name}</h3>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, starIdx) => (
                      <Star key={starIdx} className={`w-4 h-4 ${starIdx < review.rating ? 'text-yellow-500' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  );
}
