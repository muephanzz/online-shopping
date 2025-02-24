// pages/admin/orders.js
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*");
    if (error) console.error("Error fetching orders:", error);
    else setOrders(data);
    setLoading(false);
  };

  // Update order status
  const handleStatusUpdate = async (id, newStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) alert("Error updating status: " + error.message);
    else fetchOrders();
  };

  // Delete an order
  const handleDelete = async (id) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) alert("Error deleting order: " + error.message);
    else fetchOrders();
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border p-4 rounded-lg">
              <p>
                <strong>Order ID:</strong> {order.id}
              </p>
              <p>
                <strong>User ID:</strong> {order.user_id}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>

              <div className="mt-4">
                <button
                  onClick={() => handleStatusUpdate(order.id, "shipped")}
                  className="bg-blue-500 text-white p-2 rounded mr-2"
                >
                  Mark as Shipped
                </button>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="bg-red-500 text-white p-2 rounded"
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
}
