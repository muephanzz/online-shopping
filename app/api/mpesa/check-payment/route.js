import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { checkoutRequestId } = await req.json();

    // Simulate payment check - replace with actual API call
    const isPaid = Math.random() > 0.5; // mock paid 50% chance

    if (isPaid) {
      return NextResponse.json({ status: "paid" });
    } else {
      return NextResponse.json({ status: "pending" });
    }
  } catch (err) {
    console.error("Check Payment Error:", err);
    return NextResponse.json({ error: "Payment check failed." }, { status: 500 });
  }
}
