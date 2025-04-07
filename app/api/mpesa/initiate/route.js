import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

// Replace with your sandbox credentials
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortcode = process.env.MPESA_SHORTCODE; // Buy Goods Till Number
const passkey = process.env.MPESA_PASSKEY;
const callbackURL = process.env.MPESA_CALLBACK_URL; // Should be publicly accessible for real M-Pesa

// Format timestamp
const getTimestamp = () => {
  const date = new Date();
  return date
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, phone, user_id, checkoutItems, shipping_address } = body;

    if (!phone || !amount || !user_id || !checkoutItems || !shipping_address) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

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

    // 2. Prepare STK Push request
    const timestamp = getTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const stkBody = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerBuyGoodsOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackURL,
      AccountReference: "Ephantronics Order",
      TransactionDesc: "E-commerce payment",
    };

    // 3. Send STK Push request
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

    // 4. Create a pending order to track callback later
    const { error } = await supabase.from("orders").insert([
      {
        user_id,
        total: amount,
        shipping_address,
        phone_number: phone,
        status: "pending",
        items: JSON.stringify(checkoutItems),
      },
    ]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: "Failed to save pending order" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "STK Push sent" }, { status: 200 });
  } catch (error) {
    console.error("STK Push Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
