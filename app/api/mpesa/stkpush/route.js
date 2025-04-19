// File: app/api/mpesa/stkpush/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { sanitizePhone } from "@/lib/utils";
import { initiateSTKPush } from "@/lib/mpesaClient";

export async function POST(req) {
  const body = await req.json();
  const { phone, amount, items, shipping, email, user_id } = body;

  const sanitizedPhone = sanitizePhone(phone);

  const { checkoutRequestID } = await initiateSTKPush({
    phone: sanitizedPhone,
    amount,
  });

  const { data, error } = await supabase.from("payments").insert([
    {
      user_id,
      email,
      phone: sanitizedPhone,
      checkout_request_id: checkoutRequestID,
      amount,
      status: "pending",
      items,
      shipping,
    },
  ]);

  if (error) {
    console.error("Error saving payment:", error);
    return NextResponse.json({ error: "Failed to save payment." }, { status: 500 });
  }

  return NextResponse.json({ checkoutRequestId: checkoutRequestID });
}
