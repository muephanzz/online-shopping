import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortcode = process.env.MPESA_SHORTCODE;
const passkey = process.env.MPESA_PASSKEY;
const callbackURL = process.env.MPESA_CALLBACK_URL;

const getTimestamp = () => {
  return new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
};

const formatPhone = (phone) => {
  if (phone.startsWith("07")) return "254" + phone.slice(1);
  if (phone.startsWith("+")) return phone.slice(1);
  return phone;
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, phone, user_id, checkoutItems, shipping_address } = body;

    if (!amount || !phone || !user_id || !checkoutItems || !shipping_address) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const formattedPhone = formatPhone(phone);
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const tokenRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    const { access_token } = await tokenRes.json();

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
      AccountReference: `Order-${user_id}`,
      TransactionDesc: "E-commerce order",
    };

    const stkRes = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkBody),
    });

    const stkData = await stkRes.json();

    if (stkData.ResponseCode !== "0") {
      return NextResponse.json({ error: "STK Push failed", details: stkData }, { status: 500 });
    }

    const checkoutRequestId = stkData.CheckoutRequestID;

    await supabase.from("orders").insert({
      user_id,
      phone_number: formattedPhone,
      total: amount,
      items: JSON.stringify(checkoutItems),
      shipping_address,
      mpesa_transaction_id: checkoutRequestId,
      status: "pending",
    });

    await supabase.from("payments").insert({
      user_id,
      phone_number: formattedPhone,
      amount,
      status: "pending",
      checkout_request_id: checkoutRequestId,
    });

    return NextResponse.json({
      message: "STK Push sent",
      checkoutRequestId,
    });
  } catch (err) {
    console.error("STK Push Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
