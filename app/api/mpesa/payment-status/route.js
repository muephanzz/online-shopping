import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");

    const { data, error } = await supabase
      .from("payments")
      .select("status")
      .eq("checkout_request_id", checkoutRequestId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ status: data.status }, { status: 200 });
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
