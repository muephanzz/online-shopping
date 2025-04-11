// This function checks payment status using the M-Pesa API
export async function verifyPayment(checkoutRequestId) {
    try {
      const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
        method: "POST",
        headers: {
          "Authorization": `Bearer YOUR_ACCESS_TOKEN`, // Replace with your real M-Pesa access token
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          CheckoutRequestID: checkoutRequestId,
        }),
      });
  
      const data = await response.json();
      
      // Check if payment was successful
      if (data.ResultCode === 0) {
        return { success: true, message: "Payment successful" };
      } else {
        return { success: false, message: data.ResultDesc }; // Return failure message if payment failed
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      return { success: false, message: "Error verifying payment" };
    }
  }
  