// pages/admin/orders.js
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";
import withAdminAuth from "../../components/withAdminAuth";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

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
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("order_id", order_id);

    if (error) alert("Error updating status: " + error.message);
    else fetchOrders();
  };

  // Delete an order
  const handleDelete = async (order_id) => {
    const { error } = await supabase.from("orders").delete().eq("order_id", order_id);

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
            <li key={order.order_id} className="border p-4 rounded-lg">
              <p>
                <strong>Order ID:</strong> {order.order_id}
              </p>
              <p>
                <strong>User ID:</strong> {order.user_id}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Total:</strong> ${order.total}
              </p>
              <p>
                <strong>Shipping Address:</strong> {order.shipping_address}
              </p>

              {/* Display Order Items */}
              <h3 className="mt-4 font-semibold">Items:</h3>
              <ul>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center border-b py-2">
                      <span>{item.name} - ${item.price}</span>
                    </li>
                  ))
                ) : (
                  <li>Unable to load items.</li>
                )}
              </ul>

              {/* Status Update Controls */}
              <div className="mt-4">
                {statusSteps.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(order.order_id, status)}
                    className={`p-2 rounded mr-2 ${order.status === status ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
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
