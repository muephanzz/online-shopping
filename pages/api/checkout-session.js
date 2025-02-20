import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { cartItems, name, address, email } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      customer_email: email,
      metadata: {
        cartItems: JSON.stringify(cartItems),
        shippingDetails: JSON.stringify({ address }),
      },
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name, images: [item.image_url] },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      })),
    });    

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
