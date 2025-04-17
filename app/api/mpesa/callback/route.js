import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const body = await req.json();
    const callback = body?.Body?.stkCallback;

    const resultCode = callback?.ResultCode;
    const checkoutRequestId = callback?.CheckoutRequestID;

    if (resultCode === 0) {
      await supabase.from("payments").update({ status: "paid" }).eq("checkout_request_id", checkoutRequestId);
      await supabase.from("orders").update({ status: "paid" }).eq("mpesa_transaction_id", checkoutRequestId);
    } else {
      console.warn("STK Failed:", callback?.ResultDesc);
    }

    return new Response(JSON.stringify({ message: "Callback handled" }), { status: 200 });
  } catch (error) {
    console.error("Callback error:", error);
    return new Response(JSON.stringify({ error: "Callback failed" }), { status: 500 });
  }
}
