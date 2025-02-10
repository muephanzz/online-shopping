export default function handler(req, res) {
    const { Body } = req.body;
  
    if (!Body || !Body.stkCallback) {
      return res.status(400).json({ error: 'Invalid callback data' });
    }
  
    const callback = Body.stkCallback;
    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;
  
    if (resultCode === 0) {
      console.log('Payment Successful:', callback);
      // Update order status in database here
      res.status(200).json({ message: 'Payment successful' });
    } else {
      console.error('Payment Failed:', resultDesc);
      // Log the failure and notify the user if necessary
      res.status(200).json({ message: 'Payment failed', details: resultDesc });
    }
  }
  