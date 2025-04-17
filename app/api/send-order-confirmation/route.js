import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { email, orderId, amount } = await req.json();

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "🧾 Order Confirmation",
      html: `<h2>Thank you for your order!</h2>
             <p>Your order <strong>#${orderId}</strong> of <strong>KES ${amount}</strong> has been confirmed.</p>
             <p>We’ll notify you once it’s shipped!</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
