import { supabase } from "../../lib/supabaseClient";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("M-Pesa Callback Received:", body);

    if (!body.Body) {
      return Response.json({ error: "Invalid callback data" }, { status: 400 });
    }

    const { Body } = body;
    const resultCode = Body.stkCallback.ResultCode;

    if (resultCode === 0) {
      // Payment successful
      const transactionData = Body.stkCallback.CallbackMetadata;
      const transactionId = transactionData?.Item.find((item) => item.Name === "MpesaReceiptNumber")?.Value;
      const phoneNumber = transactionData?.Item.find((item) => item.Name === "PhoneNumber")?.Value;
      const amountPaid = transactionData?.Item.find((item) => item.Name === "Amount")?.Value;

      console.log("Payment Successful:", transactionData);

      const { user_id, checkoutItems, shipping_address } = body;

      if (!user_id || !checkoutItems) {
        return Response.json({ error: "User ID and checkout items are required" }, { status: 400 });
      }

      const { error } = await supabase.from("orders").insert([{
        user_id,
        total: amountPaid,
        shipping_address,
        status: "paid",
        items: JSON.stringify(checkoutItems),
        phone_number: phoneNumber,
        mpesa_transaction_id: transactionId,
      }]);

      if (error) {
        console.error("Supabase Insert Error:", error);
        return Response.json({ error: "Failed to save order" }, { status: 500 });
      }

      return Response.json({ success: true, message: "Payment and order saved successfully" }, { status: 200 });
    } else {
      console.log("Payment Failed:", Body.stkCallback.ResultDesc);
      return Response.json({ success: false, error: Body.stkCallback.ResultDesc }, { status: 400 });
    }
  } catch (error) {
    console.error("Error handling M-Pesa callback:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
