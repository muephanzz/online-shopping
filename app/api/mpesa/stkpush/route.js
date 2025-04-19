import { NextResponse } from "next/server";
import mpesaClient from "@/lib/mpesaClient";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  try {
    const { phone, amount, shipping, email, user_id, items } = await req.json();

    if (!phone || !amount || !shipping || !email || !user_id || !items.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await supabase.from("orders").insert({
      user_id,
      order_id,
      items,
      shipping,
      status: "pending",
      amount,
      email,
    });

    await supabase.from("payments").insert({
      user_id,
      order_id,
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