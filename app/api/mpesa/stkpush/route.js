import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortcode = process.env.MPESA_SHORTCODE;
const passkey = process.env.MPESA_PASSKEY;
const callbackURL = process.env.BASE_URL + "/api/mpesa/callback";

const getTimestamp = () =>
  new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);

const formatPhone = (phone) =>
  phone.startsWith("07") ? "254" + phone.slice(1) : phone;

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, phone, user_id, checkoutItems, shipping_address, email } =
      body;

    if (!amount || !phone || !user_id || !checkoutItems || !shipping_address || !email) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const formattedPhone = formatPhone(phone);
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const tokenRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const { access_token } = await tokenRes.json();

    const timestamp = getTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const stkBody = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackURL,
      AccountReference: `Order`,
      TransactionDesc: "E-commerce Order",
    };

    const stkRes = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkBody),
      }
    );

    const stkData = await stkRes.json();
    if (stkData.ResponseCode !== "0") {
      return NextResponse.json({ message: "STK Push failed", details: stkData }, { status: 500 });
    }

    const checkoutRequestId = stkData.CheckoutRequestID;

    const { error: orderError } = await supabase.from("orders").insert({
      user_id,
      total: amount,
      shipping_address,
      phone_number: formattedPhone,
      status: "pending",
      items: JSON.stringify(checkoutItems),
      mpesa_transaction_id: checkoutRequestId,
    });

    const { error: paymentError } = await supabase.from("payments").insert({
      user_id,
      phone_number: formattedPhone,
      amount,
      status: "pending",
      checkout_request_id: checkoutRequestId,
    });

    if (orderError || paymentError) {
      console.error("Supabase insert error:", { orderError, paymentError });
      return NextResponse.json({ error: "Failed to save pending records" }, { status: 500 });
    }

    return NextResponse.json({ success: true, checkoutRequestId });
  } catch (err) {
    console.error("STK Push Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}