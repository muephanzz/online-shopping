import { supabase } from "../../lib/supabaseClient";

export async function POST(req) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone number is required" }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("phone_number", phone)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return new Response(JSON.stringify({ success: false }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Payment Check Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
