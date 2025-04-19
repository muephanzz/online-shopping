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

  await supabase
    .from("payments")
    .update({
      status: "paid",
      amount,
      receipt,
      transaction_date: transactionDate,
      phone,
    })
    .eq("checkout_request_id", checkoutRequestID);

  await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("checkout_request_id", checkoutRequestID);

  return new Response("Callback processed successfully", { status: 200 });
}

