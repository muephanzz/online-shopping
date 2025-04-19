import axios from "axios";

let accessToken = null;
let tokenExpiry = 0;

// 🔐 Generate new access token
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const { data } = await axios.get(
    `${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  accessToken = data.access_token;
  tokenExpiry = Date.now() + 3590 * 1000; // Almost 1 hour
  return accessToken;
}

// 📲 Send STK Push request
export async function stkPush({ phone, amount, checkoutRequestId }) {
  const token = await getAccessToken();

  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:Z.]/g, "")
    .slice(0, 14);

  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString("base64");

  const body = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: `${process.env.BASE_URL}/api/mpesa/callback`,
    AccountReference: "MueStore",
    TransactionDesc: "Order Payment",
  };

  const { data } = await axios.post(
    `${process.env.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return data;
}
