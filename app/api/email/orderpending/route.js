import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req) {
  const { email, reason, checkoutRequestId } = await req.json();

  const html = `
    <div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:auto;border-radius:10px;background:#fff3cd;color:#856404">
      <h2>⚠️ Payment Issue</h2>
      <p>Hi there,</p>
      <p>We attempted to process your payment, but it didn't go through.</p>
      <p><strong>Transaction ID:</strong> ${checkoutRequestId}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please retry the payment or contact support if the issue persists.</p>
      <br/>
      <p>We're here to help if you need assistance.</p>
      <hr style="margin:20px 0"/>
      <p style="font-size:0.9em;color:#888;">Shop Electronics Customer Support</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "⚠️ Payment Unsuccessful - Action Required",
    html,
  });

  return NextResponse.json({ message: "Pending/failure email sent." });
}
