export default async function handler(req, res) {
  console.log("M-Pesa Callback Received:", req.body);

  if (!req.body.Body) {
    return res.status(400).json({ error: "Invalid callback data" });
  }

  const { Body } = req.body;
  const resultCode = Body.stkCallback.ResultCode;

  if (resultCode === 0) {
    const transactionData = Body.stkCallback.CallbackMetadata;
    console.log("Payment Successful:", transactionData);
    return res.status(200).json({ message: "Payment successful", data: transactionData });
  } else {
    console.log("Payment Failed:", Body.stkCallback.ResultDesc);
    return res.status(400).json({ error: Body.stkCallback.ResultDesc });
  }
}
