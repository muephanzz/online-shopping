import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const payload = await req.json();
    const stkCallback = payload?.Body?.stkCallback;

    if (!stkCallback) {
      return new Response(JSON.stringify({ message: "Invalid callback format" }), { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Get phone number and amount from metadata if payment was successful
    let phone = null;
    let amount = null;

    if (ResultCode === 0 && CallbackMetadata) {
      for (let item of CallbackMetadata.Item) {
        if (item.Name === "PhoneNumber") phone = item.Value;
        if (item.Name === "Amount") amount = item.Value;
      }
    }

    // Update payments and orders
    const paymentStatus = ResultCode === 0 ? "paid" : "failed";

    // Update the payments table
    await supabase
      .from("payments")
      .update({ status: paymentStatus, amount: amount || 0 })
      .eq("mpesa_transaction_id", CheckoutRequestID);

    // Update the orders table
    await supabase
      .from("orders")
      .update({ status: paymentStatus })
      .eq("mpesa_transaction_id", CheckoutRequestID);

    return new Response(JSON.stringify({ message: "Callback processed successfully" }), { status: 200 });
  } catch (error) {
    console.error("Callback Error:", error);
    return new Response(JSON.stringify({ error: "Callback handler error" }), { status: 500 });
  }
}
