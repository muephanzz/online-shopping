import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("M-Pesa Callback Response:", data);

    return NextResponse.json({ message: "Callback received" }, { status: 200 });
  } catch (error) {
    console.error("Error handling callback:", error);
    return NextResponse.json({ error: "Failed to process callback" }, { status: 500 });
  }
}
