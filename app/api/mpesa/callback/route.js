import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const extractCallbackData = (body) => {
  const stkCallback = body?.Body?.stkCallback;
  const resultCode = stkCallback?.ResultCode;
  const resultDesc = stkCallback?.ResultDesc;
  const checkoutRequestId = stkCallback?.CheckoutRequestID;
  const metadata = stkCallback?.CallbackMetadata?.Item || [];

  let phone = "";
  let amount = 0;
  let mpesaReceiptNumber = "";

  for (const item of metadata) {
    if (item.Name === "PhoneNumber") phone = item.Value;
    if (item.Name === "Amount") amount = item.Value;
    if (item.Name === "MpesaReceiptNumber") mpesaReceiptNumber = item.Value;
  }

  return { resultCode, resultDesc, checkoutRequestId, phone, amount, mpesaReceiptNumber };
};

export async function POST(req) {
  try {
    const body = await req.json();
    const supabase = createClient();
    const {
      resultCode,
      resultDesc,
      checkoutRequestId,
      phone,
      amount,
      mpesaReceiptNumber,
    } = extractCallbackData(body);

    if (!checkoutRequestId) {
      return NextResponse.json({ message: "Missing CheckoutRequestID" }, { status: 400 });
    }

    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: resultCode === 0 ? "paid" : "pending",
        phone,
        mpesa_receipt: mpesaReceiptNumber,
        result_desc: resultDesc,
      })
      .eq("checkout_request_id", checkoutRequestId);

    if (paymentError) {
      console.error("Payment update error:", paymentError.message);
    }

    if (resultCode === 0) {
      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("mpesa_transaction_id", checkoutRequestId);
    }

    return NextResponse.json({ message: "Callback received successfully" });
  } catch (err) {
    console.error("Callback Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
