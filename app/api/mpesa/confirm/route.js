import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const body = await req.json();

    // Example: store confirmation data
    await supabase.from("mpesa_confirmations").insert({
      transaction: body,
    });

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Confirmation error:", error);
    return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: "Rejected" }), {
      status: 500,
    });
  }
}
