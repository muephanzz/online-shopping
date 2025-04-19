import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { mpesaClient } from "@/lib/mpesaClient";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { phone, amount, shipping_address, email, user_id, items } = await req.json();

    if (!phone || !amount || !shipping_address || !email || !user_id || !items.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const checkoutRequestId = uuidv4(); // 👈 Generate unique ID for payment tracking

    // Save the pending order
    const { error: orderError } = await supabase.from("orders").insert({
      user_id,
      items,
      shipping_address,
      status: "pending",
      amount,
      email,
      checkoutRequestId,
    });

    if (orderError) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Save initial payment
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id,
      amount,
      phone,
      status: "pending",
      email,
      checkoutRequestId,
    });

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
    }

    // Trigger M-Pesa STK Push
    const response = await mpesaClient.stkPush({
      phoneNumber: phone,
      amount,
      accountReference: "CampusCart",
      transactionDesc: `Payment by ${email}`,
      callbackUrl: `${process.env.BASE_URL}/api/mpesa/callback`,
    });

    if (response.ResponseCode !== "0") {
      console.error("M-Pesa STK Push failed:", response);
      return NextResponse.json({ error: "STK Push failed" }, { status: 500 });
    }

    return NextResponse.json({ checkoutRequestId }); // 👈 return the correct value now
  } catch (err) {
    console.error("STK Push Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
