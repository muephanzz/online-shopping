const fetch = require("node-fetch");

export async function getAccessToken() {
  const url = `https://${process.env.MPESA_ENV}.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`;

  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw new Error("Failed to get access token");
  }
}

export function generatePassword() {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_TILL_NUMBER}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString("base64");

  return { password, timestamp };
}

export async function stkPush(phone, amount) {
  const accessToken = await getAccessToken();
  const { password, timestamp } = generatePassword();

  const url = `https://${process.env.MPESA_ENV}.safaricom.co.ke/mpesa/stkpush/v1/processrequest`;

  const payload = {
    BusinessShortCode: process.env.MPESA_TILL_NUMBER,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerBuyGoodsOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.MPESA_TILL_NUMBER,
    PhoneNumber: phone,
    AccountReference: "Ephantronics",
    TransactionDesc: "Payment for goods",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    console.error("Error in STK Push:", error);
    throw new Error("Failed to initiate payment");
  }
}
