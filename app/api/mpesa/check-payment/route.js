// --- File: app/api/mpesa/check-payment/route.js ---

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  try {
    const { checkoutRequestId } = await req.json();

    if (!checkoutRequestId) return NextResponse.json({ error: "Missing request ID" }, { status: 400 });

    const { data, error } = await supabase
      .from("payments")
      .select("status")
      .eq("checkout_request_id", checkoutRequestId)
      .single();

    if (error) throw new Error("Unable to check payment status");

    return NextResponse.json({ status: data?.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
