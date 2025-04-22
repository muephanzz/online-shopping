import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req) {
  const { email, checkoutRequestId } = await req.json();

  const html = `
    <div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:auto;border-radius:10px;background:#f8f9fa;color:#333">
      <h2 style="color:#2e7d32;">🎉 Order Confirmed</h2>
      <p>Hi there,</p>
      <p>We're excited to let you know that your payment has been successfully received!</p>
      <p><strong>Transaction ID:</strong> ${checkoutRequestId}</p>
      <p>Your order is now being processed and will be shipped soon.</p>
      <br/>
      <p>Thank you for shopping with us!</p>
      <hr style="margin:20px 0"/>
      <p style="font-size:0.9em;color:#888;">Shop Electronics - Always powering your life ⚡</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "✅ Payment Received - Order Confirmed",
    html,
  });

  return NextResponse.json({ message: "Success email sent." });
}
