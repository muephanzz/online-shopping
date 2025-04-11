import { supabase } from "../../lib/supabaseClient";
import { verifyPayment } from "../../lib/verifyPayment";  // Import the verifyPayment function

export async function POST(req) {
  try {
    const { phone } = await req.json();  // Get phone number from the request

    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone number is required" }), { status: 400 });
    }

    // Retrieve the order based on the phone number
    const { data, error } = await supabase
      .from("orders")
      .select("order_id, checkout_request_id")
      .eq("phone_number", phone)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return new Response(JSON.stringify({ success: false }), { status: 200 });
    }

    const checkoutRequestId = data[0].checkout_request_id; // Get checkout request ID from the latest order

    // Verify the payment status using M-Pesa API
    const paymentStatus = await verifyPayment(checkoutRequestId);

    if (paymentStatus.success) {
      // Update the payment status in the database to 'completed'
      await supabase
        .from("payments")
        .update({ status: "completed" })
        .eq("checkout_request_id", checkoutRequestId);

      return new Response(JSON.stringify({ success: true, message: paymentStatus.message }), { status: 200 });
    } else {
      // Update the payment status in the database to 'failed'
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("checkout_request_id", checkoutRequestId);

      return new Response(JSON.stringify({ success: false, message: paymentStatus.message }), { status: 200 });
    }
  } catch (error) {
    console.error("Payment Check Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
