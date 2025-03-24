import axios from "axios";
import { getMpesaAccessToken } from "../../lib/mpesaConfig";
import dotenv from "dotenv";

dotenv.config();

const { MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL } = process.env;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { amount, phone } = req.body;
  
  if (!amount || !phone) {
    return res.status(400).json({ error: "Amount and phone number are required" });
  }

  try {
    const accessToken = await getMpesaAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

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

    return res.status(200).json(data);
  } catch (error) {
    console.error("M-Pesa STK Push Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to process STK Push" });
  }
}
