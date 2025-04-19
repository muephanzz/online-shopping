import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  const headers = req.headers;
  const secret = headers.get("x-safaricom-secret");

  if (secret !== process.env.SAFARICOM_SECRET) {
    return NextResponse.json({ error: "Unauthorized request" }, { status: 401 });
  }

  const payload = await req.json();
  const callback = payload.Body?.stkCallback;
  const resultCode = callback?.ResultCode;

  if (resultCode !== 0) {
    return new Response("Payment not successful", { status: 200 });
  }

  const checkoutRequestID = callback.CheckoutRequestID;
  const metadata = callback.CallbackMetadata?.Item;

  const amount = metadata.find(i => i.Name === "Amount")?.Value;
  const receipt = metadata.find(i => i.Name === "MpesaReceiptNumber")?.Value;
  const transactionDate = metadata.find(i => i.Name === "TransactionDate")?.Value;
  const phone = metadata.find(i => i.Name === "PhoneNumber")?.Value;

  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("checkout_request_id", checkoutRequestID)
    .single();

  if (!payment) {
    console.error("Payment not found for callback ID:", checkoutRequestID);
    return new Response("Payment not found", { status: 404 });
  }

  await supabase
    .from("payments")
    .update({
      status: "paid",
      amount,
      receipt,
      transaction_date: transactionDate,
      phone,
      metadata: JSON.stringify(metadata),
    })
    .eq("checkout_request_id", checkoutRequestID);

  await supabase
    .from("orders")
    .insert({
      user_id: payment.user_id,
      total: amount,
      phone_number: phone,
      shipping_address: payment.shipping_address,
      email: payment.email,
      status: "paid",
      items: payment.items,
      mpesa_transaction_id: checkoutRequestID,
    });

  return new Response("Callback processed successfully", { status: 200 });
}
