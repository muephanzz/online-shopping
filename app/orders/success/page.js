import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🎉 Payment Successful!</h1>
      <p>Thank you for your order.</p>
      <button
        onClick={() => router.push("/")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
}
