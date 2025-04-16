"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminLayout from "@/components/AdminLayout";
import withAdminAuth from "@/components/withAdminAuth";
import Image from "next/image";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const orderItems = typeof orders.items === "string" ? JSON.parse(orders.items) : orders.items;
  const statusSteps = ["pending", "paid", "processing", "shipped", "completed", "cancelled"];

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("order_id", { ascending: false }); // Change 'created_at' to 'order_id'
    if (error) console.error("Error fetching orders:", error);
    else setOrders(data);
    setLoading(false);
  };
  

  // Update order status
  const handleStatusUpdate = async (order_id, newStatus) => {
    const validTransitions = {
      pending: ["paid", "cancelled"],
      paid: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };
  
    const currentStatus = orders.find(order => order.order_id === order_id)?.status;
  
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      alert(`Cannot transition from ${currentStatus} to ${newStatus}`);
      return;
    }
  
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("order_id", order_id);
  
    if (error) alert("Error updating status: " + error.message);
    else fetchOrders(); // Refresh the list of orders
  };
  
  
  // Delete an order
  const handleDelete = async (order_id) => {
    const confirmation = window.confirm("Are you sure you want to delete this order?");
    if (!confirmation) return;
  
    const { error } = await supabase.from("orders").delete().eq("order_id", order_id);
    if (error) alert("Error deleting order: " + error.message);
    else fetchOrders();
  };
  

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin blur-sm"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-400 animate-spin"></div>
          </div>
        </div>
      ) : ( 
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.order_id} className="border p-4 rounded-lg">
              <p>
                <strong>Order ID:</strong> {order.order_id}
              </p>
              <p>
                <strong>User ID:</strong> {order.user_id}
              </p>
              <p>
                <strong>Status:</strong> {order.status.toUpperCase()}
              </p>
              <p>
                <strong>Total:</strong> Ksh {order.total}
              </p>
              <p>
                <strong>Shipping Address:</strong> {order.shipping_address}
              </p>

              {/* Display Order Items */}
              <h3 className="mt-4 font-semibold">Items:</h3>
              <ul>
                {(() => {
                  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;

                  return items && items.length > 0 ? (
                    items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 border-b pb-4">
                        <Image src={item.image_url} width={80} height={80} className="rounded-lg" alt={item.name} />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium">{item.name || "Name"}</h3>
                          <p className="text-gray-700">Quantity: {item.quantity}</p>
                          <p className="text-blue-600 font-bold">Ksh {item.price || "price"}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <li>Unable to load items.</li>
                  );
                })()}
              </ul>

              {/* Status Update Controls */}
              <div className="mt-4 flex flex-wrap gap-2">
                {statusSteps.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(order.order_id, status)}
                    className={`p-2 rounded text-sm sm:text-base transition duration-300 ease-in-out 
                      ${order.status === status ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'}
                    `}
                    disabled={order.status === status}
                  >
                    Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(order.order_id)}
                  className="bg-red-500 text-white p-2 rounded mt-2"
                >
                  Delete Order
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
};

export default withAdminAuth(ManageOrders);
