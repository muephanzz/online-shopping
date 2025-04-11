import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Callback received:", body);

    const callbackData = body?.Body?.stkCallback;
    const resultCode = callbackData?.ResultCode;
    const checkoutRequestID = callbackData?.CheckoutRequestID;
    const amount = callbackData?.CallbackMetadata?.Item?.find(item => item.Name === "Amount")?.Value;

    if (resultCode === 0) {
      // Mark order/payment as paid
      await supabase
        .from("payments")
        .update({ status: "paid" })
        .eq("checkout_request_id", checkoutRequestID);

      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("mpesa_transaction_id", checkoutRequestID);
    } else {
      console.log("Payment failed or was cancelled:", callbackData?.ResultDesc);
    }

    return new Response(JSON.stringify({ message: "Callback received" }), { status: 200 });
  } catch (error) {
    console.error("Callback Error:", error);
    return new Response(JSON.stringify({ error: "Failed to handle callback" }), { status: 500 });
  }
}
