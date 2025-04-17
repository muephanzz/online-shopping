import { supabase } from "@/lib/supabaseClient";

async function getOAuthToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");

  const res = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const data = await res.json();
  return data.access_token;
}

export async function POST(req) {
  try {
    const { checkoutRequestId } = await req.json();
    if (!checkoutRequestId) return new Response("Missing ID", { status: 400 });

    const accessToken = await getOAuthToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");

    const stkQuery = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const res = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkQuery),
    });

    const data = await res.json();

    if (data.ResultCode === "0") {
      await supabase
        .from("payments")
        .update({ status: "paid" })
        .eq("checkout_request_id", checkoutRequestId);

      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("mpesa_transaction_id", checkoutRequestId);

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: false, message: data.ResultDesc }), { status: 200 });
  } catch (err) {
    console.error("Verification error:", err);
    return new Response("Server error", { status: 500 });
  }
}
