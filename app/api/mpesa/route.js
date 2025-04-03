import axios from "axios";
import { getMpesaAccessToken } from "../../lib/mpesaConfig";

const { MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL } = process.env;

export async function POST(req) {
  try {
    const body = await req.json(); // Read JSON body
    const { amount, phone, user_id, checkoutItems, shipping_address } = body;

    if (!amount || !phone || !user_id || !checkoutItems) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerBuyGoodsOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: "Order12345",
      TransactionDesc: "Payment for Order",
    };

    const { data } = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return new Response(JSON.stringify({ ...data, user_id, checkoutItems, shipping_address }), { status: 200 });
  } catch (error) {
    console.error("M-Pesa STK Push Error:", error.response?.data || error.message);
    return new Response(JSON.stringify({ error: "Failed to process STK Push" }), { status: 500 });
  }
}
