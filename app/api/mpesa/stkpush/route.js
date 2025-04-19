import { NextResponse } from "next/server";
import { mpesaClient } from "@/lib/mpesaClient";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { phone, amount, shipping_address, email, user_id, items } = await req.json();

    if (!phone || !amount || !shipping_address || !email || !user_id || !items.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await supabase.from("orders").insert({
      user_id,
      items,
      shipping_address,
      status: "pending",
      amount,
      email,
    });

    await supabase.from("payments").insert({
      user_id,
      amount,
      phone,
      status: "pending",
    });

    const response = await mpesaClient.stkPush({
      phoneNumber: phone,
      amount,
      accountReference: "CampusCart",
      transactionDesc: `Payment by ${email}`,
      callbackUrl: `${process.env.BASE_URL}/api/mpesa/callback`,
    });

    return NextResponse.json({ checkoutRequestId });
  } catch (err) {
    console.error("STK Push Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}