import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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