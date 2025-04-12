import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");

    if (!checkoutRequestId) {
      return NextResponse.json({ error: "Missing checkoutRequestId" }, { status: 400 });
    }

    // 1. Fetch latest payment status from Supabase
    const { data: payment, error } = await supabase
      .from("payments")
      .select("status")
      .eq("checkout_request_id", checkoutRequestId)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 2. Return payment status
    return NextResponse.json({ status: payment.status }, { status: 200 });

  } catch (err) {
    console.error("Payment status error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
