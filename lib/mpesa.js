import axios from 'axios';

export async function businessBuyGoods(amount, partyB, accountReference, requester) {
    try {
        const { data: tokenData } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/access-token`);
        const accessToken = tokenData.access_token;

        const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest", {
            Initiator: process.env.MPESA_INITIATOR_NAME,
            SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
            CommandID: "BusinessBuyGoods",
            SenderIdentifierType: "4",
            RecieverIdentifierType: "4",
            Amount: amount,
            PartyA: process.env.MPESA_SHORTCODE,
            PartyB: partyB,
            AccountReference: accountReference,
            Requester: requester,
            Remarks: "OK",
            QueueTimeOutURL: process.env.MPESA_QUEUE_TIMEOUT_URL,
            ResultURL: process.env.MPESA_RESULT_URL
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        return response.data;
    } catch (error) {
        console.error("M-Pesa Request Error:", error.response?.data || error.message);
        throw new Error("Failed to process payment");
    }
}
