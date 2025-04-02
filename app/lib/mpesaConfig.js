import axios from "axios";

const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;

export const getMpesaAccessToken = async () => {
  try {
    const auth =
      "Basic " +
      Buffer.from(MPESA_CONSUMER_KEY + ":" + MPESA_CONSUMER_SECRET).toString("base64");

    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: auth,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("M-Pesa Access Token Error:", error);
    throw new Error("Failed to get M-Pesa access token");
  }
};
