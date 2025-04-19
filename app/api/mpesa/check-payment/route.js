import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { checkoutRequestId } = await req.json();

  const { data: payment, error } = await supabase
    .from("payments")
    .select("*")
    .eq("checkout_request_id", checkoutRequestId) // ✅ Correct column name
    .single();

  if (error || !payment) {
    return NextResponse.json({ status: "failed" });
  }

  if (payment.status !== "paid") {
    return NextResponse.json({ status: "pending" });
  }

  // ✅ Check if order already exists
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_id", payment.id)
    .maybeSingle();

  let newOrderId;
  if (!existing) {
    const { data: newOrder } = await supabase
      .from("orders")
      .insert([
        {
          user_id: payment.user_id,
          payment_id: payment.id,
          items: payment.items,
          total: payment.amount,
          status: "processing",
          shipping: payment.shipping,
        },
      ])
      .select("id")
      .single();

    newOrderId = newOrder?.id;

    if (payment.email && newOrderId) {
      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL,
          to: payment.email,
          subject: "🧾 Order Confirmation",
          html: `
            <h2>Thanks for your purchase!</h2>
            <p>Order <strong>#${newOrderId}</strong> has been received.</p>
            <p>Total: <strong>KES ${payment.amount}</strong></p>
            <p>We’ll let you know when it ships!</p>
          `,
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError.message);
      }
    }
  }

  return NextResponse.json({ status: "paid" });
}
