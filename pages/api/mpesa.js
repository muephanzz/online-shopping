import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, amount } = req.body;

  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = 'https://yourdomain.com/api/mpesa-callback';

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    // Step 1: Get access token
    const { data: tokenResponse } = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );

    const accessToken = tokenResponse.access_token;

    // Step 2: Format timestamp and password
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    // Step 3: Initiate STK Push request
    const { data: stkResponse } = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: 'MyStorePayment',
        TransactionDesc: 'Payment for goods',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Handle response from M-Pesa API
    if (stkResponse.ResponseCode === '0') {
      res.status(200).json({ message: 'STK Push initiated. Check your phone.', response: stkResponse });
    } else {
      res.status(400).json({ error: 'STK Push initiation failed', details: stkResponse });
    }

  } catch (error) {
    console.error('M-Pesa Error:', error?.response?.data || error.message);

    // Handle network errors or API failures
    if (error.response) {
      const { status, data } = error.response;

      if (status === 400) {
        res.status(400).json({ error: 'Invalid request to M-Pesa', details: data });
      } else if (status === 401) {
        res.status(401).json({ error: 'Unauthorized. Check your API credentials.', details: data });
      } else if (status === 500) {
        res.status(500).json({ error: 'M-Pesa server error. Try again later.', details: data });
      } else {
        res.status(status).json({ error: 'Unexpected error', details: data });
      }
    } else {
      res.status(500).json({ error: 'Network error or M-Pesa service unavailable', details: error.message });
    }
  }
}
