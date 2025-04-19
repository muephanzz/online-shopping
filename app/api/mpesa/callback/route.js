import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  const { Body } = await req.json();
  const callback = Body.stkCallback;

  const checkoutRequestId = callback.CheckoutRequestID;
  const resultCode = callback.ResultCode;

  const status = resultCode === 0 ? "paid" : "failed";

  const metadata = callback.CallbackMetadata?.Item || [];
  const mpesaReceipt = metadata.find((item) => item.Name === "MpesaReceiptNumber")?.Value;

  await supabase
    .from("payments")
    .update({
      status,
      mpesa_receipt: mpesaReceipt || null,
    })
    .eq("checkout_request_id", checkoutRequestId);

  return NextResponse.json({ message: "Callback received" });
}
