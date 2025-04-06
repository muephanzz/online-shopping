import { NextResponse } from 'next/server';

export async function POST(req) {
  const { phone } = await req.json();
  
  // Validate phone number
  if (!phone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  try {
    // Query the payment status from Supabase based on phone number or other criteria
    const { data, error } = await supabase
      .from('payments')
      .select('status, error_message')
      .eq('phone_number', phone)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw new Error(error.message);
    
    if (data?.length > 0 && data[0].status === 'paid') {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: data?.[0]?.error_message || 'Payment not found' }, { status: 400 });

  } catch (error) {
    console.error("Error verifying payment status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
