import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, phone, user_id, checkoutItems, shipping_address, email } = body;

    const checkoutRequestId = uuidv4(); // simulate unique request ID

    // Simulate an STK Push (replace with actual M-Pesa API integration)
    console.log("Sending STK Push to", phone, "for Ksh", amount);

    // Save to DB: orders and payments (simplified here)
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        user_id,
        amount,
        status: "pending",
        shipping_address,
        items: checkoutItems,
        checkout_request_id: checkoutRequestId,
        email,
        created_at: new Date().toISOString(),
      }),
    });

    return NextResponse.json({ checkoutRequestId });
  } catch (err) {
    console.error("STK Push Error:", err);
    return NextResponse.json({ error: "Failed to initiate payment." }, { status: 500 });
  }
}
