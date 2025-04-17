import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("Received Validation from Safaricom:", body);

    // Optionally validate here (e.g. check against orders)

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("Validation Error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Rejected" }, { status: 500 });
  }
}
