import { supabase } from "../../lib/supabaseClient";
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("M-Pesa Callback Received:", body);

    // Validate that callback data exists
    if (!body?.Body?.stkCallback) {
      return NextResponse.json({ error: "Malformed callback data" }, { status: 400 });
    }

    const { Body } = body;
    const { stkCallback } = Body;
    const resultCode = stkCallback.ResultCode;

    // Handle successful payment
    if (resultCode === 0) {
      const transactionData = stkCallback.CallbackMetadata;
      const transactionId = transactionData?.Item.find((item) => item.Name === "MpesaReceiptNumber")?.Value ?? "";
      const phoneNumber = transactionData?.Item.find((item) => item.Name === "PhoneNumber")?.Value ?? "";
      const amountPaid = transactionData?.Item.find((item) => item.Name === "Amount")?.Value ?? 0;

      console.log("Payment Successful:", transactionData);

      // Validate required fields
      const { user_id, checkoutItems, shipping_address } = body;
      if (!user_id || !checkoutItems) {
        return NextResponse.json({ error: "User ID and checkout items are required" }, { status: 400 });
      }

      // Insert order into Supabase
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
        return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
      }

      // Save failed payment in case of issues
      await supabase.from("failed_payments").insert([{
        user_id,
        phone_number: phoneNumber,
        reason: "Payment succeeded but order failed to save",
        status: "failed"
      }]);

      return NextResponse.json({ success: true, message: "Payment and order saved successfully" }, { status: 200 });
    }

    // Handle payment failure
    console.log("Payment Failed:", stkCallback.ResultDesc);
    await supabase.from("failed_payments").insert([{
      phone_number: body?.Body?.stkCallback?.CallbackMetadata?.Item?.find(item => item.Name === "PhoneNumber")?.Value,
      reason: stkCallback.ResultDesc,
      status: "failed"
    }]);

    return NextResponse.json({ success: false, error: stkCallback.ResultDesc }, { status: 400 });

  } catch (error) {
    console.error("Error handling M-Pesa callback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
