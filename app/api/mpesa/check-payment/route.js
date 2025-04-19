import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { checkoutRequestId } = await req.json();

    if (!checkoutRequestId) {
      return NextResponse.json({ error: "Missing checkoutRequestId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("payments")
      .select("status")
      .eq("checkout_request_id", checkoutRequestId)
      .single();

    if (error) {
      console.error("Check Payment Error:", error.message);
      return NextResponse.json({ error: "Payment check failed" }, { status: 500 });
    }

    return NextResponse.json({ status: data.status });
  } catch (err) {
    console.error("Check Payment Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
