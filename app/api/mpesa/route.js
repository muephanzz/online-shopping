import { supabase } from "../../lib/supabaseClient";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("M-Pesa Callback Received:", body);

    if (!body.Body) {
      return new Response(JSON.stringify({ error: "Invalid callback data" }), { status: 400 });
    }

    const { Body } = body;
    const resultCode = Body.stkCallback.ResultCode;

    if (resultCode === 0) {
      const metadata = Body.stkCallback.CallbackMetadata;
      const transactionId = metadata?.Item.find(i => i.Name === "MpesaReceiptNumber")?.Value;
      const phoneNumber = metadata?.Item.find(i => i.Name === "PhoneNumber")?.Value;
      const amount = metadata?.Item.find(i => i.Name === "Amount")?.Value;

      const { user_id, checkoutItems, shipping_address } = body;

      if (!user_id || !checkoutItems) {
        return new Response(JSON.stringify({ error: "Missing user ID or items" }), { status: 400 });
      }

      const { error } = await supabase.from("orders").insert([{
        user_id,
        total: amount,
        shipping_address,
        status: "paid",
        items: JSON.stringify(checkoutItems),
        phone_number: phoneNumber,
        mpesa_transaction_id: transactionId,
      }]);

      if (error) {
        console.error("Supabase Insert Error:", error);
        return new Response(JSON.stringify({ error: "Failed to save order" }), { status: 500 });
      }

      return new Response(JSON.stringify({ success: true, message: "Payment recorded" }), { status: 200 });
    } else {
      console.log("Payment Failed:", Body.stkCallback.ResultDesc);
      return new Response(JSON.stringify({ success: false, error: Body.stkCallback.ResultDesc }), { status: 400 });
    }
  } catch (error) {
    console.error("M-Pesa Error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
