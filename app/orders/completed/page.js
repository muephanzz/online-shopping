"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation"; // ✅ Correct import for App Router
import Image from "next/image";

const CompletedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    setLoading(true);

    // Fetch current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user or user not logged in:", userError);
      setLoading(false);
      return;
    }

    // Fetch completed orders for the logged-in user
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching completed orders:", error);
    else setOrders(data);

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-20 p-6">
      <h1 className="text-3xl font-bold mb-6">Your Completed Orders</h1>

      {loading && <p>Loading your completed orders...</p>}

      {!loading && orders.length === 0 && <p>No completed orders found.</p>}

      {!loading && orders.length > 0 && (
        <ul className="space-y-6">
          {orders.map((order) => (
            <li key={order.order_id} className="border p-4 rounded-lg">
              <p>
                <strong>Order Number:</strong> {order.order_id}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Total:</strong> ${order.total}
              </p>

              <h3 className="mt-4 font-semibold">Items:</h3>
              <ul>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-4 border-b pb-4"
                    >
                      <Image
                        src={item.image_url}
                        width={80}
                        height={80}
                        className="rounded-lg"
                        alt={item.name}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium">{item.name}</h3>
                        <p className="text-gray-700">Quantity: {item.quantity}</p>
                        <p className="text-blue-600 font-bold">Ksh {item.price}</p>
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/upload-review/${item.product_id}`)
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Write a Review
                      </button>
                    </li>
                  ))
                ) : (
                  <li>Unable to load items.</li>
                )}
              </ul>

              <p>
                <strong>Shipping Address:</strong> {order.shipping_address}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompletedOrders;
