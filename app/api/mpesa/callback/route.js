import { NextResponse } from "next/server";
import { supabase } from "@/components/supabaseClient";

export async function POST(req) {
  const { Body } = await req.json();

  const stkCallback = Body?.stkCallback;
  const checkoutRequestId = stkCallback?.CheckoutRequestID;
  const resultCode = stkCallback?.ResultCode;
  const resultDesc = stkCallback?.ResultDesc;

  if (!checkoutRequestId) return NextResponse.json({ error: "No request ID" }, { status: 400 });

  if (resultCode === 0) {
    await supabase
      .from("payments")
      .update({ status: "paid" })
      .eq("checkout_request_id", checkoutRequestId);
  } else {
    await supabase
      .from("payments")
      .update({ status: "pending", error: resultDesc })
      .eq("checkout_request_id", checkoutRequestId);
  }

  return NextResponse.json({ message: "Callback received" });
}