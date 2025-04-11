import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabaseClient";

// Env variables
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortcode = process.env.MPESA_SHORTCODE;
const passkey = process.env.MPESA_PASSKEY;
const callbackURL = process.env.MPESA_CALLBACK_URL;

// Helper: Timestamp
const getTimestamp = () => {
  const date = new Date();
  return date.toISOString().replace(/[^0-9]/g, "").slice(0, 14);
};

// Helper: Format phone to 2547XXXXXXX
const formatPhone = (phone) => {
  if (phone.startsWith("07")) return "254" + phone.slice(1);
  if (phone.startsWith("+")) return phone.slice(1);
  return phone;
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, phone, user_id, checkoutItems, shipping_address } = body;

    if (!phone || !amount || !user_id || !checkoutItems || !shipping_address) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const formattedPhone = formatPhone(phone);

    // 1. Get access token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenRes = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` },
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.json({ error: "Failed to get M-Pesa token" }, { status: 500 });
    }

    const accessToken = tokenData.access_token;

    // 2. Prepare STK Push
    const timestamp = getTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const stkBody = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerBuyGoodsOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackURL,
      AccountReference: "Ephantronics Order",
      TransactionDesc: "E-commerce payment",
    };

    // 3. Send STK Push
    const stkRes = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkBody),
    });

    const stkData = await stkRes.json();
    if (stkData.ResponseCode !== "0") {
      return NextResponse.json({ error: "STK Push failed", details: stkData }, { status: 500 });
    }

    const checkoutRequestId = stkData.CheckoutRequestID;

    // 4. Insert into orders (pending)
    const { error: orderError } = await supabase.from("orders").insert([
      {
        user_id,
        total: amount,
        shipping_address,
        phone_number: formattedPhone,
        status: "pending",
        items: JSON.stringify(checkoutItems),
        mpesa_transaction_id: checkoutRequestId,
      },
    ]);

    // 5. Insert into payments (pending)
    const { error: paymentError } = await supabase.from("payments").insert([
      {
        user_id,
        phone_number: formattedPhone,
        amount,
        status: "pending",
        checkout_request_id: checkoutRequestId,
      },
    ]);

    if (orderError || paymentError) {
      console.error("Supabase insert error:", orderError || paymentError);
      return NextResponse.json({ error: "Failed to save pending records" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "STK Push sent" }, { status: 200 });
  } catch (error) {
    console.error("STK Push Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
