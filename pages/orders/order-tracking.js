import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const statusSteps = ["pending", "paid", "processing", "shipped", "completed"];
  const getStatusIndex = (status) => statusSteps.indexOf(status);

  const handleTrackOrder = async () => {
    setLoading(true);
    setError("");
    setOrderId("");
    setOrder(null);
  
    if (!orderId.trim()) {
      setError('Order number cannot be empty!');
      setLoading(false); // Stop loading if the field is empty
      setTimeout(() => setError(''), 5000);
      return; // Exit early to prevent the query
    }
  
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId)
      .single();
  
    if (error || !data) {
      setError("No order found with this order ID.");
    } else {
      setOrder(data);
    }
  
    setLoading(false);
  };
  

  const handleCancelOrder = async () => {
    if (!order) return;

    if (["pending", "paid"].includes(order.status)) {
      setUpdating(true);

      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("order_id", order.order_id);

      if (error) {
        setError("Failed to cancel the order.");
      } else {
        setOrder((prevOrder) => ({ ...prevOrder, status: "cancelled" }));
      }

      setUpdating(false);
    } else {
      setError("Order cannot be cancelled after processing. Call 0798229783 for help");
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div style={{ maxWidth: "460px", margin: "auto", textAlign: "center", marginTop: "100px", marginBottom: "200px" }}>
      <h1 className="m-2">Track Your Order</h1>

      <input
        type="text"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        placeholder="Enter your order ID"
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "20px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
        required
      />
      <button
        onClick={handleTrackOrder}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Loading..." : "Track Order"}
      </button>

      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

      {order && (
        <div style={{ marginTop: "30px", textAlign: "left" }}>
          <h2>Order Details</h2>
          <h2>Order Number: {order.order_id}</h2>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Total:</strong> ${order.total}
          </p>
          <p>
            <strong>Shipping Address:</strong> {order.shipping_address}
          </p>
          <h3>Items:</h3>
          <ul>
            {(() => {
              try {
                const items = JSON.parse(order.items);
                return items.map((item, index) => (
                  <li key={index}>
                    <p>
                      {item.name} - ${item.price}
                    </p>
                  </li>
                ));
              } catch {
                return <li>Unable to load items.</li>;
              }
            })()}
          </ul>

          <div style={{ marginTop: "20px" }}>
            <h3>Order Status</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                maxWidth: "500px",
                margin: "20px auto",
              }}
            >
              {statusSteps.map((step, index) => (
                <div key={step} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "25px",
                      height: "25px",
                      borderRadius: "50%",
                      backgroundColor:
                        index <= getStatusIndex(order.status) ? "#0070f3" : "#ccc",
                      margin: "0 auto",
                    }}
                  />
                  <p style={{ fontSize: "12px" }}>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {order.status !== "cancelled" && (
            <button
              onClick={handleCancelOrder}
              disabled={updating}
              style={{
                padding: "10px 20px",
                backgroundColor: "#ff4d4d",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              {updating ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
