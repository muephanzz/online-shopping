import { businessBuyGoods } from '../../lib/mpesa';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { amount, partyB, accountReference, requester } = req.body;
        const result = await businessBuyGoods(amount, partyB, accountReference, requester);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
