export async function GET() {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortcode = process.env.MPESA_SHORTCODE;
  
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  
    try {
      const tokenRes = await fetch(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
          headers: { Authorization: `Basic ${auth}` },
        }
      );
      const { access_token } = await tokenRes.json();
  
      const body = {
        ShortCode: shortcode,
        ResponseType: "Completed",
        ConfirmationURL: `${process.env.BASE_URL}/api/mpesa/confirm`,
        ValidationURL: `${process.env.BASE_URL}/api/mpesa/validate`,
      };
  
      const res = await fetch("https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
  
      const data = await res.json();
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (err) {
      console.error("Register URL Error:", err);
      return new Response("Register URL Failed", { status: 500 });
    }
  }
  