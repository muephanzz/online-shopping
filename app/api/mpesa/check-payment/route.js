import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { checkoutRequestId } = await req.json();
  if (!checkoutRequestId) {
    return NextResponse.json({ error: "Missing checkoutRequestId" }, { status: 400 });
  }

  const supabase = createClient();

  const { data: payment, error } = await supabase
    .from("payments")
    .select("status")
    .eq("checkout_request_id", checkoutRequestId)
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not fetch payment status" }, { status: 500 });
  }

  return NextResponse.json({ status: payment.status });
}
