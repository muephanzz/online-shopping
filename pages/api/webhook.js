import { supabase } from "../../lib/supabaseClient";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  let event;

  // Verify the Stripe signature
  const signature = req.headers["stripe-signature"];
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const { customer_email, metadata } = session;
    const cartItems = JSON.parse(metadata.cartItems);
    const shippingDetails = JSON.parse(metadata.shippingDetails);

    try {
      const { error } = await supabase.from("orders").insert([
        {
          email: customer_email,
          items: cartItems,
          total: session.amount_total / 100,
          shipping_address: shippingDetails.address,
          status: "paid",
          created_at: new Date(),
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving order to Supabase:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(200).json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
