import axios from 'axios';

export default async function handler(req, res) {
    try {
        const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');

        const { data } = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: {
                Authorization: `Basic ${auth}`
            }
        });

        res.status(200).json({ access_token: data.access_token });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate access token" });
    }
}
