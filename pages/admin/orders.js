import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase.from("orders").select("*");

      if (error) {
        setError("Failed to fetch orders.");
      } else {
        setOrders(data);
      }
    }

    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(true);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      setError("Failed to update order status.");
    } else {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    }

    setUpdating(false);
  };

  return (
    <div style={{ maxWidth: "100%", textAlign: "center" }}
      className="mt-24 p-4">
      <h1 className="text-2xl">Admin Orders</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ccc" }}>
            <th>Email</th>
            <th>Status</th>
            <th>Update Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{order.email}</td>
              <td>{order.status}</td>
              <td>
                <select
                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                  value={order.status}
                  disabled={updating}
                  style={{
                    padding: "5px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}