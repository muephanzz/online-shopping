// pages/api/mpesa/route.js
import fetch from "node-fetch";  // Use fetch for making HTTP requests

async function getOAuthToken() {
  const credentials = Buffer.from(`${process.env.MPESA_SHORTCODE}:${process.env.MPESA_SECRET}`).toString('base64');
  
  const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    method: "GET",
    headers: {
      "Authorization": `Basic ${credentials}`,
    },
  });
  
  const data = await response.json();
  return data.access_token;
}

async function verifyPayment(checkoutRequestId) {
  const token = await getOAuthToken();

  const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "Shortcode": process.env.MPESA_SHORTCODE,
      "LipaNaMpesaOnlineShortcode": process.env.MPESA_LIPA_NA_M_PESA_SHORTCODE,
      "CheckoutRequestID": checkoutRequestId,
    }),
  });

  const data = await response.json();
  
  return data.ResultCode === 0 ? { success: true } : { success: false };
}

export async function POST(req) {
  try {
    const { phone, checkoutRequestId } = await req.json();

    if (!phone || !checkoutRequestId) {
      return new Response(JSON.stringify({ error: "Phone number and CheckoutRequestID are required" }), { status: 400 });
    }

    // Verify payment status using Safaricom API
    const paymentStatus = await verifyPayment(checkoutRequestId);

    if (!paymentStatus.success) {
      return new Response(JSON.stringify({ success: false }), { status: 200 });
    }

    // Check if phone exists in database and payment status is successful
    const { data, error } = await supabase
      .from("payments") // Assuming you're storing payments here
      .select("status")
      .eq("phone_number", phone)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0 || data[0].status !== "success") {
      return new Response(JSON.stringify({ success: false }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Payment Check Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
