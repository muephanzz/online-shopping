import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  console.log("M-Pesa Callback Received:", req.body);

  if (!req.body.Body) {
    return res.status(400).json({ error: "Invalid callback data" });
  }

  const { Body } = req.body;
  const resultCode = Body.stkCallback.ResultCode;

  if (resultCode === 0) {
    // Payment successful
    const transactionData = Body.stkCallback.CallbackMetadata;
    const transactionId = transactionData?.Item.find((item) => item.Name === "MpesaReceiptNumber")?.Value;
    const phoneNumber = transactionData?.Item.find((item) => item.Name === "PhoneNumber")?.Value;
    const amountPaid = transactionData?.Item.find((item) => item.Name === "Amount")?.Value;

    console.log("Payment Successful:", transactionData);

    // Retrieve user details from the request (ensure frontend sends these details)
    const { user_id, checkoutItems, shipping_address } = req.body;

    if (!user_id || !checkoutItems) {
      return res.status(400).json({ error: "User ID and checkout items are required" });
    }

    // Insert order into Supabase
    const { error } = await supabase.from("orders").insert({
      user_id,
      total: amountPaid,
      shipping_address,
      status: "paid",
      items: JSON.stringify(checkoutItems), // Ensure JSONB format
      phone_number: phoneNumber,
      mpesa_transaction_id: transactionId,
    });

    if (error) {
      console.error("Supabase Insert Error:", error);
      return res.status(500).json({ error: "Failed to save order" });
    }

    return res.status(200).json({ message: "Payment and order saved successfully" });
  } else {
    console.log("Payment Failed:", Body.stkCallback.ResultDesc);
    return res.status(400).json({ error: Body.stkCallback.ResultDesc });
  }
}
